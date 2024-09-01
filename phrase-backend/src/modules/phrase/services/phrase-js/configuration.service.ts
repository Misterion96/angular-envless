import { Injectable } from '@nestjs/common';
import { Configuration } from 'phrase-js';

@Injectable()
export class PhraseConfigurationService extends Configuration {
    constructor() {
        super({
            apiKey: 'token 0244521c13fe81028b1a40396b081ccd172fa6bad3b737bee843430e3b0ea665',
        });
    }
}
