import { DefaultJobOptions, Queue } from 'bullmq'
import { ApId, ExecutionType, RunEnvironment, ScheduleOptions } from '@activepieces/shared'
import { acquireLock, createRedisClient } from '../../database/redis-connection'
import { ActivepiecesError, ErrorCode } from '@activepieces/shared'
import { DelayedJobData, OneTimeJobData, RepeatingJobData, ScheduledJobData, JobData, LATEST_JOB_DATA_SCHEMA_VERSION } from './job-data'
import { logger } from '../../helper/logger'
import { isNil } from 'lodash'

export enum JobType {
    ONE_TIME = 'ONE_TIME',
    REPEATING = 'REPEATING',
    DELAYED = 'DELAYED',
}

type BaseAddParams<JT extends JobType, JD extends JobData> = {
    id: ApId
    type: JT
    data: JD
}

type RepeatingJobAddParams = BaseAddParams<JobType.REPEATING, RepeatingJobData> & {
    scheduleOptions: ScheduleOptions
}

type DelayedJobAddParams = BaseAddParams<JobType.DELAYED, DelayedJobData> & {
    delay: number
}

type OneTimeJobAddParams = BaseAddParams<JobType.ONE_TIME, OneTimeJobData>

type ScheduledJobAddParams = RepeatingJobAddParams | DelayedJobAddParams

type AddParams = OneTimeJobAddParams | ScheduledJobAddParams

type RemoveParams = {
    id: ApId
}

export const ONE_TIME_JOB_QUEUE = 'oneTimeJobs'
export const SCHEDULED_JOB_QUEUE = 'repeatableJobs'

const EIGHT_MINUTES_IN_MILLISECONDS = 8 * 60 * 1000

const defaultJobOptions: DefaultJobOptions = {
    attempts: 5,
    backoff: {
        type: 'exponential',
        delay: EIGHT_MINUTES_IN_MILLISECONDS,
    },
    removeOnComplete: true,
}

const oneTimeJobQueue = new Queue<OneTimeJobData, unknown, ApId>(ONE_TIME_JOB_QUEUE, {
    connection: createRedisClient(),
    defaultJobOptions,
})

const scheduledJobQueue = new Queue<ScheduledJobData, unknown, ApId>(SCHEDULED_JOB_QUEUE, {
    connection: createRedisClient(),
    defaultJobOptions,
})

const repeatingJobKey = (id: ApId): string => `activepieces:repeatJobKey:${id}`

export const flowQueue = {
    async add(params: AddParams): Promise<void> {
        logger.debug(params, '[flowQueue#add] params')

        if (params.type === JobType.REPEATING) {
            const { id, data, scheduleOptions } = params
            const job = await scheduledJobQueue.add(id, data, {
                jobId: id,
                repeat: {
                    pattern: scheduleOptions.cronExpression,
                    tz: scheduleOptions.timezone,
                },
            })

            if (isNil(job.repeatJobKey)) {
                return
            }

            logger.debug(`[flowQueue#add] repeatJobKey=${job.repeatJobKey}`)

            const client = await scheduledJobQueue.client
            await client.set(repeatingJobKey(id), job.repeatJobKey)
        }
        else if (params.type === JobType.DELAYED) {
            logger.info(`[FlowQueue#add] flowRunId=${params.id} delay=${params.delay}`)

            const { id, data, delay } = params

            await scheduledJobQueue.add(id, data, {
                jobId: id,
                delay,
            })
        }
        else {
            const { id, data } = params

            await oneTimeJobQueue.add(id, data, {
                jobId: id,
            })
        }
    },

    async removeRepeatingJob({ id }: RemoveParams): Promise<void> {
        const client = await scheduledJobQueue.client
        const jobKey = await client.get(repeatingJobKey(id))

        if (jobKey === null) {
            /*
                If the trigger activation failed, don't let the function fail, just ignore the action, and log an error
                message indicating that the job with key "${jobKey}" couldn't be found, even though it should exist, and
                proceed to skip the deletion.
            */
            logger.error(`Couldn't find job ${jobKey}, even though It should exists, skipping delete`)
        }
        else {
            const result = await scheduledJobQueue.removeRepeatableByKey(jobKey)
            await client.del(repeatingJobKey(id))

            if (!result) {
                throw new ActivepiecesError({
                    code: ErrorCode.JOB_REMOVAL_FAILURE,
                    params: {
                        jobId: id,
                    },
                })
            }
        }
    },
}

export const migrateScheduledJobs = async (): Promise<void> => {
    const migrationLock = await acquireLock({
        key: 'jobs_lock',
        timeout: 30000,
    })
    try {
        logger.info('[migrateScheduledJobs] Starting migration')
        let migratedJobs = 0
        const scheduledJobs = await scheduledJobQueue.getJobs()
        const jobsToMigrate = scheduledJobs.filter((job) => job.data.schemaVersion !== LATEST_JOB_DATA_SCHEMA_VERSION)
        for (const job of jobsToMigrate) {
            // Cast as we are not sure about the schema
            const { data } = JSON.parse(JSON.stringify(job))
            if (data.schemaVersion === undefined || data.schemaVersion === 1) {
                const { flowVersion, projectId, triggerType } = data
                const newJobData = {
                    schemaVersion: 2,
                    flowVersionId: flowVersion.id,
                    flowId: flowVersion.flowId,
                    projectId,
                    environment: RunEnvironment.PRODUCTION,
                    executionType: ExecutionType.BEGIN,
                    triggerType,
                }
                migratedJobs++
                await job.update(newJobData)
            }
            else {
                throw new Error(`[migrate] Unknown schema version ${data.schemaVersion}`)
            }
        }
        logger.info(`[migrateScheduledJobs] Migrated ${migratedJobs} jobs`)
    }
    finally {
        await migrationLock.release()
    }
}