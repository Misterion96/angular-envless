import { Injectable } from '@nestjs/common';
import { Branch, Locale } from 'phrase-js';
import { lastValueFrom, Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { TNestedObject } from '../../services/compare-objects';
import {
    ILocaleDownloadRequest2,
    PhraseBranchesService,
    PhraseLocalesService,
} from '../../services/phrase-js';

@Injectable()
export class TranslationByBranchService {
    constructor(
        private readonly branches: PhraseBranchesService,
        private readonly locales: PhraseLocalesService,
    ) {}

    public async getTranslation(projectId: string, branch: string): Promise<TNestedObject> {
        const branchName: string = await this.getBranchName(projectId, branch);
        const locale: Locale = await this.locales.getDefaultLocale({
            branch: branchName,
            projectId,
        });

        return this.getTranslationByLocale$(projectId, locale, branchName);
    }

    private async getBranchName(
        projectId: string,
        currentName: string,
    ): Promise<string | undefined> {
        if (currentName === 'master') {
            return;
        }

        const phraseBranch: Branch | null = await this.branches.isBranchExist({
            projectId,
            name: currentName,
        });

        // undefined = master on request
        return phraseBranch ? phraseBranch.name : undefined;
    }

    private async getTranslationByLocale$(
        projectId: string,
        { id }: Locale,
        branch: string,
    ): Promise<Record<string, string>> {
        const requestOptions: ILocaleDownloadRequest2 = {
            projectId,
            fileFormat: 'i18next_4',
            branch,
            id,
            includeTranslatedKeys: true,
            includeUnverifiedTranslations: true,
            includeEmptyTranslations: true,
        };

        const request$: Observable<Record<string, string>> = this.locales
            .downloadLocale$(requestOptions)
            .pipe(
                switchMap(async blob => blob.text()),
                map(textData => JSON.parse(textData)),
            );

        return lastValueFrom(request$);
    }
}
