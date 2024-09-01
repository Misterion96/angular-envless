/* eslint-disable @typescript-eslint/unbound-method,@typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const getResponseLog = (res: Response, logger: Logger): void => {
    logger.log(`========> Done writing, beginning res.end`);
    res.on('close', () => {
        const responseLog = {
            response: {
                statusCode: res.statusCode,
                statusText: res.statusMessage,
                // Returns a shallow copy of the current outgoing headers
                headers: res.getHeaders(),
            },
        };

        logger.log('res: ', responseLog);
    });
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger: Logger = new Logger('HTTP');

    public use(req: Request, res: Response, next: NextFunction | null): void {
        // Getting the request log
        this.logger.log(`req:`, {
            headers: req.headers,
            body: req.body,
            originalUrl: req.originalUrl,
        });

        // Getting the response log
        getResponseLog(res, this.logger);

        if (next) {
            next();
        }
    }
}
