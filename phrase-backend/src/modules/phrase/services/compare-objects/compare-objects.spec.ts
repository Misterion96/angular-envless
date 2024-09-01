import { TCompareObjectsResult, TNestedObject } from './compare-object.types';
import { CompareObjects } from './compare-objects';

describe('CompareObjects', () => {
    describe('getDiffs', () => {
        it('should return null when both objects are empty', () => {
            const currentObject: TNestedObject = {};
            const compareObject: TNestedObject = {};

            const result: TCompareObjectsResult | null = new CompareObjects(
                currentObject,
                compareObject,
            ).getDiffs();

            expect(result).toBeNull();
        });

        it('should detect added properties', () => {
            const currentObject: TNestedObject = {
                key1: ['value1'],
                key2: true,
                key3: 123,
            };

            const compareObject: TNestedObject = {
                key1: ['value1'],
                key2: true,
            };

            const result: TCompareObjectsResult | null = new CompareObjects(
                currentObject,
                compareObject,
            ).getDiffs();

            expect(result).toEqual({
                added: ['key3'],
                changed: [],
                deleted: [],
            });
        });

        it('should detect changed properties', () => {
            const currentObject: TNestedObject = {
                key1: ['value1'],
                key2: true,
                key3: 123,
            };

            const compareObject: TNestedObject = {
                key1: ['value2'], // value changed
                key2: false, // value changed
                key3: 123, // same value
            };

            const result: TCompareObjectsResult | null = new CompareObjects(
                currentObject,
                compareObject,
            ).getDiffs();

            expect(result).toEqual({
                added: [],
                changed: ['key1', 'key2'],
                deleted: [],
            });
        });

        it('should detect deleted properties', () => {
            const currentObject: TNestedObject = {
                key1: ['value1'],
            };

            const compareObject: TNestedObject = {
                key1: ['value1'],
                key2: true,
                key3: 123,
            };

            const result: TCompareObjectsResult | null = new CompareObjects(
                currentObject,
                compareObject,
            ).getDiffs();

            expect(result).toEqual({
                added: [],
                changed: [],
                deleted: ['key2', 'key3'],
            });
        });
    });
});
