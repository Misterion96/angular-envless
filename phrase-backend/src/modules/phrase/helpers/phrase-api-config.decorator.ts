import { applyDecorators } from '@nestjs/common';
import {
    ApiBody,
    ApiBodyOptions,
    ApiConsumes,
    ApiHeaderOptions,
    ApiHeaders,
    ApiOperation,
    ApiOperationOptions,
    ApiResponse,
    ApiResponseOptions,
} from '@nestjs/swagger';

interface ApiConfigOptions {
    headers?: ApiHeaderOptions[];
    responses?: ApiResponseOptions[];
    body?: ApiBodyOptions;
    operation?: ApiOperationOptions;
    consumes?: string[];
}

function ApiConfig(config: ApiConfigOptions): MethodDecorator {
    const decorators = [];

    if (config.consumes) {
        decorators.push(ApiConsumes(...config.consumes));
    }

    if (config.operation) {
        decorators.push(ApiOperation(config.operation));
    }

    if (config.headers) {
        decorators.push(ApiHeaders(config.headers));
    }

    if (config.responses) {
        decorators.push(...config.responses.map(res => ApiResponse(res)));
    }

    if (config.body) {
        decorators.push(ApiBody(config.body));
    }

    return applyDecorators(...decorators);
}

export type PhraseApiConfigOptions = ApiConfigOptions;
export function PhraseApiConfig(config: ApiConfigOptions): MethodDecorator {
    // const { headers = [] } = config;
    // headers.push({
    //     name: 'auth',
    //     example: '111-233',
    //     required: true,
    // });

    return ApiConfig({
        ...config,
        // headers,
    });
}
