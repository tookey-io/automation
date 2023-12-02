import { ApEdition } from '@activepieces/shared'
import { FlowRunHooks } from '../../flows/flow-run/flow-run-hooks'
import { getEdition } from '../../helper/secret-helper'
import { tasksLimit } from '../billing/limits/tasks-limit'
import { projectUsageService } from '../billing/project-usage/project-usage-service'

export const cloudRunHooks: FlowRunHooks = {
    async onPreStart({ projectId }: { projectId: string }): Promise<void> {
        await tasksLimit.limit({
            projectId,
        })
    },
    async onFinish({ projectId, tasks }: { projectId: string, tasks: number }): Promise<void> {
        const edition = getEdition()
        if (edition === ApEdition.CLOUD) {
            await projectUsageService.addTasksConsumed({
                projectId,
                tasks,
            })
        }
    },
}