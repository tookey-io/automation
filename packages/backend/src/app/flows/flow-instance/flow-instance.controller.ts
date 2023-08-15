import { GetFlowInstanceRequest, UpdateFlowInstanceRequest, UpsertFlowInstanceRequest } from '@activepieces/shared'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { flowInstanceService } from './flow-instance.service'

export const flowInstanceController = async (app: FastifyInstance) => {

    // Upsert
    app.post(
        '/',
        {
            schema: {
                body: UpsertFlowInstanceRequest,
            },
        },
        async (request: FastifyRequest<{ Body: UpsertFlowInstanceRequest }>) => {
            return flowInstanceService.upsert({ userId: request.principal.id, projectId: request.principal.projectId, request: request.body })
        },
    )

    app.post(
        '/:flowId',
        {
            schema: {
                params: GetFlowInstanceRequest,
                body: UpdateFlowInstanceRequest,
            },
        },
        async (request: FastifyRequest<{ Body: UpdateFlowInstanceRequest, Params: GetFlowInstanceRequest }>) => {
            return flowInstanceService.update({ projectId: request.principal.projectId, 
                status: request.body.status, 
                flowId: request.params.flowId })
        },
    )

    app.get('/', {
        schema: {
            querystring: GetFlowInstanceRequest,
        },

    }, async (request: FastifyRequest<{
        Querystring: GetFlowInstanceRequest
    }>) => {
        return flowInstanceService.get({ projectId: request.principal.projectId, flowId: request.query.flowId })
    })


}