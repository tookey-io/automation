import { FastifyReply, FastifyRequest } from 'fastify'
import { FastifyPluginCallbackTypebox, Type } from '@fastify/type-provider-typebox'
import { ApId, CreateFlowRunRequest, ExecutionType, FlowRunId, ListFlowRunsRequestQuery, RunEnvironment } from '@activepieces/shared'
import { ActivepiecesError, ErrorCode } from '@activepieces/shared'
import { flowRunService } from './flow-run-service'

const DEFAULT_PAGING_LIMIT = 10

type GetOnePathParams = {
    id: FlowRunId
}

const ResumeFlowRunRequest = {
    schema: {
        params: Type.Object({
            id: ApId,
        }),
        querystring: Type.Object({
            action: Type.String(),
        }),
    },
}

export const flowRunController: FastifyPluginCallbackTypebox = (app, _options, done): void => {
    app.post(
        '/',
        {
            schema: {
                body: CreateFlowRunRequest,
            },
        },
        async (request: FastifyRequest<{ Body: CreateFlowRunRequest }>, reply: FastifyReply) => {
            const { flowVersionId, payload } = request.body
            const flowRun = await flowRunService.start({
                environment: RunEnvironment.TESTING,
                flowVersionId,
                payload,
                projectId: request.principal.projectId,
                executionType: ExecutionType.BEGIN,
            })

            await reply.send(flowRun)
        },
    )

    // list
    app.get('/', {
        schema: {
            querystring: ListFlowRunsRequestQuery,
        },
    }, async (request, reply) => {
        const flowRunPage = await flowRunService.list({
            projectId: request.principal.projectId,
            flowId: request.query.flowId,
            status: request.query.status,
            cursor: request.query.cursor ?? null,
            limit: Number(request.query.limit ?? DEFAULT_PAGING_LIMIT),
        })

        await reply.send(flowRunPage)
    })

    // get one
    app.get('/:id', async (request: FastifyRequest<{ Params: GetOnePathParams }>, reply: FastifyReply) => {
        const flowRun = await flowRunService.getOne({
            projectId: request.principal.projectId,
            id: request.params.id,
        })

        if (flowRun == null) {
            throw new ActivepiecesError({
                code: ErrorCode.FLOW_RUN_NOT_FOUND,
                params: {
                    id: request.params.id,
                },
            })
        }

        await reply.send(flowRun)
    })

    app.get('/:id/resume', ResumeFlowRunRequest, async (req) => {
        await flowRunService.resume({
            flowRunId: req.params.id,
            action: req.query.action,
        })
    })

    done()
}
