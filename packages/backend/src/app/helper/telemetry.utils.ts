import { PostHog } from 'posthog-node'
import { SystemProp } from './system/system-prop'
import { system } from './system/system'
import { ProjectId, TelemetryEvent, User, UserId } from '@activepieces/shared'
import { projectService } from '../project/project-service'
import { getEdition } from './secret-helper'
import { logger } from './logger'


const telemetryEnabled = system.getBoolean(SystemProp.TELEMETRY_ENABLED)
const telemetryId = system.getOrThrow<string>(SystemProp.TELEMETRY_ID)

console.log({
    telemetryEnabled,
    telemetryId,
})

const client = new PostHog(
    telemetryId,
    { host: 'https://eu.posthog.com' }
)

export const telemetry = {
    async identify(user: User, projectId: ProjectId): Promise<void> {
        if (!telemetryEnabled) {
            return
        }
        client.identify({
            distinctId: user.id,
            properties: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                projectId,
                ...(await getMetadata()),
            },
        })
    },
    async trackProject(projectId: ProjectId, event: TelemetryEvent): Promise<void> {
        if (!telemetryEnabled) {
            return
        }
        const project = await projectService.getOne(projectId)
        this.trackUser(project!.ownerId, event)
            .catch((e) => logger.error(e, '[Telemetry#trackProject] this.trackUser'))
    },
    async trackUser(userId: UserId, event: TelemetryEvent): Promise<void> {
        if (!telemetryEnabled) {
            return
        }
        console.log({
            where: '--------- telemetry.trackUser ----------',
            userId,
            event,
        })
        client.capture({
            distinctId: userId,
            event: event.name,
            properties: {
                ...event.payload,
                ...(await getMetadata()),
                datetime: new Date().toISOString(),
            },
        })
        client.flush()
    },
}

async function getMetadata() {
    const currentVersion = (await import('package.json')).version
    const edition = getEdition()
    return {
        activepiecesVersion: currentVersion,
        activepiecesEnvironment: system.get(SystemProp.ENVIRONMENT),
        activepiecesEdition: edition,
    }
}
