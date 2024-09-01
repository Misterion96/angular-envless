import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { LoggerMiddleware } from './middleware/logger.middleware';
import { PhraseModule } from './modules/phrase';

@Module({
    imports: [PhraseModule],
})
export class AppModule {
    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
