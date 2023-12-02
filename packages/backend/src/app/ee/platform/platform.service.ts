import { ActivepiecesError, ErrorCode, ProjectId, UserId, apId, isNil, spreadIfDefined } from '@activepieces/shared'
import { databaseConnection } from '../../database/database-connection'
import { PlatformEntity } from './platform.entity'
import { FilteredPieceBehavior, LocalesEnum, Platform, PlatformId, UpdatePlatformRequestBody } from '@activepieces/ee-shared'
import { defaultTheme } from '../../flags/theme'
import { userService } from '../../user/user-service'
import { projectService } from '../../project/project-service'

const repo = databaseConnection.getRepository<Platform>(PlatformEntity)

export const platformService = {
    async add(params: AddParams): Promise<Platform> {
        const { ownerId, projectId, name, primaryColor, logoIconUrl, fullLogoUrl, favIconUrl } = params

        const newPlatform: NewPlatform = {
            id: apId(),
            ownerId,
            name,
            primaryColor: primaryColor ?? defaultTheme.colors.primary.default,
            logoIconUrl: logoIconUrl ?? defaultTheme.logos.logoIconUrl,
            fullLogoUrl: fullLogoUrl ?? defaultTheme.logos.fullLogoUrl,
            favIconUrl: favIconUrl ?? defaultTheme.logos.favIconUrl,
            defaultLocale: LocalesEnum.ENGLISH,
            filteredPieceNames: [],
            filteredPieceBehavior: FilteredPieceBehavior.BLOCKED,
            showPoweredBy: false,
            cloudAuthEnabled: true,
        }

        const savedPlatform = await repo.save(newPlatform)

        await addOwnerToPlatform({
            platformId: newPlatform.id,
            ownerId,
        })

        await addProjectToPlatform({
            platformId: newPlatform.id,
            projectId,
        })

        return savedPlatform
    },

    async getOldestPlatform(): Promise<Platform | null> {
        return repo.findOne({
            where: {},
            order: {
                created: 'ASC',
            },
        })
    },
    async update(params: UpdateParams): Promise<Platform> {
        const platform = await this.getOneOrThrow(params.id)
        assertPlatformOwnedByUser(platform, params.userId)

        const updatedPlatform: Platform = {
            ...platform,
            ...spreadIfDefined('name', params.name),
            ...spreadIfDefined('primaryColor', params.primaryColor),
            ...spreadIfDefined('logoIconUrl', params.logoIconUrl),
            ...spreadIfDefined('fullLogoUrl', params.fullLogoUrl),
            ...spreadIfDefined('favIconUrl', params.favIconUrl),
            ...spreadIfDefined('filteredPieceNames', params.filteredPieceNames),
            ...spreadIfDefined('filteredPieceBehavior', params.filteredPieceBehavior),
            ...spreadIfDefined('smtpHost', params.smtpHost),
            ...spreadIfDefined('smtpPort', params.smtpPort),
            ...spreadIfDefined('smtpUser', params.smtpUser),
            ...spreadIfDefined('smtpPassword', params.smtpPassword),
            ...spreadIfDefined('smtpSenderEmail', params.smtpSenderEmail),
            ...spreadIfDefined('smtpUseSSL', params.smtpUseSSL),
            ...spreadIfDefined('privacyPolicyUrl', params.privacyPolicyUrl),
            ...spreadIfDefined('termsOfServiceUrl', params.termsOfServiceUrl),
            ...spreadIfDefined('cloudAuthEnabled', params.cloudAuthEnabled),
            ...spreadIfDefined('defaultLocale', params.defaultLocale),
        }

        return repo.save(updatedPlatform)
    },

    async getOneOrThrow(id: PlatformId): Promise<Platform> {
        const platform = await repo.findOneBy({
            id,
        })

        assertPlatformExists(platform)
        return platform
    },

    async getOne(id: PlatformId): Promise<Platform | null> {
        return repo.findOneBy({
            id,
        })
    },

    async getOneByOwner({ ownerId }: GetOneByOwnerParams): Promise<Platform | null> {
        return repo.findOneBy({
            ownerId,
        })
    },

    async checkUserIsOwner({ platformId, userId }: CheckUserIsOwnerParams): Promise<boolean> {
        const platform = await this.getOneOrThrow(platformId)
        return platform.ownerId === userId
    },
}

const assertPlatformExists: (platform: Platform | null) => asserts platform is Platform = (platform) => {
    if (isNil(platform)) {
        throw new ActivepiecesError({
            code: ErrorCode.ENTITY_NOT_FOUND,
            params: {
                message: 'platform not found',
            },
        })
    }
}

const assertPlatformOwnedByUser = (platform: Platform, userId: UserId): void => {
    if (platform.ownerId !== userId) {
        throw new ActivepiecesError({
            code: ErrorCode.AUTHORIZATION,
            params: {},
        })
    }
}

const addOwnerToPlatform = ({ platformId, ownerId }: AddOwnerToPlatformParams): Promise<void> => {
    return userService.updatePlatformId({
        id: ownerId,
        platformId,
    })
}

const addProjectToPlatform = ({ platformId, projectId }: AddProjectToPlatformParams): Promise<void> => {
    return projectService.addProjectToPlatform({
        projectId,
        platformId,
    })
}

type AddParams = {
    ownerId: UserId
    projectId: ProjectId
    name: string
    primaryColor?: string
    logoIconUrl?: string
    fullLogoUrl?: string
    favIconUrl?: string
}

type NewPlatform = Omit<Platform, 'created' | 'updated'>

type UpdateParams = UpdatePlatformRequestBody & {
    id: PlatformId
    userId: UserId
}

type GetOneByOwnerParams = {
    ownerId: UserId
}

type CheckUserIsOwnerParams = {
    platformId: PlatformId
    userId: UserId
}

type AddOwnerToPlatformParams = {
    platformId: PlatformId
    ownerId: UserId
}

type AddProjectToPlatformParams = {
    platformId: PlatformId
    projectId: ProjectId
}
