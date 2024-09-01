import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EMPTY, Observable } from 'rxjs';

import { TPhraseMergeBody } from './phrase-merge.schemas';

function getBranchFromAzure(fullBranch: string): string {
    return fullBranch.split('/').pop();
}

@Injectable()
export class PhraseMergeValidBodyInterceptor implements NestInterceptor {
    public intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T | never> {
        const request: Request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();

        const getError$ = (message: string): Observable<never> => {
            response.status(200).json({
                message,
            });

            return EMPTY;
        };

        const body: TPhraseMergeBody | null = request.body;
        const headerTargetBranch: string | null = request.header('targetBranch');

        if (!body) {
            throw new HttpException(`set body`, HttpStatus.BAD_REQUEST);
        }

        const {
            eventType = '',
            resource,
        }: { eventType: string; resource: TPhraseMergeBody['resource'] } = body;

        if (eventType !== 'git.pullrequest.merged') {
            return getError$(
                `eventType will be 'git.pullrequest.merged'. Current eventType ${eventType}`,
            );
        }

        const { sourceRefName, targetRefName, status } = resource;

        if (status !== 'completed') {
            return getError$(
                'Incorrect status of merge request. Status will be equal "completed" ' +
                    `Current status ${status}`,
            );
        }

        const sourceBranch = getBranchFromAzure(sourceRefName);
        const targetBranch = getBranchFromAzure(targetRefName);

        if (sourceBranch === 'master') {
            return getError$(`Merge allow for only non master branches`);
        }

        const availableTargetBranch = headerTargetBranch ?? 'master';
        if (targetBranch !== availableTargetBranch) {
            return getError$(
                `only for PR on ${availableTargetBranch}. Current branch ${targetRefName}`,
            );
        }

        const repo: TPhraseMergeBody['resource']['repository'] = resource.repository;
        const name = repo.name;

        if (!name) {
            return getError$(`Invalid repo name. Current name is ${name}`);
        }
        request.query.project = name;
        request.query.branch = sourceBranch;

        return next.handle();
    }
}
