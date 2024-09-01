import { HttpException } from '@nestjs/common';
import { catchError, defer, Observable, ObservedValueOf, throwError } from 'rxjs';

interface IPhraseError {
    statusText: string;
    status: number;
    url: string;
    error: unknown | null;
    disturbed: boolean;
    headers: unknown;
    [prop: string]: unknown;
}

function phraseGetHideErrors(errorObject: object): IPhraseError {
    const dataFromSymbols = Object.getOwnPropertySymbols(errorObject).reduce<IPhraseError>(
        (acc, symbol) => {
            return {
                ...acc,
                ...errorObject[symbol],
            };
        },
        {
            statusText: '',
            status: 0,
            url: '',
            error: null,
            disturbed: false,
            headers: {},
        },
    );

    const {
        statusText = '',
        status = 0,
        url = '',
        error = null,
        disturbed = false,
        headers = {},
    } = dataFromSymbols as unknown as IPhraseError;

    return {
        ...errorObject,
        statusText,
        status,
        url,
        error,
        disturbed,
        headers,
    };
}

export function phrasePromiseToObservable<R extends PromiseLike<unknown>>(
    factory: () => R,
): Observable<ObservedValueOf<R>> {
    return defer(factory).pipe(
        catchError((err: unknown) => {
            const { status, ...response } = phraseGetHideErrors(err as object);

            return throwError(() => new HttpException(response, status));
        }),
    );
}
