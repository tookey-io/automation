import { ALL_PRINICPAL_TYPES, ApEdition, ExternalServiceAuthRequest, ExternalUserAuthRequest, ExternalUserRequest, PrincipalType, SignInRequest, SignUpRequest, UserStatus } from '@activepieces/shared'
import { authenticationService } from './authentication-service'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { resolvePlatformIdForRequest } from '../ee/platform/lib/platform-utils'
import { getEdition } from '../helper/secret-helper'

const edition = getEdition()

export const authenticationController: FastifyPluginAsyncTypebox = async (app) => {
    app.post('/sign-up', SignUpRequestOptions, async (request) => {
        const platformId = await resolvePlatformIdForRequest(request)

        return authenticationService.signUp({
            ...request.body,
            verified: edition === ApEdition.COMMUNITY,
            platformId,
            skipAsserting: undefined
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
            config: {
                allowedPrincipals: [PrincipalType.EXTERNAL],
            },
            schema: {
                body: ExternalUserRequest,
            },
        },
        async (request, reply) => {
            return authenticationService.federatedAuthn({
                email: request.body.id,
                verified: true,
                firstName: request.body.firstName,
                lastName: request.body.lastName,
                platformId: null,
                skipAsseting: true
            })
        },
    )

    app.post(
        '/external/user/auth',
        {
            config: {
                allowedPrincipals: [PrincipalType.EXTERNAL],
            },
            schema: {
                body: ExternalUserAuthRequest,
            },
        },
        async (request, reply) => {
            return authenticationService.federatedAuthn({
                email: request.body.id,
                verified: true,
                firstName: '', // SHOULD BE AVAILABLE IN PREVIOUSLY INJECTED USER
                lastName: '', // SHOULD BE AVAILABLE IN PREVIOUSLY INJECTED USER
                platformId: null,
                skipAsseting: true
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
