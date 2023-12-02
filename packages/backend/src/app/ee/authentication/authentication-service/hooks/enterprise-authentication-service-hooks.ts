import {
    defaultAuthenticationServiceHooks,
} from '../../../../authentication/authentication-service/hooks/default-authentication-service-hooks'
import {
    AuthenticationServiceHooks,
} from '../../../../authentication/authentication-service/hooks/authentication-service-hooks'
import { flagService } from '../../../../flags/flag.service'
import { ApFlagId, PrincipalType, ProjectType, isNil } from '@activepieces/shared'
import { platformService } from '../../../platform/platform.service'
import { accessTokenManager } from '../../../../authentication/lib/access-token-manager'
import { projectService } from '../../../../project/project-service'
import { Platform, PlatformId } from '@activepieces/ee-shared'

const DEFAULT_PLATFORM_NAME = 'platform'

export const enterpriseAuthenticationServiceHooks: AuthenticationServiceHooks = {
    async postSignUp({ user }) {
        const { user: updatedUser, project, token } = await defaultAuthenticationServiceHooks.postSignUp({
            user,
        })

        const platformCreated = await flagService.getOne(ApFlagId.PLATFORM_CREATED)

        if (platformCreated) {
            return {
                user: updatedUser,
                project,
                token,
            }
        }

        const platform = await platformService.add({
            ownerId: user.id,
            name: DEFAULT_PLATFORM_NAME,
        })

        await projectService.addProjectToPlatform({
            projectId: project.id,
            platformId: platform.id,
        })

        await flagService.save({
            id: ApFlagId.PLATFORM_CREATED,
            value: true,
        })

        const updatedToken = await accessTokenManager.generateToken({
            id: user.id,
            type: PrincipalType.USER,
            projectId: project.id,
            projectType: ProjectType.PLATFORM_MANAGED,
            platform: {
                id: platform.id,
                role: platform.ownerId === user.id ? 'OWNER' : 'MEMBER',
            },
        })

        return {
            user: updatedUser,
            project,
            token: updatedToken,
        }
    },

    async postSignIn({ user }) {
        const { user: updatedUser, project, token } = await defaultAuthenticationServiceHooks.postSignIn({
            user,
        })

        const platform = await getPlatform(project.platformId)

        if (isNil(platform)) {
            return {
                user: updatedUser,
                project,
                token,
            }
        }

        const updatedToken = await accessTokenManager.generateToken({
            id: user.id,
            type: PrincipalType.USER,
            projectId: project.id,
            projectType: project.type,
            platform: {
                id: platform.id,
                role: platform.ownerId === user.id ? 'OWNER' : 'MEMBER',
            },
        })

        return {
            user: updatedUser,
            project,
            token: updatedToken,
        }
    },
}

const getPlatform = async (platformId: PlatformId | undefined): Promise<Platform | null> => {
    if (isNil(platformId)) {
        return null
    }

    return platformService.getOne(platformId)
}
