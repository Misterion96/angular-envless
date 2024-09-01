import { DiskStorageOptions } from 'multer';

import { TNestedObject } from '../compare-objects';

const ROOT_PATH: string = './dist/assets';
const SAVE_FILE_NAME: string = 'main.json';
const fs = require('node:fs');

export function toNestedObject(obj: object, parentKey?: string): TNestedObject {
    let result: TNestedObject = {};

    Object.keys(obj).forEach(key => {
        const value: object | unknown = obj[key];
        const objectKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof value === 'object') {
            result = { ...result, ...toNestedObject(value, objectKey) };
        } else {
            result[objectKey] = value as string;
        }
    });

    return result;
}

export function uploadDistStorageOptions(): DiskStorageOptions {
    return {
        destination: (req, _file, callback): void => {
            const { project, branch } = req.query as {
                project: string;
                branch: string;
            };

            const path: string = `${ROOT_PATH}/${project}/${branch}/temp-${new Date().toISOString()}`;

            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            }

            callback(null, path);
        },
        filename: (__req, _file, callback): void => {
            callback(null, SAVE_FILE_NAME);
        },
    };
}
