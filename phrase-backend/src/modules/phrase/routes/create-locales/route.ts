import { Injectable } from '@nestjs/common';
import { Locale, TranslationKey } from 'phrase-js';
import { LocaleCreateParameters, LocaleDetails } from 'phrase-js/src/models';
import { concatMap, firstValueFrom, mergeAll, mergeMap, of, toArray } from 'rxjs';
import { PhraseKeysService, PhraseLocalesService, PhraseProjectsService } from '../../services/phrase-js';
import { IPhraseRouteHandler } from '../phrase-route-handler.interface';


const locales: LocaleCreateParameters[] = [
    { code: 'ru-RU', name: 'ru', main: true, _default: true },
    { code: 'az-AZ', name: 'az', main: false, _default: false },
    { code: 'de-DE', name: 'de', main: false, _default: false },
    { code: 'en-US', name: 'en', main: false, _default: false },
    { code: 'hi-IN', name: 'hi', main: false, _default: false },
    { code: 'hy-AM', name: 'hy', main: false, _default: false },
    { code: 'kk-KZ', name: 'kk', main: false, _default: false },
    { code: 'pl-PL', name: 'pl', main: false, _default: false },
    { code: 'tr-TR', name: 'tr', main: false, _default: false },
    { code: 'zn-CN', name: 'zn', main: false, _default: false },
];

@Injectable()
export class PhraseCreateLocalesRouteHandler implements IPhraseRouteHandler<void, LocaleDetails[]> {
    constructor(
        private readonly projects: PhraseProjectsService,
        private readonly locales: PhraseLocalesService,
        private readonly keys: PhraseKeysService,
    ) {
    }

    public async handle$(): Promise<LocaleDetails[]> {
        const {id: projectId} = await this.projects.project({});

        await this.deleteKeys(projectId)
        await this.deleteLocales(projectId);

        return this.createLocales(projectId)
    }

    private async createLocales(projectId: string) {
        const request$ = of(locales).pipe(
            mergeAll(),
            concatMap(locale => this.locales.createLocale$({
                projectId,
                localeCreateParameters: {
                    unverifyNewTranslations: true,
                    unverifyUpdatedTranslations: true,
                    autotranslate: true,
                    ...locale
                }
            })),
            toArray()
        )

        return firstValueFrom(request$)
    }
    private async deleteKeys(projectId: string){
        const keys: TranslationKey[] = await this.keys.getAll({projectId});

        return this.keys.delete({
            projectId,
            q: `name:${keys.map(k => k.name).join(',')}`,
        });
    }

    private async deleteLocales(projectId: string) {
        const locales: Locale[] = await this.locales.getAll({projectId});

        const request$ = of(locales).pipe(
            mergeAll(),
            mergeMap(locale => this.locales.deleteLocale$({
                projectId,
                id: locale.id
            }))
        )

        return firstValueFrom(request$)
    }
}
