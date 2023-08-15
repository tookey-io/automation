import { Worker } from 'bullmq'

import { ONE_TIME_JOB_QUEUE, SCHEDULED_JOB_QUEUE } from './redis-queue'
import { OneTimeJobData, ScheduledJobData } from '../../job-data'
import { flowQueueConsumer } from '../../flow-queue-consumer'
import { createRedisClient } from '../../../../database/redis-connection'
import { system } from '../../../../helper/system/system'
import { SystemProp } from '../../../../helper/system/system-prop'
import { ApId } from '@activepieces/shared'


let redisScheduledJobConsumer: Worker<ScheduledJobData, unknown>
let redisOneTimeJobConsumer: Worker<OneTimeJobData, unknown>

export const redisConsumer = {
    async init(): Promise<void> {
        redisScheduledJobConsumer = new Worker<ScheduledJobData, unknown, ApId>(
            SCHEDULED_JOB_QUEUE,
            async (job) => {
                await flowQueueConsumer.consumeScheduledJobs(job.data)
            },
            {
                connection: createRedisClient(),
                concurrency: system.getNumber(SystemProp.FLOW_WORKER_CONCURRENCY) ?? 10,
            },
        )
        redisOneTimeJobConsumer = new Worker<OneTimeJobData, unknown, ApId>(
            ONE_TIME_JOB_QUEUE,
            async (job) => {
                await flowQueueConsumer.consumeOnetimeJob(job.data)
            },
            {
                connection: createRedisClient(),
                concurrency: system.getNumber(SystemProp.FLOW_WORKER_CONCURRENCY) ?? 10,
            },
        )
        const startWorkers = [
            redisOneTimeJobConsumer.waitUntilReady(),
            redisScheduledJobConsumer.waitUntilReady(),
        ]
        await Promise.all(startWorkers)
    },
    async close(): Promise<void> {
        const startWorkers = [
            redisOneTimeJobConsumer.close(),
            redisScheduledJobConsumer.close(),
        ]
        await Promise.all(startWorkers)
    },
}
