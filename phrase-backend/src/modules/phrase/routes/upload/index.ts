import { Provider } from '@nestjs/common';

import { CompareUploadFileService } from './compare-upload-file.service';
import { PhraseUploadRouteHandler } from './phrase-upload.route-handler';
import { TranslationByBranchService } from './translation-by-branch.service';

export * from './phrase-upload.api-config';
export * from './phrase-upload.route-handler';
export * from './phrase-upload.schemas';

export function provideUploadRouteHandleServices(): Provider<unknown>[] {
    return [CompareUploadFileService, TranslationByBranchService, PhraseUploadRouteHandler];
}
