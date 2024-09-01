import { ApiProperty } from '@nestjs/swagger';

import { branchQueryParamDescription } from '../../constants/branch.query-param-description';
import { projectQueryParamDescription } from '../../constants/project-query-param.description';

export class PhraseDownloadQuerySchema {
    @ApiProperty(projectQueryParamDescription)
    public readonly project: string;

    @ApiProperty(branchQueryParamDescription)
    public readonly branch: string;
}
