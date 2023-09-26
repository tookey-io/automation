import { FastifyRequest } from 'fastify'
import { storeEntryService } from './store-entry.service'
import { DeletStoreEntryRequest, GetStoreEntryRequest, PrincipalType, PutStoreEntryRequest } from '@activepieces/shared'
import { StatusCodes } from 'http-status-codes'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

export const storeEntryController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post(
        '/',
        {
            schema: {
                body: PutStoreEntryRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Body: PutStoreEntryRequest
            }>,
            _reply,
        ) => {
            return storeEntryService.upsert({
                projectId: request.principal.projectId,
                request: request.body,
            })
        },
    )

    fastify.get(
        '/',
        {
            schema: {
                querystring: GetStoreEntryRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Querystring: GetStoreEntryRequest
            }>,
            _reply,
        ) => {
            return storeEntryService.getOne({
                projectId: request.principal.projectId, key: request.query.key,
            })
        },
    )


    fastify.delete(
        '/',
        {
            schema: {
                querystring: DeletStoreEntryRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Querystring: DeletStoreEntryRequest
            }>,
            reply,
        ) => {
            if (request.principal.type !== PrincipalType.WORKER) {
                return reply.status(StatusCodes.FORBIDDEN)
            }
            else {
                return await storeEntryService.delete({
                    projectId: request.principal.projectId, key: request.query.key,
                })
            }
        },
    )
}
