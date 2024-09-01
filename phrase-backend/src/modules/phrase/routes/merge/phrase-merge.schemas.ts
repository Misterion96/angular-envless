import { PhraseMergeExampleBody } from './example-body';

export interface IPhraseMergeQuery {
    project: string;
    branch: string;
}

export type TPhraseMergeBody = typeof PhraseMergeExampleBody;
