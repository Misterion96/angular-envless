import { Injectable } from '@nestjs/common';
import { Archiver } from 'archiver';
import { Response } from 'express';
import { Branch, Locale } from 'phrase-js';
import { defer, lastValueFrom, mergeAll, mergeMap, Observable, switchMap, toArray } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    ILocaleDownloadRequest2,
    PhraseBranchesService,
    PhraseLocalesService,
    PhraseProjectsService,
} from '../../services/phrase-js';
import { IPhraseRouteHandler } from '../phrase-route-handler.interface';
import { PhraseDownloadQuerySchema } from './phrase-download.schemas';

const archiver = require('archiver');

type TDownloadTranslationsResult = { data: string; fileName: string }[];

interface IDownloadTranslationsParams {
    response: Response;
    queryParams: PhraseDownloadQuerySchema;
}

@Injectable()
export class PhraseDownloadRouteHandler
    implements IPhraseRouteHandler<IDownloadTranslationsParams, void>
{
    constructor(
        private readonly projects: PhraseProjectsService,
        private readonly branches: PhraseBranchesService,
        private readonly locales: PhraseLocalesService,
    ) {}

    public async handle$(params: IDownloadTranslationsParams): Promise<void> {
        const {
            response,
            queryParams: { project, branch },
        }: IDownloadTranslationsParams = params;

        const projectId: string = await this.projects.getProjectId(project);
        const branchName: string | undefined = await this.getBranchName(projectId, branch);

        const request$: Observable<void> = this.locales
            .localesList$({ projectId, branch: branchName })
            .pipe(
                mergeAll(),
                mergeMap(locale =>
                    this.getTranslationTextByLocale$(projectId, locale, branchName).pipe(
                        map(data => {
                            return {
                                data,
                                fileName: `${locale.name}.vendor.json`,
                            };
                        }),
                    ),
                ),
                toArray(),
                switchMap(translations => this.zipTranslations$(translations, response, project)),
            );

        return lastValueFrom(request$);
    }

    private getTranslationTextByLocale$(
        projectId: string,
        locale: Locale,
        branch?: string,
    ): Observable<string> {
        const requestOptions: ILocaleDownloadRequest2 = this.getLocaleDownloadRequestOptions(
            projectId,
            locale,
            branch,
        );

        return this.locales
            .downloadLocale$(requestOptions)
            .pipe(switchMap(blob => defer(async (): Promise<string> => blob.text())));
    }

    private getLocaleDownloadRequestOptions(
        projectId: string,
        locale: Locale,
        branch?: string,
    ): ILocaleDownloadRequest2 {
        const commonOptions: Pick<
            ILocaleDownloadRequest2,
            'branch' | 'fileFormat' | 'id' | 'includeTranslatedKeys' | 'projectId'
        > = {
            fileFormat: 'i18next_4',
            branch,
            projectId,
            id: locale.id,
            includeTranslatedKeys: true,
        };

        // если ветка основная, она не должна иметь сырые переводы
        if (!branch) {
            return commonOptions;
        }

        // если ветка разработки, то она может иметь не верифицированные переводы
        return {
            ...commonOptions,
            includeEmptyTranslations: true,
            includeUnverifiedTranslations: true,
        };
    }
    private zipTranslations$(
        translations: TDownloadTranslationsResult,
        response: Response,
        project: string,
    ): Observable<void> {
        response.attachment(`${project}.zip`).type('zip');

        const archive: Archiver = archiver('zip', {
            zlib: { level: 9 },
        });

        archive.on('end', () => response.end());
        archive.on('error', () => response.end());
        archive.on('close', () => response.end());
        archive.pipe(response);

        for (const { data, fileName } of translations) {
            archive.append(data, {
                name: fileName,
                date: new Date(),
            });
        }

        return defer(async () => archive.finalize());
    }

    private async getBranchName(
        projectId: string,
        currentName: string,
    ): Promise<string | undefined> {
        if (currentName === 'master') {
            return undefined;
        }

        const phraseBranch: Branch | null = await this.branches.isBranchExist({
            projectId,
            name: currentName,
        });

        return phraseBranch ? phraseBranch.name : undefined;
    }
}
