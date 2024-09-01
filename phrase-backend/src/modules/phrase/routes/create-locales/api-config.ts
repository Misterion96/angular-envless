import { HttpStatus } from '@nestjs/common';

import { PhraseApiConfigOptions } from '../../helpers';

export const PhraseCreateLocalesApiConfig: PhraseApiConfigOptions = {
    operation: { summary: 'Удаление дефолтных локалей и ключей, и создание локалей по списку' },
    responses: [
        {
            status: HttpStatus.OK,
            description: 'Локали Созданы',
        },
        {
            status: HttpStatus.BAD_REQUEST,
            description: 'Что-то пошло не так',
        },
    ],
};
