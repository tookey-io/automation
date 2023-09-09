import {
    ActivepiecesError,
    ErrorCode,
    ExecutionType,
    FlowInstanceStatus,
    RunEnvironment,
    TriggerType,
} from '@activepieces/shared'
import { flowRunService } from '../../flows/flow-run/flow-run-service'
import { triggerUtils } from '../../helper/trigger-utils'
import { flowQueue } from './flow-queue'
import { flowWorker } from './flow-worker'
import {
    DelayedJobData,
    OneTimeJobData,
    RepeatingJobData,
    ScheduledJobData,
} from './job-data'
import { captureException, logger } from '../../helper/logger'
import { flowVersionService } from '../../flows/flow-version/flow-version.service'
import { flowInstanceService } from '../../flows/flow-instance/flow-instance.service'
import { isNil } from '@activepieces/shared'
import { consumeJobsInMemory } from './queues/memory/memory-consumer'
import { inMemoryQueueManager } from './queues/memory/memory-queue'
import { redisConsumer } from './queues/redis/redis-consumer'
import { redisQueueManager } from './queues/redis/redis-queue'
import { QueueMode, system } from '../../helper/system/system'
import { SystemProp } from '../../helper/system/system-prop'

const queueMode = system.get(SystemProp.QUEUE_MODE)!

const initFlowQueueConsumer = async (): Promise<void> => {
    switch (queueMode) {
        case QueueMode.MEMORY: {
            await inMemoryQueueManager.init()
            consumeJobsInMemory()
            break
        }
        case QueueMode.REDIS: {
            await redisQueueManager.init()
            await redisConsumer.init()
            break
        }
    }
}

const close = async (): Promise<void> => {
    logger.info('[FlowQueueConsumer#close] closing all consumers')
    switch (queueMode) {
        case QueueMode.MEMORY: {
            break
        }
        case QueueMode.REDIS: {
            await redisConsumer.close()
            break
        }
    }
}

async function consumeOnetimeJob(data: OneTimeJobData) {
    return await flowWorker.executeFlow(data)
}

async function consumeScheduledJobs(data: ScheduledJobData) {
    try {
        switch (data.executionType) {
            case ExecutionType.BEGIN:
                await consumeRepeatingJob(data)
                break
            case ExecutionType.RESUME:
                await consumeDelayedJob(data)
                break
        }
    }
    catch (e) {
        captureException(e)
    }
}

const consumeDelayedJob = async (data: DelayedJobData): Promise<void> => {
    logger.info(`[FlowQueueConsumer#consumeDelayedJob] flowRunId=${data.runId}`)

    await flowRunService.start({
        payload: null,
        flowRunId: data.runId,
        projectId: data.projectId,
        flowVersionId: data.flowVersionId,
        executionType: ExecutionType.RESUME,
        environment: RunEnvironment.PRODUCTION,
    })
}

const consumeRepeatingJob = async (data: RepeatingJobData): Promise<void> => {
    try {
    // TODO REMOVE AND FIND PERMANENT SOLUTION
        const instance = await flowInstanceService.get({
            projectId: data.projectId,
            flowId: data.flowId,
        })

        if (
            isNil(instance) ||
      instance.status !== FlowInstanceStatus.ENABLED ||
      instance.flowVersionId !== data.flowVersionId
        ) {
            captureException(
                new Error(
                    `[repeatableJobConsumer] removing project.id=${data.projectId} instance.flowVersionId=${instance?.flowVersionId} data.flowVersion.id=${data.flowVersionId}`,
                ),
            )

            const flowVersion = await flowVersionService.getOne(data.flowVersionId)
            if (isNil(flowVersion)) {
                await flowQueue.removeRepeatingJob({
                    id: data.flowVersionId,
                })
            }
            else {
                await triggerUtils.disable({
                    projectId: data.projectId,
                    flowVersion,
                    simulate: false,
                })
            }

            return
        }

        if (data.triggerType === TriggerType.PIECE) {
            await consumePieceTrigger(data)
        }
    }
    catch (e) {
        if (
            e instanceof ActivepiecesError &&
      e.error.code === ErrorCode.TASK_QUOTA_EXCEEDED
        ) {
            logger.info(
                `[repeatableJobConsumer] removing project.id=${data.projectId} run out of flow quota`,
            )
            await flowInstanceService.update({
                projectId: data.projectId,
                flowId: data.flowId,
                status: FlowInstanceStatus.DISABLED,
            })
        }
        else {
            captureException(e)
        }
    }
}

const consumePieceTrigger = async (data: RepeatingJobData): Promise<void> => {
    const flowVersion = await flowVersionService.getOneOrThrow(
        data.flowVersionId,
    )

    const payloads: unknown[] = await triggerUtils.executeTrigger({
        projectId: data.projectId,
        flowVersion,
        payload: {},
        simulate: false,
    })

    logger.info(
        `[flowQueueConsumer#consumePieceTrigger] payloads.length=${payloads.length}`,
    )

    const createFlowRuns = payloads.map((payload) =>
        flowRunService.start({
            environment: RunEnvironment.PRODUCTION,
            flowVersionId: data.flowVersionId,
            payload,
            projectId: data.projectId,
            executionType: ExecutionType.BEGIN,
        }),
    )

    await Promise.all(createFlowRuns)
}


export const flowQueueConsumer = {
    consumeOnetimeJob,
    consumeScheduledJobs,
    init: initFlowQueueConsumer,
    close,
}
