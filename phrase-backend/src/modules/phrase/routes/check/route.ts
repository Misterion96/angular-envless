import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Job, Translation } from 'phrase-js';
import { catchError, concatMap, lastValueFrom, Observable, of, switchMap, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    IBranchMetaCompare,
    PhraseBranchesService,
    PhraseJobsService,
    PhraseProjectsService,
    PhraseTranslationsService,
    TBranchCompare,
} from '../../services/phrase-js';
import { IPhraseRouteHandler } from '../phrase-route-handler.interface';
import { PhraseCheckQuerySchema } from './schemas';

interface IBranchCompareResultData<T = unknown> {
    data: ReadonlyArray<T> | T;
    length: number;
    sourceError: 'BRANCH_COMPARE' | 'JOBS' | 'TRANSLATIONS';
}

export type TPhraseCheckResult = null;

const INITIAL_COMPARE_RESULT: IBranchCompareResultData<TBranchCompare> = {
    data: {},
    length: 0,
    sourceError: 'BRANCH_COMPARE',
};

@Injectable()
export class PhraseCheckRouteHandler
    implements IPhraseRouteHandler<PhraseCheckQuerySchema, TPhraseCheckResult>
{
    constructor(
        private readonly branches: PhraseBranchesService,
        private readonly projects: PhraseProjectsService,
        private readonly translations: PhraseTranslationsService,
        private readonly jobs: PhraseJobsService,
    ) {}

    public async handle$(params: PhraseCheckQuerySchema): Promise<TPhraseCheckResult> {
        const { project, branch } = params;
        const projectId = await lastValueFrom(this.projects.getProjectId$(project));

        const result$ = of(
            this.getConflictsFromJobs$.bind(this),
            this.getConflictsFromTranslations$.bind(this),
            this.getConflictsFromBranchCompare$.bind(this),
        ).pipe(
            concatMap(request$ => request$(projectId, branch)),
            switchMap(response =>
                Boolean(response.length) ? this.createException$(response) : of(null),
            ),
            catchError((e: unknown) => {
                const httpError = e as HttpException;
                const status = httpError.getStatus();

                return status === 404 ? of(null) : throwError(() => httpError);
            }),
        );

        return lastValueFrom(result$);
    }

    private createException$(response: unknown): Observable<never> {
        return throwError(() => new HttpException(response, HttpStatus.CONFLICT));
    }

    private getConflictsFromBranchCompare$(
        projectId: string,
        branchName: string,
    ): Observable<IBranchCompareResultData<TBranchCompare>> {
        return this.branches
            .branchCompare$({
                name: branchName,
                projectId,
            })
            .pipe(
                map((response: TBranchCompare) => this.getOnlyConflicts(response)),
                map(entries => {
                    return entries.reduce<IBranchCompareResultData<TBranchCompare>>(
                        (result, [category, { conflicts }]) => {
                            return {
                                ...result,
                                data: {
                                    ...result.data,
                                    [category]: { conflicts },
                                },
                                length: result.length + conflicts.length,
                            };
                        },
                        INITIAL_COMPARE_RESULT,
                    );
                }),
            );
    }

    private getConflictsFromJobs$(
        projectId: string,
        branchName: string,
    ): Observable<IBranchCompareResultData<Job>> {
        return this.jobs
            .jobList$({
                branch: branchName,
                projectId,
                state: 'in_progress',
            })
            .pipe(
                map(jobs => {
                    return {
                        data: jobs,
                        length: jobs.length,
                        sourceError: 'JOBS',
                    };
                }),
            );
    }

    private getConflictsFromTranslations$(
        projectId: string,
        branchName: string,
    ): Observable<IBranchCompareResultData<Translation>> {
        return this.translations
            .translationsList$({
                projectId,
                branch: branchName,
                q: `unverified:true`,
            })
            .pipe(
                map(data => {
                    return {
                        data,
                        length: data.length,
                        sourceError: 'TRANSLATIONS',
                    };
                }),
            );
    }

    private getOnlyConflicts(response: TBranchCompare): [string, IBranchMetaCompare][] {
        return Object.entries<IBranchMetaCompare>(response).filter(([, { conflicts }]) =>
            Boolean(conflicts.length),
        );
    }
}
