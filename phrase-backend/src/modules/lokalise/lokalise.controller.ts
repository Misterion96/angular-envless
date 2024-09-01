import { Branch, QueuedProcess } from '@lokalise/node-api';
import { Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { LokaliseService } from './lokalise.service';

@Controller('localization')
export class LokaliseController {
    constructor(private readonly lokalise: LokaliseService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    public onUploadFileFromBranch(
        @UploadedFile() file: Express.Multer.File,
        @Query('project') project: string,
        @Query('branch') branch: string,
    ): Observable<QueuedProcess> {
        return this.lokalise.onUploadFileToBranch$(file, project, branch);
    }

    @Post('merge')
    public onMergeNodaBranch(
        @Query('project') project: string,
        @Query('branch') branch: string,
    ): Observable<{ project_id: string; branch: Branch; message: string }> {
        return this.lokalise.onMergeBranch$(project, branch).pipe(
            filter(({ branch_merged }) => branch_merged),
            switchMap(({ branch }) => this.lokalise.deleteBranch$(project, branch)),
            map(({ project_id, branch }) => {
                return {
                    project_id,
                    branch,
                    message: `Branch ${branch.name} was merged`,
                };
            }),
        );
    }

    @Get('translations')
    public onRequestTranslations(@Query('project') project: string): Observable<string> {
        return this.lokalise.onFilesDownload$(project);
    }
}
