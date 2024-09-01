import { HttpStatus } from '@nestjs/common';

import { PhraseApiConfigOptions } from '../../helpers';

export const PhraseMergeApiConfig: PhraseApiConfigOptions = {
    operation: { summary: 'Слияние ветки с main-веткой во Phrase' },
    responses: [
        {
            status: HttpStatus.OK,
            description: 'Успешное слияние',
        },
        {
            status: HttpStatus.BAD_REQUEST,
            description: 'ошибка - пустое тело',
        },
        {
            status: HttpStatus.ACCEPTED,
            description:
                'Произошла ошибка. Положительный код нужен для продолжения работы Service Hooks',
        },
    ],
    body: {
        required: true,
        description: 'тело от azure webhooks',
    },
    headers: [
        {
            name: 'targetBranch',
            description: 'Ветка в рамках которой был выполнен pullrequest',
            example: 'master',
            enum: ['master', 'prerelease'],
            required: false,
        },
    ],
};
