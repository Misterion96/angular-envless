/* eslint-disable @typescript-eslint/naming-convention */
import { HttpException, Injectable } from '@nestjs/common';
import {
    Branch,
    BranchDeleteRequest,
    BranchesApi,
    BranchesListRequest,
    BranchMergeRequest,
    BranchShowRequest,
    BranchUpdateRequest,
} from 'phrase-js';
import { BranchCompareRequest, BranchCreateRequest } from 'phrase-js/src/apis/BranchesApi';
import { catchError, lastValueFrom, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { PhraseConfigurationService } from './configuration.service';
import { phrasePromiseToObservable } from './helpers/phrase-promise-to-observable';

export interface IBranchMetaCompare<T = unknown> {
    conflicts: T[];
    main_changes?: unknown[];
    branch_changes?: unknown[];
}

type TBranchCompareCategories =
    | 'locales'
    | 'screenshots_translation_keys'
    | 'screenshots'
    | 'translation_keys'
    | 'translations';

export type TBranchCompare<T extends TBranchCompareCategories = TBranchCompareCategories> = {
    [P in T as string]: IBranchMetaCompare;
};

@Injectable()
export class PhraseBranchesService {
    private readonly branchesApi: BranchesApi = new BranchesApi(this.configuration);

    constructor(private readonly configuration: PhraseConfigurationService) {}

    public branchCreate$(requestParameters: BranchCreateRequest): Observable<Branch> {
        return phrasePromiseToObservable(async () =>
            this.branchesApi.branchCreate(requestParameters),
        );
    }

    public branchDelete$<T>(requestParameters: BranchDeleteRequest): Observable<T> {
        return phrasePromiseToObservable(async () =>
            this.branchesApi.branchDelete(requestParameters),
        );
    }

    public branchMerge$(requestParameters: BranchMergeRequest): Observable<void> {
        return phrasePromiseToObservable(async () =>
            this.branchesApi.branchMerge(requestParameters),
        );
    }

    public branchShow$(requestParameters: BranchShowRequest): Observable<Branch> {
        return phrasePromiseToObservable(async () =>
            this.branchesApi.branchShow(requestParameters),
        );
    }

    public branchUpdate$(requestParameters: BranchUpdateRequest): Observable<Branch> {
        return phrasePromiseToObservable(async () =>
            this.branchesApi.branchUpdate(requestParameters),
        );
    }

    public branchesList$(requestParameters: BranchesListRequest): Observable<Array<Branch>> {
        return phrasePromiseToObservable(async () =>
            this.branchesApi.branchesList(requestParameters),
        );
    }

    public branchCompare$(requestParameters: BranchCompareRequest): Observable<TBranchCompare> {
        return phrasePromiseToObservable(async () =>
            this.branchesApi.branchCompare(requestParameters),
        ).pipe(map((response: string) => JSON.parse(response)));
    }

    public isBranchExist$(requestParameters: BranchShowRequest): Observable<Branch | null> {
        return this.branchShow$(requestParameters).pipe(
            catchError((e: unknown) => {
                const status = (e as HttpException).getStatus();

                return status === 404 ? of(null) : throwError(() => e);
            }),
        );
    }

    public async isBranchExist(requestParameters: BranchShowRequest): Promise<Branch | null> {
        return lastValueFrom(this.isBranchExist$(requestParameters));
    }
}
