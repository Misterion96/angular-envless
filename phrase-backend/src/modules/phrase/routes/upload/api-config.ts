import { HttpStatus } from '@nestjs/common';

import { PhraseApiConfigOptions } from '../../helpers';

export const phraseUploadApiConfig: PhraseApiConfigOptions = {
    operation: {
        summary: 'Выгрузка единой карты (<lang>.vendor.json) переводов из репозитория',
    },
    consumes: ['multipart/form-data'],
    body: {
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    },
    responses: [
        {
            status: HttpStatus.CREATED,
            description: 'Выгрузка прошла успешно',
        },
        {
            status: HttpStatus.BAD_REQUEST,
            description: 'Что-то пошло не так',
        },
    ],
};
