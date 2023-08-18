import { FastifyInstance, FastifyRequest } from 'fastify'
import { storeEntryService } from './store-entry.service'
import { DeletStoreEntryRequest, GetStoreEntryRequest, PrincipalType, PutStoreEntryRequest } from '@activepieces/shared'
import { StatusCodes } from 'http-status-codes'

export const storeEntryController = async (fastify: FastifyInstance) => {
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
            _reply,
        ) => {
            if (request.principal.type !== PrincipalType.WORKER) {
                _reply.status(StatusCodes.FORBIDDEN)
                return
            }
            else {
                return await storeEntryService.delete({
                    projectId: request.principal.projectId, key: request.query.key,
                })
            }
        },
    )
}
