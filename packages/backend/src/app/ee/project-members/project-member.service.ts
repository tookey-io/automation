import { ProjectMemberEntity, ProjectMemberSchema } from './project-member.entity'
import { databaseConnection } from '../../database/database-connection'
import { userService } from '../../user/user-service'
import {
    ActivepiecesError,
    ApEdition,
    Cursor,
    ErrorCode,
    Principal,
    ProjectId,
    SeekPage,
    User,
    UserId,
    apId,
    isNil,
} from '@activepieces/shared'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import {
    PlatformId,
    ProjectMember,
    ProjectMemberId,
    ProjectMemberRole,
    ProjectMemberStatus,
    AddProjectMemberRequestBody,
} from '@activepieces/ee-shared'
import { buildPaginator } from '../../helper/pagination/build-paginator'
import { projectService } from '../../project/project-service'
import { emailService } from '../helper/email/email-service'
import { projectMembersLimit } from '../billing/limits/members-limit'
import dayjs from 'dayjs'
import { accessTokenManager } from '../../authentication/lib/access-token-manager'
import { getEdition } from '../../helper/secret-helper'
import { IsNull } from 'typeorm'

const projectMemberRepo = databaseConnection.getRepository(ProjectMemberEntity)

export const projectMemberService = {
    async upsert({ platformId, email, projectId, role, status }: UpsertParams): Promise<ProjectMember> {
        await projectMembersLimit.limit({
            projectId,
        })

        const projectMember: NewProjectMember = {
            id: apId(),
            updated: dayjs().toISOString(),
            email,
            platformId,
            projectId,
            role,
            status: status ?? getStatusFromEdition(),
        }

        const upsertResult = await projectMemberRepo.upsert(projectMember, ['projectId', 'email', 'platformId'])

        return {
            ...projectMember,
            created: upsertResult.generatedMaps[0].created,
        }
    },

    async upsertAndSend({ platformId, projectId, email, role, status }: UpsertAndSendParams): Promise<UpsertAndSendResponse> {

        const projectMember = await this.upsert({
            platformId,
            email,
            projectId,
            role,
            status,
        })

        if (projectMember.status === ProjectMemberStatus.PENDING) {
            await emailService.sendInvitation({
                invitationId: projectMember.id,
                projectId,
                email,
            })
        }

        const invitationToken = await accessTokenManager.generateToken({
            id: projectMember.id,
        } as Principal)

        return {
            projectMember,
            invitationToken,
        }
    },

    async accept({ invitationToken }: AcceptParams): Promise<ProjectMember> {
        const { id: projectMemberId } = await getByInvitationTokenOrThrow(invitationToken)
        const projectMember = await getOrThrow(projectMemberId)

        await projectMemberRepo.update(projectMemberId, {
            status: ProjectMemberStatus.ACTIVE,
        })
        return {
            ...projectMember,
            status: ProjectMemberStatus.ACTIVE,
        }
    },

    async list(
        projectId: ProjectId,
        cursorRequest: Cursor | null,
        limit: number,
    ): Promise<SeekPage<ProjectMember>> {
        const decodedCursor = paginationHelper.decodeCursor(cursorRequest)
        const paginator = buildPaginator({
            entity: ProjectMemberEntity,
            query: {
                limit,
                order: 'ASC',
                afterCursor: decodedCursor.nextCursor,
                beforeCursor: decodedCursor.previousCursor,
            },
        })
        const queryBuilder = projectMemberRepo
            .createQueryBuilder('project_member')
            .where({ projectId })
        const { data, cursor } = await paginator.paginate(queryBuilder)
        const projectMembers: ProjectMember[] = []
        const project = await projectService.getOneOrThrow(projectId)
        const owner = await userService.getMetaInfo({
            id: project.ownerId,
        })

        projectMembers.push({
            id: apId(),
            email: owner!.email,
            platformId: project.platformId ?? null,
            projectId,
            status: ProjectMemberStatus.ACTIVE,
            created: project.created,
            role: ProjectMemberRole.ADMIN,
            updated: project.updated,
        })

        projectMembers.push(...data)
        return paginationHelper.createPage<ProjectMember>(projectMembers, cursor)
    },
    async getRole({ userId, projectId }: { projectId: ProjectId, userId: UserId }): Promise<ProjectMemberRole | null> {
        const project = await projectService.getOne(projectId)
        if (project?.ownerId === userId) {
            return ProjectMemberRole.ADMIN
        }
        const user = await userService.getMetaInfo({
            id: userId,
        })
        const member = await projectMemberRepo.findOneBy({
            projectId,
            email: user?.email,
            platformId: isNil(user?.platformId) ? IsNull() : user?.platformId,
        })
        return member?.role ?? null
    },
    async listByUser(user: User): Promise<ProjectMemberSchema[]> {
        return projectMemberRepo.findBy({
            email: user.email,
            platformId: isNil(user.platformId) ? IsNull() : user.platformId,
        })
    },
    async delete(
        projectId: ProjectId,
        invitationId: ProjectMemberId,
    ): Promise<void> {
        await projectMemberRepo.delete({ projectId, id: invitationId })
    },

    async deleteByUserExternalId({ userExternalId, platformId, projectId }: DeleteByUserExternalIdParams): Promise<void> {
        const userEmail = await getUserEmailByExternalIdOrThrow({
            userExternalId,
            platformId,
        })

        await projectMemberRepo.delete({
            projectId,
            platformId,
            email: userEmail,
        })
    },

    async countTeamMembersIncludingOwner(projectId: ProjectId): Promise<number> {
        return await projectMemberRepo.countBy({
            projectId,
        }) + 1
    },
}

async function getByInvitationTokenOrThrow(invitationToken: string): Promise<ProjectMember> {
    const { id: projectMemberId } = await accessTokenManager.extractPrincipal(invitationToken) as ProjectMemberToken
    return getOrThrow(projectMemberId)
}

function getStatusFromEdition(): ProjectMemberStatus {
    const edition = getEdition()
    switch (edition) {
        case ApEdition.CLOUD:
            return ProjectMemberStatus.PENDING
        case ApEdition.ENTERPRISE:
            return ProjectMemberStatus.ACTIVE
        default:
            throw new Error('Unnkown project status ' + edition)
    }
}

const getOrThrow = async (id: string): Promise<ProjectMember> => {
    const projectMember = await projectMemberRepo.findOneBy({
        id,
    })

    if (isNil(projectMember)) {
        throw new ActivepiecesError({
            code: ErrorCode.ENTITY_NOT_FOUND,
            params: {
                message: `Project Member Id ${id} is not found`,
            },
        })
    }

    return projectMember
}

const getUserEmailByExternalIdOrThrow = async ({ userExternalId, platformId }: GetUserEmailByExternalIdOrThrowParams): Promise<string> => {
    const user = await userService.getByPlatformAndExternalId({
        platformId,
        externalId: userExternalId,
    })

    if (isNil(user)) {
        throw new ActivepiecesError({
            code: ErrorCode.ENTITY_NOT_FOUND,
            params: {
                entityType: 'User',
                entityId: `userExternalId=${userExternalId} platformId=${platformId}`,
            },
        })
    }

    return user.email
}

type UpsertParams = {
    email: string
    platformId: PlatformId | null
    projectId: ProjectId
    role: ProjectMemberRole
    status?: ProjectMemberStatus
}

type NewProjectMember = Omit<ProjectMember, 'created'>

type UpsertAndSendParams = AddProjectMemberRequestBody & {
    projectId: ProjectId
    platformId: PlatformId | null
}

type AcceptParams = {
    invitationToken: string
}

type ProjectMemberToken = {
    id: string
}

type UpsertAndSendResponse = {
    projectMember: ProjectMember
    invitationToken: string
}

type DeleteByUserExternalIdParams = {
    userExternalId: string
    platformId: PlatformId
    projectId: ProjectId
}

type GetUserEmailByExternalIdOrThrowParams = {
    userExternalId: string
    platformId: PlatformId
}
