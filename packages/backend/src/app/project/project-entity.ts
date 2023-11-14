import { EntitySchema } from 'typeorm'
import { AppConnection, Flow, Folder, Project, ProjectType, TriggerEvent, User } from '@activepieces/shared'
import { ApIdSchema, BaseColumnSchemaPart } from '../database/database-common'
import { Platform } from '@activepieces/ee-shared'

type ProjectSchema = Project & {
    owner: User
    flows: Flow[]
    files: File[]
    folders: Folder[]
    events: TriggerEvent[]
    appConnections: AppConnection[]
    platform: Platform
}

export const ProjectEntity = new EntitySchema<ProjectSchema>({
    name: 'project',
    columns: {
        ...BaseColumnSchemaPart,
        ownerId: ApIdSchema,
        displayName: {
            type: String,
        },
        notifyStatus: {
            type: String,
        },
        type: {
            type: String,
            nullable: false,
            default: ProjectType.STANDALONE,
        },
        platformId: {
            ...ApIdSchema,
            nullable: true,
        },
        externalId: {
            type: String,
            nullable: true,
        },
    },
    indices: [
        {
            name: 'idx_project_owner_id',
            columns: ['ownerId'],
            unique: false,
        },
        {
            name: 'idx_project_platform_id_external_id',
            columns: ['platformId', 'externalId'],
            unique: true,
        },
    ],
    relations: {
        folders: {
            type: 'one-to-many',
            target: 'folder',
            inverseSide: 'project',
        },
        appConnections: {
            type: 'one-to-many',
            target: 'app_connection',
            inverseSide: 'project',
        },
        owner: {
            type: 'many-to-one',
            target: 'user',
            joinColumn: {
                name: 'ownerId',
                foreignKeyConstraintName: 'fk_project_owner_id',
            },
        },
        events: {
            type: 'one-to-many',
            target: 'trigger_event',
            inverseSide: 'project',
        },
        files: {
            type: 'one-to-many',
            target: 'file',
            inverseSide: 'project',
        },
        flows: {
            type: 'one-to-many',
            target: 'flow',
            inverseSide: 'project',
        },
    },
})
