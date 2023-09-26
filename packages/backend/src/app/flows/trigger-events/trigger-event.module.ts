import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { ListTriggerEventsRequest, TestPollingTriggerRequest } from '@activepieces/shared'
import { triggerEventService } from './trigger-event.service'
import { flowService } from '../flow/flow.service'

const DEFAULT_PAGE_SIZE = 10

export const triggerEventModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(triggerEventController, { prefix: '/v1/trigger-events' })
}

const triggerEventController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get(
        '/poll',
        {
            schema: {
                querystring: TestPollingTriggerRequest,
            },
        },
        async (request) => {
            const flow = await flowService.getOneOrThrow({
                projectId: request.principal.projectId,
                id: request.query.flowId,
            })

            return await triggerEventService.test({
                projectId: request.principal.projectId,
                flow,
            })
        },
    )

    fastify.post(
        '/',
        {
            schema: {
                querystring: TestPollingTriggerRequest,
            },
        },
        async (request) => {
            return await triggerEventService.saveEvent({
                projectId: request.principal.projectId,
                flowId: request.query.flowId,
                payload: request.body,
            })
        },
    )

    fastify.get(
        '/',
        {
            schema: {
                querystring: ListTriggerEventsRequest,
            },
        },
        async (request) => {
            const flow = await flowService.getOneOrThrow({ projectId: request.principal.projectId, id: request.query.flowId })
            return await triggerEventService.list({
                projectId: request.principal.projectId,
                flow,
                cursor: request.query.cursor ?? null,
                limit: request.query.limit ?? DEFAULT_PAGE_SIZE,
            })
        },
    )
}
