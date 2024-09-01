import {
    Controller,
    Get,
    HttpException,
    Post,
    Query,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { Upload } from 'phrase-js';

import { PhraseApiConfig } from './helpers';
import {
    IPhraseMergeQuery,
    PhraseCheckApiConfig,
    PhraseCheckQuerySchema,
    PhraseCheckRouteHandler,
    PhraseDownloadApiConfig,
    PhraseDownloadQuerySchema,
    PhraseDownloadRouteHandler,
    PhraseMergeApiConfig,
    PhraseMergeRouteHandler,
    PhraseMergeValidBodyInterceptor,
    phraseUploadApiConfig,
    PhraseUploadQuerySchema,
    PhraseUploadRouteHandler,
} from './routes';
import { uploadDistStorageOptions } from './services/files-storage';

type TPhraseResponse<Success> = HttpException | Success;

@ApiTags('noda-lokalise-phrase')
@Controller('phrase')
export class PhraseController {
    constructor(
        private readonly phraseCheckRoute: PhraseCheckRouteHandler,
        private readonly phraseUploadRoute: PhraseUploadRouteHandler,
        private readonly phraseDownloadRoute: PhraseDownloadRouteHandler,
        private readonly phraseMergeRoute: PhraseMergeRouteHandler,
    ) {}

    @Get('check')
    @PhraseApiConfig(PhraseCheckApiConfig)
    public async onCheck(
        @Query() query: PhraseCheckQuerySchema,
    ): Promise<TPhraseResponse<never | null>> {
        return this.phraseCheckRoute.handle$(query);
    }

    @Get('download')
    @PhraseApiConfig(PhraseDownloadApiConfig)
    public async onDownload(
        @Res() response: Response,
        @Query() queryParams: PhraseDownloadQuerySchema,
    ): Promise<TPhraseResponse<void>> {
        return this.phraseDownloadRoute.handle$({
            response,
            queryParams,
        });
    }

    @Post('merge')
    @PhraseApiConfig(PhraseMergeApiConfig)
    @UseInterceptors(PhraseMergeValidBodyInterceptor)
    public async onMerge(@Query() query: IPhraseMergeQuery): Promise<TPhraseResponse<void> | string> {
        return this.phraseMergeRoute.handle$(query);
    }

    @Post('upload')
    @PhraseApiConfig(phraseUploadApiConfig)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage(uploadDistStorageOptions()),
        }),
    )
    public async onUpload(
        @UploadedFile() file: Express.Multer.File,
        @Query() query: PhraseUploadQuerySchema,
    ): Promise<TPhraseResponse<Upload> | string> {
        return this.phraseUploadRoute.handle$({
            ...query,
            file,
        });
    }
}
