import { FastifyRequest } from 'fastify'
import { ConnectionKeyId, GetOrDeleteConnectionFromTokenRequest, ListConnectionKeysRequest, UpsertConnectionFromToken, UpsertSigningKeyConnection } from '@activepieces/ee-shared'
import { connectionKeyService } from './connection-key.service'
import { StatusCodes } from 'http-status-codes'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { appConnectionService } from '../../app-connection/app-connection-service/app-connection-service'

export const connectionKeyModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(connectionKeyController, { prefix: '/v1/connection-keys' })
}

const DEFAULT_LIMIT_SIZE = 10

const connectionKeyController: FastifyPluginAsyncTypebox = async (fastify) => {


    fastify.delete(
        '/app-connections',
        {
            schema: {
                querystring: GetOrDeleteConnectionFromTokenRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Querystring: GetOrDeleteConnectionFromTokenRequest
            }>,
        ) => {
            const appConnection = await connectionKeyService.getConnection(request.query)
            if (appConnection !== null) {
                await appConnectionService.delete({ projectId: request.query.projectId, id: appConnection.id })
            }
        },
    )

    fastify.get(
        '/app-connections',
        {
            schema: {
                querystring: GetOrDeleteConnectionFromTokenRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Querystring: GetOrDeleteConnectionFromTokenRequest
            }>,
        ) => {
            return connectionKeyService.getConnection(request.query)
        },
    )


    fastify.post(
        '/app-connections',
        {
            schema: {
                body: UpsertConnectionFromToken,
            },
        },
        async (
            request: FastifyRequest<{
                Body: UpsertConnectionFromToken
            }>,
        ) => {
            return connectionKeyService.createConnection(request.body)
        },
    )

    fastify.get('/', {
        schema: {
            querystring: ListConnectionKeysRequest,
        },
    }, async (request: FastifyRequest<
    {
        Querystring: ListConnectionKeysRequest
    }>) => {
        return connectionKeyService.list(request.principal.projectId, request.query.cursor ?? null, request.query.limit ?? DEFAULT_LIMIT_SIZE)
    })


    fastify.post(
        '/',
        {
            schema: {
                body: UpsertSigningKeyConnection,
            },
        },
        async (
            request: FastifyRequest<{
                Body: UpsertSigningKeyConnection
            }>,
        ) => {
            return connectionKeyService.upsert({
                projectId: request.principal.projectId,
                request: request.body,
            })
        },
    )


    fastify.delete(
        '/:connectionkeyId',
        async (
            request: FastifyRequest<{
                Params: {
                    connectionkeyId: ConnectionKeyId
                }
            }>,
            reply,
        ) => {
            await connectionKeyService.delete(request.params.connectionkeyId)
            return reply.status(StatusCodes.OK).send()
        },
    )
}
