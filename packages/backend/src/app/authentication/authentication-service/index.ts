import { QueryFailedError } from 'typeorm'
import { AuthenticationResponse, SignInRequest, UserStatus, ActivepiecesError, ErrorCode, apId, ExternalUserRequest, ExternalUserAuthRequest, ExternalServiceAuthRequest, PrincipalType } from '@activepieces/shared'
import { userService } from '../../user/user-service'
import { passwordHasher } from '../lib/password-hasher'
import { authenticationServiceHooks as hooks } from './hooks'
import { system } from '../../helper/system/system'
import { SystemProp } from '../../helper/system/system-prop'
import { accessTokenManager } from '../lib/access-token-manager'

export const authenticationService = {
    // TODO: Move to authentication service
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

        const token = await accessTokenManager.generateToken({
            id: 'EXTERNAL',
            type: PrincipalType.EXTERNAL,
            projectId: 'EXTERNAL',
        })

        return { token }
    },
    externalUserInject: async (request: ExternalUserRequest): Promise<AuthenticationResponse> => {
        return authenticationService.signUp({
            ...request,
            email: request.id,
            password: apId(),
            status: UserStatus.VERIFIED
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
        const { user: updatedUser, project, token } = await hooks.get().postSignIn({
            user,
        })

        const { password: _, ...filteredUser } = updatedUser

        return {
            ...filteredUser,
            token,
            projectId: project.id,
        }
    },
    // user: async (request: ApId) => {
    //     const user = await userService.getOneById(request)
    //     if (!user) {
    //         throw new ActivepiecesError({
    //             code: ErrorCode.USER_NOT_FOUND,
    //             params: {
    //                 id: request,
    //             },
    //         })
    //     }
    //     const { password: _, ...filteredUser } = user

    //     return {
    //         ...filteredUser,
    //     }
    // },
    signUp: async (request: { email: string, password: string, firstName: string, lastName: string, trackEvents: boolean, newsLetter: boolean, status: UserStatus }): Promise<AuthenticationResponse> => {
        try {
            const user = await userService.create({
                ...request,
            })

            const { user: updatedUser, project, token } = await hooks.get().postSignUp({
                user,
            })

            const { password: _, ...filteredUser } = updatedUser

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

        const { user: updatedUser, project, token } = await hooks.get().postSignIn({
            user,
        })

        const { password: _, ...filteredUser } = updatedUser

        return {
            ...filteredUser,
            token,
            projectId: project.id,
        }
    },
}
