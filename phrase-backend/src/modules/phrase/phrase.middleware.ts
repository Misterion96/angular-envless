import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    public use(req: Request, res: Response, next: NextFunction): Response {
        const authHeaderValue = req.headers.auth;

        if (!authHeaderValue) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'set auth header' });
        }
        if (authHeaderValue !== '111-233') {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        next();
    }
}
