import { Injectable } from '@nestjs/common';
import { AffectedResources, KeysApi, KeysDeleteCollectionRequest, TranslationKey } from 'phrase-js';
import { KeysListRequest } from 'phrase-js/src/apis/KeysApi';
import { Observable } from 'rxjs';

import { PhraseConfigurationService } from './configuration.service';
import { phrasePromiseToObservable } from './helpers/phrase-promise-to-observable';

@Injectable()
export class PhraseKeysService {
    private readonly keysApi: KeysApi = new KeysApi(this.configuration);

    constructor(private readonly configuration: PhraseConfigurationService) {}

    public keysDeleteCollection$(
        requestParameters: KeysDeleteCollectionRequest,
    ): Observable<AffectedResources> {
        return phrasePromiseToObservable(async () =>
            this.keysApi.keysDeleteCollection(requestParameters),
        );
    }

    public getAll(params: KeysListRequest): Promise<TranslationKey[]>{
        return this.keysApi.keysList(params)
    }

    public delete(requestParameters: KeysDeleteCollectionRequest): Promise<AffectedResources>{
        return this.keysApi.keysDeleteCollection(requestParameters)
    }
}
