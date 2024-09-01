import { Logger, Module } from '@nestjs/common';

import { LokaliseController } from './lokalise.controller';
import { LokaliseService } from './lokalise.service';

@Module({
    controllers: [LokaliseController],
    providers: [LokaliseService, Logger],
})
export class LokaliseModule {}
