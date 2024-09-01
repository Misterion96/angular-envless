import { Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, Observable, of } from 'rxjs';

import { PhraseBranchesService, PhraseProjectsService } from '../../services/phrase-js';
import { IPhraseRouteHandler } from '../phrase-route-handler.interface';
import { IPhraseMergeQuery } from './phrase-merge.schemas';

export type TMergeFeatureBranchResult = never | void;

@Injectable()
export class PhraseMergeRouteHandler
    implements IPhraseRouteHandler<IPhraseMergeQuery, TMergeFeatureBranchResult>
{
    constructor(
        private readonly branches: PhraseBranchesService,
        private readonly projects: PhraseProjectsService,
    ) {}

    public async handle$(params: IPhraseMergeQuery): Promise<TMergeFeatureBranchResult> {
        const { project, branch } = params;
        const projectId = await lastValueFrom(this.projects.getProjectId$(project));

        const result$ = this.branches
            .branchMerge$({
                name: branch,
                projectId,
                branchMergeParameters: {
                    strategy: 'use_master',
                },
            })
            .pipe(catchError((e: unknown) => of(e) as Observable<void>));

        return lastValueFrom(result$);
    }
}
