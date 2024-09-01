import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fetch from 'node-fetch';
import { AppModule } from './app.module';

const FormData = require('form-data');

function btoa(str: Buffer | string): string {
    let buffer: Buffer;

    if (str instanceof Buffer) {
        buffer = str;
    } else {
        buffer = new Buffer(str.toString(), 'binary');
    }

    return buffer.toString('base64');
}

function atob(str: string): string {
    return Buffer.from(str, 'base64').toString('utf8')
}

async function init(): Promise<void> {
    const globalAny: any = global;
    globalAny.window = {
        fetch,
    };
    globalAny.FormData = FormData;
    globalAny.btoa = btoa;
    globalAny.atob = atob;
}

async function bootstrap(): Promise<void> {
    await init();
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Noda localize')
        .setDescription('The localize API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
}
bootstrap();
