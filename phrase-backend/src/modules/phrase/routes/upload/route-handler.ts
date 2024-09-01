import { Injectable, Logger } from '@nestjs/common';
import { AffectedResources, Branch, BranchShowRequest, Locale, Upload } from 'phrase-js';
import { lastValueFrom, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { TCompareObjectsResult } from '../../services/compare-objects';
import { FilesStorageService } from '../../services/files-storage';
import {
    IUploadCreateRequest2,
    PhraseBranchesService,
    PhraseKeysService,
    PhraseLocalesService,
    PhraseProjectsService,
    PhraseUploadService,
} from '../../services/phrase-js';
import { IPhraseRouteHandler } from '../phrase-route-handler.interface';
import { CompareUploadFileService } from './compare-upload-file.service';

const fs = require('node:fs');

export interface IUploadFileToBranchParams {
    project: string;
    branch: string;
    file: Express.Multer.File;
}

export type TUploadFileToBranchResult = Upload | string;

@Injectable()
export class PhraseUploadRouteHandler
    implements IPhraseRouteHandler<IUploadFileToBranchParams, TUploadFileToBranchResult>
{
    constructor(
        private readonly projects: PhraseProjectsService,
        private readonly branches: PhraseBranchesService,
        private readonly locales: PhraseLocalesService,
        private readonly uploadService: PhraseUploadService,
        private readonly keys: PhraseKeysService,
        private readonly logger: Logger,
        private readonly filesStorageService: FilesStorageService,
        private readonly compareUploadService: CompareUploadFileService,
    ) {}

    public async handle$(params: IUploadFileToBranchParams): Promise<TUploadFileToBranchResult> {
        const { project: projectName, branch: branchName, file } = params;
        const { path } = file;

        const projectId: string = await this.projects.getProjectId(projectName);

        const diffs: TCompareObjectsResult | null = await this.compareUploadService.checkDiffs(
            projectId,
            branchName,
            path,
        );

        if (!diffs) {
            this.deleteCandidateFile(path);

            return Promise.resolve('Nothing to upload. Data is equal');
        }

        const locales: Locale[] = await this.getLocalesByBranch$(projectId, branchName);
        const defaultLocale: Locale = locales.filter(l => l._default).shift();

        const upload: Upload = await this.upload({
            defaultLocale,
            branchName,
            path,
            projectId,
        });

        if (diffs.deleted.length > 0) {
            await this.deleteKeys({
                projectId,
                branchName,
                collection: diffs.deleted,
            });
        }

        return upload;
    }

    private async upload(data: {
        projectId: string;
        branchName: string;
        defaultLocale: Locale;
        path: string;
    }): Promise<Upload> {
        const { projectId, branchName, defaultLocale, path } = data;

        const params: IUploadCreateRequest2 = this.prepareUploadParams(
            projectId,
            branchName,
            defaultLocale,
            path,
        );

        const result$: Observable<Upload> = this.uploadService.uploadCreate$(params).pipe(
            tap(upload => this.log('upload', `Upload created ${upload.id} for ${params.branch}`)),
            tap(() => this.deleteCandidateFile(path)),
        );

        return lastValueFrom(result$);
    }

    private async deleteKeys(data: {
        projectId: string;
        branchName: string;
        collection: string[];
    }): Promise<AffectedResources> {
        const { projectId, branchName, collection } = data;

        const result$: Observable<AffectedResources> = this.keys.keysDeleteCollection$({
            branch: branchName,
            projectId,
            q: `name:${collection.join(',')}`,
        });

        return lastValueFrom(result$);
    }

    private async getLocalesByBranch$(projectId: string, branchName: string): Promise<Locale[]> {
        const result$: Observable<Locale[]> = this.locales
            .localesList$({
                branch: branchName,
                projectId: projectId,
            })
            .pipe(
                tap(locales =>
                    this.log(
                        'locales',
                        `Locales list [${locales.map(l => l.name)}] by branch:"${branchName}"`,
                    ),
                ),
            );

        return lastValueFrom(result$);
    }

    private prepareUploadParams(
        projectId: string,
        branchName: string,
        locale: Locale,
        path: string,
    ): IUploadCreateRequest2 {
        return {
            projectId,
            localeId: locale.id,
            branch: branchName,
            fileFormat: 'react_nested_json',
            tags: `branch-${branchName}`,
            fileEncoding: 'UTF-8',
            file: fs.createReadStream(path),
            autotranslate: 'true',
            updateDescriptions: 'true',
            updateTranslations: 'true',
        };
    }

    private async upsertBranch(requestParameters: BranchShowRequest): Promise<Branch> {
        const { projectId, name } = requestParameters;

        const createBranch$ = this.branches
            .branchCreate$({
                projectId,
                branchCreateParameters: {
                    name,
                },
            })
            .pipe(tap(() => this.log('branch', `Created branch by name "${name}"`)));

        const result$: Observable<Branch> = this.branches.isBranchExist$(requestParameters).pipe(
            tap(branch => {
                this.log(
                    'branch',
                    branch
                        ? `Branch "${branch.name}" is exist`
                        : `Branch "${requestParameters.name}" isn't exist`,
                );
            }),
            switchMap(branch => (branch ? of(branch) : createBranch$)),
        );

        return lastValueFrom(result$);
    }

    private log(scope: 'branch' | 'jobs' | 'locales' | 'upload', message: string): void {
        this.logger.log(`[${scope.toUpperCase()}]\t ${message}`);
    }

    private deleteCandidateFile(path: string): void {
        this.filesStorageService.deleteFile(path);
    }
}
