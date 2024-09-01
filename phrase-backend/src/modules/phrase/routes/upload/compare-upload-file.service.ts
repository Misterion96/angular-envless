import { Injectable, Logger } from '@nestjs/common';

import {
    CompareObjects,
    TCompareObjectsResult,
    TNestedObject,
} from '../../services/compare-objects';
import { FilesStorageService, toNestedObject } from '../../services/files-storage';
import { TranslationByBranchService } from './translation-by-branch.service';

@Injectable()
export class CompareUploadFileService {
    constructor(
        private readonly translationByBranchService: TranslationByBranchService,
        private readonly filesStorageService: FilesStorageService,
        private readonly logger: Logger,
    ) {}

    public async checkDiffs(
        projectId: string,
        branchName: string,
        candidateFilePath: string,
    ): Promise<TCompareObjectsResult | null> {
        try {
            const currentTranslation: TNestedObject = toNestedObject(
                await this.translationByBranchService.getTranslation(projectId, branchName),
            );

            const candidateTranslation: TNestedObject = toNestedObject(
                this.filesStorageService.readJsonData(candidateFilePath),
            );

            const diffs: TCompareObjectsResult | null = new CompareObjects(
                candidateTranslation,
                currentTranslation,
            ).getDiffs();

            if (!diffs) {
                return null;
            }

            // сохраняем только нужные ключи в файл, ибо нельзя в запрос указать объект напрямую
            this.overrideCandidateTranslationFile(
                this.pickObject([...diffs.changed, ...diffs.added], candidateTranslation),
                candidateFilePath,
            );

            return diffs;
        } catch (e: unknown) {
            this.logger.error(e);

            return null;
        }
    }

    private pickObject(keys: string[], obj: TNestedObject): TNestedObject {
        return keys.reduce<TNestedObject>((acc, key) => {
            acc[key] = obj[key];

            return acc;
        }, {});
    }

    private overrideCandidateTranslationFile(data: TNestedObject, path: string): void {
        this.filesStorageService.saveFile(path, data);
    }
}
