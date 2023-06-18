import { ApId } from '../../common/id-generator';
import { PrincipalType } from './principal-type';
import { ProjectId } from '../../project/project';

export type Principal = WorkerPrincipal | UserPrincipal | UnknownPrincipal | ExternalPrincipal;

export interface UserPrincipal extends BasePrincipal<PrincipalType.USER>{
    projectId: ProjectId;
}

export interface UnknownPrincipal extends BasePrincipal<PrincipalType.UNKNOWN>{
    projectId: ProjectId;
}


export interface WorkerPrincipal extends BasePrincipal<PrincipalType.WORKER>{
    projectId: ProjectId;
}

export interface ExternalPrincipal extends BasePrincipal<PrincipalType.EXTERNAL>{
    projectId: ProjectId; // TODO: fix
    externalId: ApId;
}

interface BasePrincipal<T>{
    id: ApId,
    type: T
}
