import { Inject, Injectable } from '@nestjs/common';
import { Translation, TranslationsApi, TranslationsListRequest } from 'phrase-js';
import { Observable } from 'rxjs';

import { PhraseConfigurationService } from './configuration.service';
import { phrasePromiseToObservable } from './helpers/phrase-promise-to-observable';

@Injectable()
export class PhraseTranslationsService {
    private readonly translationsApi: TranslationsApi = new TranslationsApi(this.configuration);

    constructor(
        @Inject(PhraseConfigurationService)
        private readonly configuration: PhraseConfigurationService,
    ) {}

    public translationsList$(
        requestParameters: TranslationsListRequest,
    ): Observable<Array<Translation>> {
        return phrasePromiseToObservable(async () =>
            this.translationsApi.translationsList(requestParameters),
        );
    }
}
