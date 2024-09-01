import { Injectable } from '@nestjs/common';

import { TNestedObject } from '../compare-objects';

const fs = require('node:fs');

@Injectable()
export class FilesStorageService {
    public deleteFile(filePath: string): void {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    public saveFile(path: string, data: object | string): void {
        const stringData: string = typeof data === 'string' ? data : JSON.stringify(data);

        const pathToFile: string = path.slice(0, path.lastIndexOf('/'));

        this.upsertDir(pathToFile);

        fs.writeFileSync(path, stringData);
    }

    public upsertDir(path: string): void {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
    }
    public readStringData(path: string): string {
        return fs.readFileSync(path, 'utf8').toString();
    }

    public readJsonData(path: string): TNestedObject {
        return JSON.parse(this.readStringData(path));
    }
}
