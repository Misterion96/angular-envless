import { Injectable } from '@nestjs/common';
import {
    Upload,
    UploadCreateRequest,
    UploadsApi,
    UploadShowRequest,
    UploadsListRequest,
} from 'phrase-js';
import { Observable } from 'rxjs';

import { TFileFormats } from '../../types/file-formats.types';
import { PhraseConfigurationService } from './configuration.service';
import { phrasePromiseToObservable } from './helpers/phrase-promise-to-observable';

export interface IUploadCreateRequest2 {
    localeId: string;
    file: Blob;
    projectId: string;
    markReviewed?: 'false' | 'true';
    updateTranslations?: 'false' | 'true';
    updateDescriptions?: 'false' | 'true';
    autotranslate?: 'false' | 'true';
    convertEmoji?: 'false' | 'true';
    skipUploadTags?: 'false' | 'true';
    skipUnverification?: 'false' | 'true';
    xPhraseAppOTP?: string;
    branch?: string;
    fileFormat?: TFileFormats;
    tags?: string;
    fileEncoding?: string;
    localeMapping?: object;
    formatOptions?: object;
}

@Injectable()
export class PhraseUploadService {
    private readonly uploadsApi: UploadsApi = new UploadsApi(this.configuration);

    constructor(private readonly configuration: PhraseConfigurationService) {}

    public uploadCreate$(requestParameters: IUploadCreateRequest2): Observable<Upload> {
        const params = requestParameters as unknown as UploadCreateRequest;

        return phrasePromiseToObservable(async () => this.uploadsApi.uploadCreate(params));
    }

    public uploadShow$(requestParameters: UploadShowRequest): Observable<Upload> {
        return phrasePromiseToObservable(async () => this.uploadsApi.uploadShow(requestParameters));
    }

    public uploadsList$(requestParameters: UploadsListRequest): Observable<Array<Upload>> {
        return phrasePromiseToObservable(async () =>
            this.uploadsApi.uploadsList(requestParameters),
        );
    }
}
