import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ApFlagId, PrincipalType, ExternalUserRequest, ExternalUserAuthRequest, ExternalServiceAuthRequest, SignInRequest, SignUpRequest } from '@activepieces/shared'
import { StatusCodes } from 'http-status-codes'
import { authenticationService } from './authentication.service'
import { flagService } from '../flags/flag.service'
import { system } from '../helper/system/system'
import { SystemProp } from '../helper/system/system-prop'

export const authenticationController = async (app: FastifyInstance) => {
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
                reply.code(403).send({
                    message: 'Sign up is disabled',
                })
                return
            }
            const authenticationResponse = await authenticationService.signUp(request.body)
            reply.send(authenticationResponse)
        },
    )

    app.post(
        '/sign-in',
        {
            schema: {
                body: SignInRequest,
            },
        },
        async (request: FastifyRequest<{ Body: SignInRequest }>, reply: FastifyReply) => {
            const authenticationResponse = await authenticationService.signIn(request.body)
            reply.send(authenticationResponse)
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
        async (request: FastifyRequest, reply: FastifyReply) => {
            reply.send(request.principal)
        },
    )
    app.get(
        '/me/full',
        async (request: FastifyRequest, reply: FastifyReply) => {
            reply.send(await authenticationService.user(request.principal.id))
        },
    )
}
