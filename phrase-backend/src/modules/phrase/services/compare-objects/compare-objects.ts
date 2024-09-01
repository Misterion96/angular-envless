// eslint-disable-next-line import/named
import { isEqual } from 'lodash';

import { TCompareObjectsResult, TNestedObject } from './compare-object.types';

type TCompareResult = Omit<TCompareObjectsResult, 'deleted'>;

export class CompareObjects {
    constructor(
        private readonly nextObject: TNestedObject,
        private readonly prevObject: TNestedObject,
    ) {}
    public getDiffs(): TCompareObjectsResult | null {
        let countChanges = 0;

        const compareResult = Object.keys(this.nextObject).reduce<TCompareResult>(
            (acc, key) => {
                if (!this.hasProperty(this.prevObject, key)) {
                    acc.added.push(key);
                    countChanges++;

                    return acc;
                }

                if (!isEqual(this.nextObject[key], this.prevObject[key])) {
                    acc.changed.push(key);
                    countChanges++;

                    return acc;
                }

                return acc;
            },
            {
                added: [],
                changed: [],
            },
        );

        const deleted = Object.keys(this.prevObject).filter(key => {
            const result = !this.hasProperty(this.nextObject, key);

            if (result) {
                countChanges++;
            }

            return result;
        });

        return countChanges > 0
            ? {
                  ...compareResult,
                  deleted,
              }
            : null;
    }

    private hasProperty(object: object, key: string): boolean {
        return (object as Record<string, unknown>).hasOwnProperty(key);
    }
}
