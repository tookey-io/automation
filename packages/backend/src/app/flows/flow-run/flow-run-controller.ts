import { FastifyReply, FastifyRequest } from 'fastify'
import { FastifyPluginCallbackTypebox, Type } from '@fastify/type-provider-typebox'
import { TestFlowRunRequestBody, FlowRunId, ListFlowRunsRequestQuery, ApId, ALL_PRINICPAL_TYPES, ExecutionType, isNil } from '@activepieces/shared'
import { ActivepiecesError, ErrorCode, RetryFlowRequestBody } from '@activepieces/shared'
import { flowRunService } from './flow-run-service'
import { flowResponseWatcher } from './flow-response-watcher'
import { StatusCodes } from 'http-status-codes'

const DEFAULT_PAGING_LIMIT = 10

type GetOnePathParams = {
    id: FlowRunId
}

const TestFlowRunRequest = {
    schema: {
        body: TestFlowRunRequestBody,
    },
}

const ResumeFlowRunRequest = {
    config: {
        allowedPrincipals: ALL_PRINICPAL_TYPES,
    },
    schema: {
        params: Type.Object({
            id: ApId,
        }),
        querystring: Type.Object({
            action: Type.String(),
        }),
    },
}

const RetryFlowRequest = {
    schema: {
        params: Type.Object({
            id: ApId,
        }),
        querystring: RetryFlowRequestBody,
    },
}

export const flowRunController: FastifyPluginCallbackTypebox = (app, _options, done): void => {
    app.post('/test', TestFlowRunRequest, async (req) => {
        const { projectId } = req.principal
        const { flowVersionId } = req.body

        return flowRunService.test({
            projectId,
            flowVersionId,
        })
    },
    )

    // list
    app.get('/', ListRequest, async (request, reply) => {
        const flowRunPage = await flowRunService.list({
            projectId: request.principal.projectId,
            flowId: request.query.flowId,
            tags: request.query.tags,
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


    app.all('/:id/resume', ResumeFlowRunRequest, async (req) => {
        await flowRunService.addToQueue({
            flowRunId: req.params.id,
            payload: {
                action: req.query.action,
                body: req.body,
                headers: req.headers,
                query: req.query,
            },
            executionType: ExecutionType.RESUME,
        })
    })


    app.all('/:id/resume/sync', ResumeFlowRunRequest, async (req, reply) => {
        const synchronousHandlerId = flowResponseWatcher.getHandlerId()
        const flowRun = await flowRunService.addToQueue({
            flowRunId: req.params.id,
            payload: {
                action: req.query.action,
                body: req.body,
                headers: req.headers,
                query: req.query,
            },
            executionType: ExecutionType.RESUME,
            synchronousHandlerId
        })


        if (isNil(flowRun)) {
            await reply.status(StatusCodes.NOT_FOUND).send()
            return
        }

        console.log('-------------- waiting for response - ' + flowRun.id)
        const response = await flowResponseWatcher.listen(flowRun.id)

        console.log('---- response --')
        console.log(response)
        await reply.status(response.status).headers(response.headers).send(response.body)
    })


    app.post('/:id/retry', RetryFlowRequest, async (req) => {
        await flowRunService.retry({
            flowRunId: req.params.id,
            strategy: req.query.strategy,
        })
    })

    done()
}

const ListRequest = {
    schema: {
        querystring: ListFlowRunsRequestQuery,
    },
}