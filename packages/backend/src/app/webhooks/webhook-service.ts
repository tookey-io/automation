import {
    EventPayload,
    ExecutionType,
    Flow,
    FlowId,
    FlowInstanceStatus,
    FlowRun,
    FlowVersion,
    ProjectId,
    RunEnvironment,
} from '@activepieces/shared'
import { flowRunService } from '../flows/flow-run/flow-run-service'
import { flowVersionService } from '../flows/flow-version/flow-version.service'
import { ActivepiecesError, ErrorCode } from '@activepieces/shared'
import { triggerUtils } from '../helper/trigger-utils'
import { getServerUrl } from '../helper/public-ip-utils'
import { triggerEventService } from '../flows/trigger-events/trigger-event.service'
import { isNil } from '@activepieces/shared'
import { logger } from '../helper/logger'
import { webhookSimulationService } from './webhook-simulation/webhook-simulation-service'
import { flowInstanceService } from '../flows/flow-instance/flow-instance.service'
import { WebhookResponse } from '@activepieces/pieces-framework'
import { flowService } from '../flows/flow/flow.service'

export const webhookService = {
    async handshake({
        flow,
        payload,
    }: CallbackParams): Promise<WebhookResponse | null> {
        logger.info(`[WebhookService#handshake] flowId=${flow.id}`)

        const { projectId } = flow
        const flowInstance = await flowInstanceService.get({
            flowId: flow.id,
            projectId: flow.projectId,
        })
        if (isNil(flowInstance)) {
            logger.info(
                `[WebhookService#handshake] flowInstance not found, flowId=${flow.id}`,
            )
            saveSampleDataForWebhookTesting(flow, payload)
            return null
        }
        const flowVersion = await flowVersionService.getOneOrThrow(
            flowInstance.flowVersionId,
        )
        const response = await triggerUtils.tryHandshake({
            projectId,
            flowVersion,
            payload,
            simulate: false,
        })
        if (response !== null) {
            logger.info(`[WebhookService#handshake] condition met, handshake executed, response:
            ${JSON.stringify(response, null, 2)}`)
        }
        return response
    },
    async callback({ flow, payload }: CallbackParams): Promise<FlowRun[]> {
        logger.info(`[WebhookService#callback] flowId=${flow.id}`)

        const { projectId } = flow
        const flowInstance = await flowInstanceService.get({
            flowId: flow.id,
            projectId: flow.projectId,
        })
        if (isNil(flowInstance)) {
            logger.info(
                `[WebhookService#callback] flowInstance not found, flowId=${flow.id}`,
            )
            const flowVersion = (await flowService.getOneOrThrow({
                projectId,
                id: flow.id,
            })).version
            const payloads: unknown[] = await triggerUtils.executeTrigger({
                projectId,
                flowVersion,
                payload,
                simulate: false,
            })
            payloads.forEach((resultPayload) => {
                saveSampleDataForWebhookTesting(flow, resultPayload)
            })
            return []
        }
        if (flowInstance.status !== FlowInstanceStatus.ENABLED) {
            logger.info(
                `[WebhookService#callback] flowInstance not found or not enabled ignoring the webhook, flowId=${flow.id}`,
            )
            return []
        }
        const flowVersion = await flowVersionService.getOneOrThrow(
            flowInstance.flowVersionId,
        )
        const payloads: unknown[] = await triggerUtils.executeTrigger({
            projectId,
            flowVersion,
            payload,
            simulate: false,
        })

        payloads.forEach((payload) => {
            triggerEventService.saveEvent({
                flowId: flow.id,
                payload,
                projectId,
            })
        })

        const createFlowRuns = payloads.map((payload) =>
            flowRunService.start({
                environment: RunEnvironment.PRODUCTION,
                flowVersionId: flowVersion.id,
                payload,
                projectId,
                executionType: ExecutionType.BEGIN,
            }),
        )

        return await Promise.all(createFlowRuns)
    },

    async simulationCallback({ flow, payload }: CallbackParams): Promise<void> {
        const { projectId } = flow
        const flowVersion = await getLatestFlowVersionOrThrow(flow.id, projectId)

        const events = await triggerUtils.executeTrigger({
            projectId,
            flowVersion,
            payload,
            simulate: true,
        })

        if (events.length === 0) {
            return
        }

        logger.debug(
            events,
            `[WebhookService#simulationCallback] events, flowId=${flow.id}`,
        )

        const eventSaveJobs = events.map((event) =>
            triggerEventService.saveEvent({
                flowId: flow.id,
                projectId,
                payload: event,
            }),
        )

        await Promise.all(eventSaveJobs)

        await webhookSimulationService.delete({ flowId: flow.id, projectId })
    },

    async getWebhookPrefix(): Promise<string> {
        return `${await getServerUrl()}v1/webhooks`
    },

    async getWebhookUrl({
        flowId,
        simulate,
    }: GetWebhookUrlParams): Promise<string> {
        const suffix: WebhookUrlSuffix = simulate ? '/simulate' : ''
        const webhookPrefix = await this.getWebhookPrefix()
        return `${webhookPrefix}/${flowId}${suffix}`
    },
}

const getLatestFlowVersionOrThrow = async (
    flowId: FlowId,
    projectId: ProjectId,
): Promise<FlowVersion> => {
    const flowVersion = await flowVersionService.getFlowVersion({
        projectId,
        flowId,
        versionId: undefined,
        removeSecrets: false,
        includeArtifactAsBase64: false,
    })

    if (isNil(flowVersion)) {
        logger.error(
            `[WebhookService#getLatestFlowVersionOrThrow] error=flow_version_not_found flowId=${flowId} projectId=${projectId}`,
        )

        throw new ActivepiecesError({
            code: ErrorCode.FLOW_NOT_FOUND,
            params: {
                id: flowId,
            },
        })
    }

    return flowVersion
}

function saveSampleDataForWebhookTesting(
    flow: Flow,
    payload: unknown,
): void {
    triggerEventService.saveEvent({
        flowId: flow.id,
        payload,
        projectId: flow.projectId,
    })
}

type WebhookUrlSuffix = '' | '/simulate'

type GetWebhookUrlParams = {
    flowId: FlowId
    simulate?: boolean
}

type CallbackParams = {
    flow: Flow
    payload: EventPayload
}
