
export interface IPhraseRouteHandler<I, O> {
    handle$(params: I): Promise<O> | null;
}
