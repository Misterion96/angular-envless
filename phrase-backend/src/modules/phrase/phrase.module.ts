import { Logger, MiddlewareConsumer, Module, NestModule, Type } from '@nestjs/common';

import { PhraseController } from './phrase.controller';
import { AuthMiddleware } from './phrase.middleware';
import {
    PhraseCheckRouteHandler, PhraseCreateLocalesRouteHandler,
    PhraseDownloadRouteHandler,
    PhraseMergeRouteHandler,
    provideUploadRouteHandleServices,
} from './routes';
import { IPhraseRouteHandler } from './routes/phrase-route-handler.interface';
import { FilesStorageService } from './services/files-storage';
import { providePhraseServices } from './services/phrase-js';

const REQUEST_HANDLERS: Type<IPhraseRouteHandler<unknown, unknown>>[] = [
    PhraseMergeRouteHandler,
    PhraseCheckRouteHandler,
    PhraseDownloadRouteHandler,
    PhraseCreateLocalesRouteHandler,
];

@Module({
    controllers: [PhraseController],
    providers: [
        ...REQUEST_HANDLERS,
        ...provideUploadRouteHandleServices(),
        ...providePhraseServices(),
        Logger,
        FilesStorageService,
    ],
})
export class PhraseModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(AuthMiddleware).forRoutes(PhraseController);
    }
}
