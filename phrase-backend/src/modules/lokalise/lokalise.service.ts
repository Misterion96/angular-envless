import { Branch, LokaliseApi, QueuedProcess } from '@lokalise/node-api';
import { Injectable, Logger } from '@nestjs/common';
import { defer, Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

const projects = {
    'noda-angular': '9400421964384d773681b3.37734516',
    'noda-static': '7920134764465b91ce5c36.03502256',
};

type BranchMerged = {
    project_id: string;
    branch_merged: boolean;
    branch: Branch;
    target_branch: Branch;
};

type BranchDeleted = {
    project_id: string;
    branch_deleted: boolean;
};

type FilesPrepared = {
    project_id: string;
    branch: string | 'master';
    bundle_url: string;
};

@Injectable()
export class LokaliseService {
    private readonly lokalise: LokaliseApi;

    constructor(private readonly logger: Logger) {
        this.lokalise = new LokaliseApi({
            apiKey: '82a74e6367c0b406eae19b8dcd018f3af7f50add',
        });
    }

    public deleteBranch$(
        project: string,
        branch: Branch,
    ): Observable<BranchDeleted & { branch: Branch }> {
        return defer(() =>
            this.lokalise.branches().delete(branch.branch_id, {
                project_id: this.getProjectId(project),
            }),
        ).pipe(
            map(response => {
                return {
                    ...response,
                    branch,
                };
            }),
            tap(() => this.logger.log(`Branch "${branch.name}" deleted`)),
        );
    }

    public onMergeBranch$(project: string, name: string): Observable<BranchMerged> {
        return this.findBranch$(project, name).pipe(
            switchMap(branch => {
                return branch
                    ? defer(() =>
                          this.lokalise.branches().merge(
                              branch.branch_id,
                              {
                                  project_id: this.getProjectId(project),
                              },
                              {
                                  force_conflict_resolve_using: 'source',
                              },
                          ),
                      )
                    : throwError(() => new Error(`Branch "${name}" not exist`));
            }),
            tap(e => this.logger.log(`Branch "${e.branch.name}" was merged`)),
        );
    }

    public onUploadFileToBranch$(
        file: Express.Multer.File,
        project: string,
        branchName: string,
    ): Observable<QueuedProcess> {
        return this.upsertBranch$(project, branchName).pipe(
            switchMap(() => {
                const { buffer, originalname } = file;

                const base64Data = buffer.toString('base64');
                const projectId = `${this.getProjectId(project)}:${branchName}`;

                return this.uploadFileToProject$(projectId, {
                    data: base64Data,
                    filename: originalname,
                    tags: [branchName],
                });
            }),
        );
    }

    private createBranch$(project: string, name: string): Observable<Branch> {
        const project_id = this.getProjectId(project);

        return defer(() => {
            return this.lokalise.branches().create({ name }, { project_id });
        }).pipe(tap(() => this.logger.log(`Branch "${name}" created`)));
    }

    private findBranch$(project: string, name: string): Observable<Branch> {
        return this.getBranches$(project).pipe(
            map(branches => branches.find(b => b.name === name)),
            tap(branch =>
                this.logger.log(`Branch "${name}" is${Boolean(branch) ? ' ' : ' not '}exist`),
            ),
        );
    }

    private getBranches$(project: string): Observable<Branch[]> {
        const project_id = this.getProjectId(project);

        return defer(() => this.lokalise.branches().list({ project_id })).pipe(
            map(branches => branches.items),
        );
    }

    private getProjectId(project): string {
        return projects[project];
    }

    private uploadFileToProject$(
        projectId: string,
        options: { filename: string; data: string; tags: string[] },
    ): Observable<QueuedProcess> {
        return defer(() =>
            this.lokalise.files().upload(projectId, {
                ...options,
                cleanup_mode: true,
                skip_detect_lang_iso: true,
                lang_iso: 'en',
                format: 'json',
            }),
        ).pipe(tap(() => this.logger.log(`Upload file "${options.filename}" to "${projectId}"`)));
    }

    private upsertBranch$(project: string, name: string): Observable<Branch> {
        return this.findBranch$(project, name).pipe(
            switchMap(branch => {
                return Boolean(branch) ? of(branch) : this.createBranch$(project, name);
            }),
        );
    }

    public onFilesDownload$(projectName: string): Observable<string> {
        const projectId = this.getProjectId(projectName);

        return defer(() => {
            return this.lokalise.files().download(projectId, {
                format: 'json',
                original_filenames: false,
                bundle_structure: '%LANG_ISO%.vendor.json',
                export_empty_as: 'base',
                compact: true,
            }) as Promise<FilesPrepared>;
        }).pipe(
            tap(({ bundle_url }) => this.logger.log(`Bundle url "${bundle_url}"`)),
            map(({ bundle_url }) => bundle_url),
        );
    }
}
