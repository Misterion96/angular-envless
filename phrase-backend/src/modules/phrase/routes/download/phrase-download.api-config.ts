import { HttpStatus } from '@nestjs/common';

import { PhraseApiConfigOptions } from '../../helpers';

export const PhraseDownloadApiConfig: PhraseApiConfigOptions = {
    operation: { summary: 'Получение архива, содержащего переводы по всем локалям на проект' },
    responses: [
        {
            status: HttpStatus.OK,
            description: 'Архив переводов успешно сформирован и готов к загрузке',
        },
        {
            status: HttpStatus.BAD_REQUEST,
            description: 'Что-то пошло не так',
        },
    ],
};
