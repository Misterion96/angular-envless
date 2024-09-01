import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
    Project,
    ProjectCreateRequest,
    ProjectDeleteRequest,
    ProjectDetails,
    ProjectsApi,
    ProjectShowRequest,
    ProjectsListRequest,
    ProjectUpdateRequest,
} from 'phrase-js';
import { lastValueFrom, Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PhraseConfigurationService } from './configuration.service';
import { phrasePromiseToObservable } from './helpers/phrase-promise-to-observable';

@Injectable()
export class PhraseProjectsService {
    private readonly projectAPI: ProjectsApi = new ProjectsApi(this.configuration);

    constructor(
        @Inject(PhraseConfigurationService)
        private readonly configuration: PhraseConfigurationService,
    ) {}

    public projectsList$(requestParameters: ProjectsListRequest): Observable<Project[]> {
        return phrasePromiseToObservable(async () =>
            this.projectAPI.projectsList(requestParameters),
        );
    }

    public projectCreate$(requestParameters: ProjectCreateRequest): Observable<ProjectDetails> {
        return phrasePromiseToObservable(async () =>
            this.projectAPI.projectCreate(requestParameters),
        );
    }

    public projectDelete$(requestParameters: ProjectDeleteRequest): Observable<unknown> {
        return phrasePromiseToObservable(async () =>
            this.projectAPI.projectDelete(requestParameters),
        );
    }

    public projectUpdate$(requestParameters: ProjectUpdateRequest): Observable<ProjectDetails> {
        return phrasePromiseToObservable(async () =>
            this.projectAPI.projectUpdate(requestParameters),
        );
    }

    public projectShow$(requestParameters: ProjectShowRequest): Observable<ProjectDetails> {
        return phrasePromiseToObservable(async () =>
            this.projectAPI.projectShow(requestParameters),
        );
    }

    public getProjectId$(projectName: string): Observable<string> {
        return this.projectsList$({
            page: 1,
            perPage: 100,
        }).pipe(
            switchMap(projects => {
                const project = projects.find(p => p.name === projectName);

                return project
                    ? of(project.id)
                    : throwError(
                          () =>
                              new HttpException(
                                  `project ${projectName} isn't exist. Available projects: ${projects
                                      .map(p => `${p.name}`)
                                      .join(', ')}`,
                                  HttpStatus.NOT_FOUND,
                              ),
                      );
            }),
        );
    }

    public async getProjectId(projectName: string): Promise<string> {
        return lastValueFrom(this.getProjectId$(projectName));
    }
}
