import { Provider } from '@nestjs/common';

import { PhraseBranchesService } from './branches.service';
import { PhraseConfigurationService } from './configuration.service';
import { PhraseJobsService } from './jobs.service';
import { PhraseKeysService } from './keys.service';
import { PhraseLocalesService } from './locales.service';
import { PhraseProjectsService } from './projects.service';
import { PhraseTranslationsService } from './translations.service';
import { PhraseUploadService } from './upload.service';

export * from './branches.service';
export * from './configuration.service';
export * from './jobs.service';
export * from './keys.service';
export * from './locales.service';
export * from './projects.service';
export * from './translations.service';
export * from './upload.service';

export function providePhraseServices(): Provider[] {
    return [
        PhraseConfigurationService,
        PhraseProjectsService,
        PhraseBranchesService,
        PhraseUploadService,
        PhraseLocalesService,
        PhraseTranslationsService,
        PhraseJobsService,
        PhraseKeysService,
    ];
}
