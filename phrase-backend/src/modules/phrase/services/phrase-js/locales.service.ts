import { Injectable } from '@nestjs/common';
import { Locale, LocalesApi, LocalesListRequest } from 'phrase-js';
import {
    LocaleCreateRequest,
    LocaleDeleteRequest,
    LocaleDownloadRequest,
    LocaleShowRequest
} from 'phrase-js/src/apis/LocalesApi';
import { LocaleDetails } from 'phrase-js/src/models';
import { lastValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TFileFormats } from '../../types/file-formats.types';
import { PhraseConfigurationService } from './configuration.service';
import { phrasePromiseToObservable } from './helpers/phrase-promise-to-observable';

export interface ILocaleDownloadRequest2 extends LocaleDownloadRequest {
    fileFormat: TFileFormats;
}

@Injectable()
export class PhraseLocalesService {
    private readonly localesApi: LocalesApi = new LocalesApi(this.configuration);

    constructor(private readonly configuration: PhraseConfigurationService) {}

    public localesList$(requestParameters: LocalesListRequest): Observable<Array<Locale>> {
        return phrasePromiseToObservable(async () =>
            this.localesApi.localesList(requestParameters),
        );
    }

    public getAll(requestParameters: LocalesListRequest): Promise<Array<Locale>> {
        return  this.localesApi.localesList(requestParameters)
    }

    public localeShow$(requestParameters: LocaleShowRequest): Observable<LocaleDetails> {
        return phrasePromiseToObservable(async () => this.localesApi.localeShow(requestParameters));
    }

    public downloadLocale$(requestParameters: ILocaleDownloadRequest2): Observable<Blob> {
        return phrasePromiseToObservable(async () =>
            this.localesApi.localeDownload(requestParameters),
        );
    }

    public getDefaultLocale$(requestParameters: LocalesListRequest): Observable<Locale> {
        return this.localesList$(requestParameters).pipe(
            map((locales: Locale[]) => locales.find(l => l._default)),
        );
    }

    public async getDefaultLocale(requestParameters: LocalesListRequest): Promise<Locale> {
        return lastValueFrom(this.getDefaultLocale$(requestParameters));
    }

    public createLocale$(params: LocaleCreateRequest): Observable<LocaleDetails> {
        return phrasePromiseToObservable(async () => this.localesApi.localeCreate(params))
    }

    public deleteLocale$(requestParameters: LocaleDeleteRequest): Observable<void> {
        return phrasePromiseToObservable(async () => this.localesApi.localeDelete(requestParameters))
    }
}
