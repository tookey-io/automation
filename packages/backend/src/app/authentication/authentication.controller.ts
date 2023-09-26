import { ApFlagId, PrincipalType, ExternalUserRequest, ExternalUserAuthRequest, ExternalServiceAuthRequest, SignInRequest, SignUpRequest } from '@activepieces/shared'
import { StatusCodes } from 'http-status-codes'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { authenticationService } from './authentication.service'
import { flagService } from '../flags/flag.service'
import { system } from '../helper/system/system'
import { SystemProp } from '../helper/system/system-prop'
import { FastifyReply, FastifyRequest } from 'fastify'

export const authenticationController: FastifyPluginAsyncTypebox = async (app) => {
    app.post(
        '/sign-up',
        {
            schema: {
                body: SignUpRequest,
            },
        },
        async (request: FastifyRequest<{ Body: SignUpRequest }>, reply: FastifyReply) => {
            const userCreated = await flagService.getOne(ApFlagId.USER_CREATED)
            const signUpEnabled = system.getBoolean(SystemProp.SIGN_UP_ENABLED) ?? false

            if (userCreated && !signUpEnabled) {
                return reply.code(403).send({
                    message: 'Sign up is disabled',
                })
            }

            return authenticationService.signUp(request.body)
        },
    )

    app.post(
        '/sign-in',
        {
            schema: {
                body: SignInRequest,
            },
        },
        async (request: FastifyRequest<{ Body: SignInRequest }>) => {
            return authenticationService.signIn(request.body)
        },
    )

    app.post(
        '/external/user/inject',
        {
            schema: {
                body: ExternalUserRequest,
            },
        },
        async (request: FastifyRequest<{ Body: ExternalUserRequest }>, reply: FastifyReply) => {
            if (request.principal.type !== PrincipalType.EXTERNAL) {
                reply.status(StatusCodes.FORBIDDEN)
                return
            }

            const authenticationResponse = await authenticationService.externalUserInject(request.body)
            reply.send(authenticationResponse)
        },
    )

    app.post(
        '/external/user/auth',
        {
            schema: {
                body: ExternalUserAuthRequest,
            },
        },
        async (request: FastifyRequest<{ Body: ExternalUserAuthRequest }>, reply: FastifyReply) => {
            if (request.principal.type !== PrincipalType.EXTERNAL) {
                reply.status(StatusCodes.FORBIDDEN)
                return
            }

            const authenticationResponse = await authenticationService.externalUserAuth(request.body)
            reply.send(authenticationResponse)
        },
    )
    app.post(
        '/external/service/auth',
        {
            schema: {
                body: ExternalServiceAuthRequest,
            },
        },
        async (request: FastifyRequest<{ Body: ExternalServiceAuthRequest }>, reply: FastifyReply) => {
            const authenticationResponse = await authenticationService.externalServiceAuth(request.body)
            reply.send(authenticationResponse)
        },
    )

    app.get(
        '/me',
        async (request: FastifyRequest) => {
            return request.principal
        },
    )
    app.get(
        '/me/full',
        async (request: FastifyRequest, reply: FastifyReply) => {
            reply.send(await authenticationService.user(request.principal.id))
        },
    )
}
