import { ExternalUserRequest, ExternalUserAuthRequest, ExternalServiceAuthRequest, SignUpRequest, AuthenticationResponse, PrincipalType, SignInRequest, TelemetryEventName, ApFlagId, apId, ApId, ActivepiecesError, ErrorCode, UserStatus } from '@activepieces/shared'
import { userService } from '../user/user-service'
import { passwordHasher } from './lib/password-hasher'
import { tokenUtils } from './lib/token-utils'
import { system } from '../helper/system/system'
import { SystemProp } from '../helper/system/system-prop'
import { projectService } from '../project/project-service'
import { flagService } from '../flags/flag.service'
import { QueryFailedError } from 'typeorm'
import { telemetry } from '../helper/telemetry.utils'
import { logger } from '../helper/logger'

export const authenticationService = {
    externalServiceAuth: async (request: ExternalServiceAuthRequest): Promise<{ token: string }> => {
        const passwordMatches = await passwordHasher.compare(request.password, system.getOrThrow(SystemProp.EXTERNAL_PASSWORD))
        if (!passwordMatches) {
            throw new ActivepiecesError({
                code: ErrorCode.INVALID_CREDENTIALS,
                params: {
                    email: 'EXTERNAL',
                },
            })
        }

        const token = await tokenUtils.encode({
            id: 'EXTERNAL',
            type: PrincipalType.EXTERNAL,
            projectId: 'EXTERNAL',
            externalId: 'EXTERNAL',
        })

        return { token }
    },
    externalUserInject: async (request: ExternalUserRequest): Promise<AuthenticationResponse> => {
        return authenticationService.signUp({
            ...request,
            email: request.id,
            password: apId(),
        })
    },
    externalUserAuth: async (request: ExternalUserAuthRequest): Promise<AuthenticationResponse> => {
        const user = await userService.getOneByEmail({
            email: request.id,
        })

        if (user === null) {
            throw new ActivepiecesError({
                code: ErrorCode.INVALID_CREDENTIALS,
                params: {
                    email: request.id,
                },
            })
        }

        // Currently each user have exactly one project.
        const project = await projectService.getUserProject(user.id)

        telemetry.identify(user, project.id)
            .catch((e) => logger.error(e, '[AuthenticationService#signUp] telemetry.identify'))

        const token = await tokenUtils.encode({
            id: user.id,
            type: PrincipalType.USER,
            projectId: project.id,
        })

        const { password: _, ...filteredUser } = user

        return {
            ...filteredUser,
            token,
            projectId: project.id,
        }
    },
    user: async (request: ApId) => {
        const user = await userService.getOneById(request)
        if (!user) {
            throw new ActivepiecesError({
                code: ErrorCode.USER_NOT_FOUND,
                params: {
                    id: request,
                },
            })
        }
        const { password: _, ...filteredUser } = user

        return {
            ...filteredUser,
        }
    },
    signUp: async (request: SignUpRequest): Promise<AuthenticationResponse> => {
        try {
            const user = await userService.create(request, UserStatus.VERIFIED)

            await flagService.save({ id: ApFlagId.USER_CREATED, value: true })

            const project = await projectService.create({
                displayName: user.firstName + '\'s Project',
                ownerId: user.id,
            })

            const token = await tokenUtils.encode({
                id: user.id,
                type: PrincipalType.USER,
                projectId: project.id,
            })

            telemetry.identify(user, project.id)
                .catch((e) => logger.error(e, '[AuthenticationService#signUp] telemetry.identify'))

            telemetry.trackProject(project.id, {
                name: TelemetryEventName.SIGNED_UP,
                payload: {
                    userId: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    projectId: project.id,
                },
            })
                .catch((e) => logger.error(e, '[AuthenticationService#signUp] telemetry.trackProject'))

            const { password: _, ...filteredUser } = user

            return {
                ...filteredUser,
                token,
                projectId: project.id,
            }
        }
        catch (e: unknown) {
            if (e instanceof QueryFailedError) {
                throw new ActivepiecesError({
                    code: ErrorCode.EXISTING_USER,
                    params: {
                        email: request.email,
                    },
                })
            }

            throw e
        }
    },

    signIn: async (request: SignInRequest): Promise<AuthenticationResponse> => {
        const user = await userService.getOneByEmail({
            email: request.email,
        })

        if (user === null) {
            throw new ActivepiecesError({
                code: ErrorCode.INVALID_CREDENTIALS,
                params: {
                    email: request.email,
                },
            })
        }

        const passwordMatches = await passwordHasher.compare(request.password, user.password)

        if (!passwordMatches) {
            throw new ActivepiecesError({
                code: ErrorCode.INVALID_CREDENTIALS,
                params: {
                    email: request.email,
                },
            })
        }

        // Currently each user have exactly one project.
        const project = await projectService.getUserProject(user.id)

        const token = await tokenUtils.encode({
            id: user.id,
            type: PrincipalType.USER,
            projectId: project.id,
        })

        const { password: _, ...filteredUser } = user

        return {
            ...filteredUser,
            token,
            projectId: project.id,
        }
    },
}
