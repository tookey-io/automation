import {
    ListFlowVersionRequest,
    SeekPage,
} from '@activepieces/shared'
import { StatusCodes } from 'http-status-codes'
import { flowService } from './flow.service'
import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { flowVersionService } from '../flow-version/flow-version.service'
import { FlowVersionMetadata } from '@activepieces/shared'

const DEFUALT_PAGE_SIZE = 10

export const flowVersionController: FastifyPluginAsyncTypebox = async (fastify) => {

    fastify.get('/:flowId/versions', {
        schema: {
            params: Type.Object({
                flowId: Type.String(),
            }),
            querystring: ListFlowVersionRequest,
            response: {
                [StatusCodes.OK]: SeekPage(FlowVersionMetadata),
            },
        },
        
    }, async (request) => {
        const flow = await flowService.getOneOrThrow({ id: request.params.flowId, projectId: request.principal.projectId })
        return flowVersionService.list({
            flowId: flow.id,
            limit: request.query.limit ?? DEFUALT_PAGE_SIZE,
            cursorRequest: request.query.cursor ?? null,
        })
    })


}
