import {
    apId,
    Cursor,
    ExecutionOutputStatus,
    FileId,
    FlowRun,
    FlowRunId,
    FlowVersionId,
    ProjectId,
    SeekPage,
    RunEnvironment,
    TelemetryEventName,
    FlowId,
    spreadIfDefined,
    PauseMetadata,
    ActivepiecesError,
    ErrorCode,
    ExecutionType,
    isNil,
    RunTerminationReason,
    FlowRetryStrategy,
} from '@activepieces/shared'
import { APArrayContains, databaseConnection } from '../../database/database-connection'
import { flowVersionService } from '../../flows/flow-version/flow-version.service'
import { buildPaginator } from '../../helper/pagination/build-paginator'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import { Order } from '../../helper/pagination/paginator'
import { telemetry } from '../../helper/telemetry.utils'
import { FlowRunEntity } from './flow-run-entity'
import { flowRunSideEffects } from './flow-run-side-effects'
import { logger } from '../../helper/logger'
import { flowService } from '../flow/flow.service'
import { MoreThanOrEqual } from 'typeorm'
import { flowRunHooks } from './flow-run-hooks'

export const flowRunRepo = databaseConnection.getRepository(FlowRunEntity)

const getFlowRunOrCreate = async (params: GetOrCreateParams): Promise<Partial<FlowRun>> => {
    const { id, projectId, flowId, flowVersionId, flowDisplayName, environment } = params

    if (id) {
        return flowRunService.getOneOrThrow({
            id,
            projectId,
        })
    }

    return {
        id: apId(),
        projectId,
        flowId,
        flowVersionId,
        environment,
        flowDisplayName,
        startTime: new Date().toISOString(),
    }
}

async function updateFlowRunToLatestFlowVersionId(flowRunId: FlowRunId): Promise<void> {
    const flowRun = await flowRunRepo.findOneByOrFail({ id: flowRunId })
    const flowVersion = await flowVersionService.getLatestLockedVersionOrThrow(flowRun.flowId)
    await flowRunRepo.update(flowRunId, {
        flowVersionId: flowVersion.id,
    })
}

export const flowRunService = {
    async list({ projectId, flowId, status, cursor, limit, tags }: ListParams): Promise<SeekPage<FlowRun>> {
        const decodedCursor = paginationHelper.decodeCursor(cursor)
        const paginator = buildPaginator({
            entity: FlowRunEntity,
            query: {
                limit,
                order: Order.DESC,
                afterCursor: decodedCursor.nextCursor,
                beforeCursor: decodedCursor.previousCursor,
            },
        })

        let query = flowRunRepo.createQueryBuilder('flow_run').where({
            projectId,
            ...spreadIfDefined('flowId', flowId),
            ...spreadIfDefined('status', status),
            environment: RunEnvironment.PRODUCTION,
        })
        if (tags) {
            query = APArrayContains('tags', tags, query)
        }
        const { data, cursor: newCursor } = await paginator.paginate(query)
        return paginationHelper.createPage<FlowRun>(data, newCursor)
    },
    async retry({ flowRunId, strategy }: RetryParams): Promise<void> {
        switch (strategy) {
            case FlowRetryStrategy.FROM_FAILED_STEP:
                await flowRunService.addToQueue({
                    flowRunId,
                    payload: {},
                    executionType: ExecutionType.RESUME,
                })
                break
            case FlowRetryStrategy.ON_LATEST_VERSION: {
                await updateFlowRunToLatestFlowVersionId(flowRunId)
                await flowRunService.addToQueue({
                    flowRunId,
                    payload: {},
                    executionType: ExecutionType.BEGIN,

                })
                break
            }
        }
    },
    async addToQueue({ flowRunId, payload, executionType, synchronousHandlerId }: {
        flowRunId: FlowRunId
        payload: Record<string, unknown>
        executionType: ExecutionType,
        synchronousHandlerId?: string
    }): Promise<FlowRun> {
        logger.info(`[FlowRunService#resume] flowRunId=${flowRunId}`)

        const flowRunToResume = await flowRunRepo.findOneBy({
            id: flowRunId,
        })

        if (isNil(flowRunToResume)) {
            throw new ActivepiecesError({
                code: ErrorCode.FLOW_RUN_NOT_FOUND,
                params: {
                    id: flowRunId,
                },
            })
        }

        return await flowRunService.start({
            payload,
            flowRunId: flowRunToResume.id,
            projectId: flowRunToResume.projectId,
            flowVersionId: flowRunToResume.flowVersionId,
            executionType,
            environment: RunEnvironment.PRODUCTION,
            synchronousHandlerId
        })
    },
    async finish(
        { flowRunId, status, tasks, logsFileId, tags, terminationReason }: {
            flowRunId: FlowRunId
            status: ExecutionOutputStatus
            tasks: number
            terminationReason?: RunTerminationReason
            tags: string[]
            logsFileId: FileId | null
        },
    ): Promise<FlowRun> {
        await flowRunRepo.update(flowRunId, {
            ...spreadIfDefined('logsFileId', logsFileId),
            status,
            tasks,
            terminationReason,
            tags,
            finishTime: new Date().toISOString(),
        })
        const flowRun = await this.getOneOrThrow({ id: flowRunId, projectId: undefined })
        await flowRunSideEffects.finish({ flowRun })
        return flowRun
    },

    async start({ projectId, flowVersionId, flowRunId, payload, environment, executionType, synchronousHandlerId }: StartParams): Promise<FlowRun> {
        logger.info(`[flowRunService#start] flowRunId=${flowRunId} executionType=${executionType}`)

        const flowVersion = await flowVersionService.getOneOrThrow(flowVersionId)

        const flow = await flowService.getOneOrThrow({
            id: flowVersion.flowId,
            projectId,
        })

        await flowRunHooks.getHooks().onPreStart({ projectId })

        const flowRun = await getFlowRunOrCreate({
            id: flowRunId,
            projectId: flow.projectId,
            flowId: flowVersion.flowId,
            flowVersionId: flowVersion.id,
            environment,
            flowDisplayName: flowVersion.displayName,
        })

        flowRun.status = ExecutionOutputStatus.RUNNING

        const savedFlowRun = await flowRunRepo.save(flowRun)

        telemetry.trackProject(flow.projectId, {
            name: TelemetryEventName.FLOW_RUN_CREATED,
            payload: {
                projectId: savedFlowRun.projectId,
                flowId: savedFlowRun.flowId,
                environment: savedFlowRun.environment,
            },
        }).catch((e) => logger.error(e, '[FlowRunService#Start] telemetry.trackProject'))

        await flowRunSideEffects.start({
            flowRun: savedFlowRun,
            payload,
            synchronousHandlerId,
            executionType,
        })

        return savedFlowRun
    },

    async test({ projectId, flowVersionId }: TestParams): Promise<FlowRun> {
        const flowVersion = await flowVersionService.getOneOrThrow(flowVersionId)

        const payload = flowVersion.trigger.settings.inputUiInfo.currentSelectedData

        return this.start({
            projectId,
            flowVersionId,
            payload,
            environment: RunEnvironment.TESTING,
            executionType: ExecutionType.BEGIN,
        })
    },

    async pause(params: PauseParams): Promise<void> {
        logger.info(`[FlowRunService#pause] flowRunId=${params.flowRunId} pauseType=${params.pauseMetadata.type}`)

        const { flowRunId, logFileId, pauseMetadata } = params

        await flowRunRepo.update(flowRunId, {
            status: ExecutionOutputStatus.PAUSED,
            logsFileId: logFileId,
            pauseMetadata,
        })

        const flowRun = await flowRunRepo.findOneByOrFail({ id: flowRunId })

        await flowRunSideEffects.pause({ flowRun })
    },

    async getOne({ projectId, id }: GetOneParams): Promise<FlowRun | null> {
        return flowRunRepo.findOneBy({
            projectId,
            id,
        })
    },

    async getOneOrThrow(params: GetOneParams): Promise<FlowRun> {
        const flowRun = await this.getOne(params)

        if (isNil(flowRun)) {
            throw new ActivepiecesError({
                code: ErrorCode.FLOW_RUN_NOT_FOUND,
                params: {
                    id: params.id,
                },
            })
        }

        return flowRun
    },

    async getAllProdRuns(params: GetAllProdRuns): Promise<number> {
        const { projectId, created } = params

        const sumOfTasks = await flowRunRepo.createQueryBuilder('flow_run')
            .select('COALESCE(SUM(flow_run.tasks), 0)', 'tasks')
            .where({
                projectId,
                environment: RunEnvironment.PRODUCTION,
                created: MoreThanOrEqual(created),
            })
            .getRawOne()

        return Number(sumOfTasks.tasks)
    },
}

type GetOrCreateParams = {
    id?: FlowRunId
    projectId: ProjectId
    flowId: FlowId
    flowVersionId: FlowVersionId
    flowDisplayName: string
    environment: RunEnvironment
}

type ListParams = {
    projectId: ProjectId
    flowId: FlowId | undefined
    status: ExecutionOutputStatus | undefined
    cursor: Cursor | null
    tags?: string[]
    limit: number
}

type GetOneParams = {
    id: FlowRunId
    projectId: ProjectId | undefined
}

type StartParams = {
    projectId: ProjectId
    flowVersionId: FlowVersionId
    flowRunId?: FlowRunId
    environment: RunEnvironment
    payload: unknown
    synchronousHandlerId?: string
    executionType: ExecutionType
}

type TestParams = {
    projectId: ProjectId
    flowVersionId: FlowVersionId
}

type PauseParams = {
    flowRunId: FlowRunId
    logFileId: FileId
    pauseMetadata: PauseMetadata
}

type RetryParams = {
    flowRunId: FlowRunId
    strategy: FlowRetryStrategy
}

type GetAllProdRuns = {
    projectId: ProjectId
    created: string
}
