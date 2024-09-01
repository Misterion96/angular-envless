import { Provider } from '@nestjs/common';

import { CompareUploadFileService } from './compare-upload-file.service';
import { PhraseUploadRouteHandler } from './route-handler';
import { TranslationByBranchService } from './translation-by-branch.service';

export * from './api-config';
export * from './route-handler';
export * from './schemas';

export function provideUploadRouteHandleServices(): Provider<unknown>[] {
    return [CompareUploadFileService, TranslationByBranchService, PhraseUploadRouteHandler];
}
