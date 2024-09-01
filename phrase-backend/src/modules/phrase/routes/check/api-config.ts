import { HttpStatus } from '@nestjs/common';

import { PhraseApiConfigOptions } from '../../helpers';

export const PhraseCheckApiConfig: PhraseApiConfigOptions = {
    operation: { summary: 'Проверка ветки перед слиянием с main-веткой во Phrase' },
    responses: [
        {
            status: HttpStatus.OK,
            description: 'Конфликтов или незавершенных переводов не обнаружено',
        },
        {
            status: HttpStatus.CONFLICT,
            description: 'Есть конфликты с main-веткой или есть незавершенные задания и переводы',
        },
    ],
};
