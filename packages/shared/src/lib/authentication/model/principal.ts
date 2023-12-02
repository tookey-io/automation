import { ApId } from '../../common/id-generator'
import { PrincipalType } from './principal-type'
import { ProjectId, ProjectType } from '../../project/project'

export type Principal = {
    id: ApId
    type: PrincipalType
    projectId: ProjectId
    projectType?: ProjectType
    platform?: {
        id: ApId
        role: 'OWNER' | 'MEMBER'
    }
}
