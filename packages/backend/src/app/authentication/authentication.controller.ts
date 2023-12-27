import { ALL_PRINICPAL_TYPES, ApEdition, ExternalServiceAuthRequest, ExternalUserAuthRequest, ExternalUserRequest, PrincipalType, SignInRequest, SignUpRequest, UserStatus } from '@activepieces/shared'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { resolvePlatformIdForRequest } from '../ee/platform/lib/platform-utils'
import { getEdition } from '../helper/secret-helper'
import { authenticationService } from './authentication-service'

const edition = getEdition()

export const authenticationController: FastifyPluginAsyncTypebox = async (app) => {
    app.post('/sign-up', SignUpRequestOptions, async (request) => {
        const platformId = await resolvePlatformIdForRequest(request)

        return authenticationService.signUp({
            ...request.body,
            status: edition === ApEdition.COMMUNITY ? UserStatus.VERIFIED : UserStatus.CREATED,
            platformId,
        })
    })

    app.post('/sign-in', SignInRequestOptions, async (request) => {
        const platformId = await resolvePlatformIdForRequest(request)

        return authenticationService.signIn({
            ...request.body,
            platformId,
        })
    })

    // TODO: Move to authentication service
    app.post(
        '/external/user/inject',
        {
            schema: {
                body: ExternalUserRequest,
            },
        },
        async (request, reply) => {
            if (request.principal.type !== PrincipalType.EXTERNAL) {
                reply.status(StatusCodes.FORBIDDEN)
                return
            }

            return authenticationService.federatedAuthn({
                email: request.body.id,
                userStatus: UserStatus.VERIFIED,
                firstName: request.body.firstName,
                lastName: request.body.lastName,
                platformId: 'EXTERNAL'
            })
        },
    )

    app.post(
        '/external/user/auth',
        {
            schema: {
                body: ExternalUserAuthRequest,
            },
        },
        async (request, reply) => {
            console.log(request, request.principal)
            if (request.principal.type !== PrincipalType.EXTERNAL) {
                reply.status(StatusCodes.FORBIDDEN)
                return
            }

            return authenticationService.federatedAuthn({
                email: request.body.id,
                userStatus: UserStatus.VERIFIED,
                firstName: '', // SHOULD BE AVAILABLE IN PREVIOUSLY INJECTED USER
                lastName: '', // SHOULD BE AVAILABLE IN PREVIOUSLY INJECTED USER
                platformId: 'EXTERNAL'
            })
        },
    )
    app.post(
        '/external/service/auth',
        {
            schema: {
                body: ExternalServiceAuthRequest,
            },
        },
        async (request, reply) => {
            const authenticationResponse = await authenticationService.externalServiceAuth(request.body)
            reply.send(authenticationResponse)
        },
    )

    // app.get(
    //     '/me',
    //     async (request: FastifyRequest) => {
    //         return request.principal
    //     },
    // )
    // app.get(
    //     '/me/full',
    //     async (request: FastifyRequest, reply: FastifyReply) => {
    //         reply.send(await authenticationService.user(request.principal.id))
    //     },
    // )
}

const SignUpRequestOptions = {
    config: {
        allowedPrincipals: ALL_PRINICPAL_TYPES,
    },
    schema: {
        body: SignUpRequest,
    },
}

const SignInRequestOptions = {
    config: {
        allowedPrincipals: ALL_PRINICPAL_TYPES,
    },
    schema: {
        body: SignInRequest,
    },
}
