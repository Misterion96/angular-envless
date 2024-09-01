import { Injectable } from '@nestjs/common';
import { Job, JobDetails, JobLocale, JobLocalesApi, JobsApi } from 'phrase-js';
import { JobLocalesCreateRequest } from 'phrase-js/src/apis/JobLocalesApi';
import { JobCreateRequest, JobsListRequest, JobStartRequest } from 'phrase-js/src/apis/JobsApi';
import { Observable } from 'rxjs';

import { PhraseConfigurationService } from './configuration.service';
import { phrasePromiseToObservable } from './helpers/phrase-promise-to-observable';

interface IJobsListRequest extends JobsListRequest {
    state: 'completed' | 'draft' | 'in_progress';
}

@Injectable()
export class PhraseJobsService {
    private readonly jobsApi: JobsApi = new JobsApi(this.configuration);
    private readonly jobLocalesApi: JobLocalesApi = new JobLocalesApi(this.configuration);

    constructor(private readonly configuration: PhraseConfigurationService) {}

    public jobList$(params: IJobsListRequest): Observable<Job[]> {
        return phrasePromiseToObservable(async () => this.jobsApi.jobsList(params));
    }

    public jobCreate$(params: JobCreateRequest): Observable<JobDetails> {
        return phrasePromiseToObservable(async () => this.jobsApi.jobCreate(params));
    }

    public jobStart$(params: JobStartRequest): Observable<JobDetails> {
        return phrasePromiseToObservable(async () => this.jobsApi.jobStart(params));
    }

    public jobLocalesCreate$(params: JobLocalesCreateRequest): Observable<JobLocale> {
        return phrasePromiseToObservable(async () => this.jobLocalesApi.jobLocalesCreate(params));
    }
}
