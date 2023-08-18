import { EntitySchema } from 'typeorm'
import { ARRAY_COLUMN_TYPE, ApIdSchema, BaseColumnSchemaPart, JSONB_COLUMN_TYPE, TIMESTAMP_COLUMN_TYPE, isPostgres } from '../../database/database-common'
import { Flow, FlowRun, Project } from '@activepieces/shared'

type FlowRunSchema = FlowRun & {
    project: Project
    flow: Flow
}

export const FlowRunEntity = new EntitySchema<FlowRunSchema>({
    name: 'flow_run',
    columns: {
        ...BaseColumnSchemaPart,
        projectId: ApIdSchema,
        flowId: ApIdSchema,
        flowVersionId: ApIdSchema,
        environment: {
            type: String,
            nullable: true,
        },
        flowDisplayName: {
            type: String,
        },
        logsFileId: { ...ApIdSchema, nullable: true },
        status: {
            type: String,
        },
        tags: {
            type: ARRAY_COLUMN_TYPE,
            array: isPostgres(),
            nullable: true,
        },
        tasks: {
            nullable: true,
            type: Number,
        },
        startTime: {
            type: TIMESTAMP_COLUMN_TYPE,
        },
        finishTime: {
            nullable: true,
            type: TIMESTAMP_COLUMN_TYPE,
        },
        pauseMetadata: {
            type: JSONB_COLUMN_TYPE,
            nullable: true,
        },
    },
    indices: [
        {
            name: 'idx_run_project_id_environment_created_desc',
            columns: ['projectId', 'environment', 'created'],
        },
        {
            name: 'idx_run_project_id_environment_status_created_desc',
            columns: ['projectId', 'environment', 'status', 'created'],
        },
        {
            name: 'idx_run_project_id_flow_id_environment_created_desc',
            columns: ['projectId', 'flowId', 'environment', 'created'],
        },
        {
            name: 'idx_run_project_id_flow_id_environment_status_created_desc',
            columns: ['projectId', 'flowId', 'environment', 'status', 'created'],
        },
    ],
    relations: {
        project: {
            type: 'many-to-one',
            target: 'project',
            cascade: true,
            onDelete: 'CASCADE',
            joinColumn: {
                name: 'projectId',
                foreignKeyConstraintName: 'fk_flow_run_project_id',
            },
        },
        flow: {
            type: 'many-to-one',
            target: 'flow',
            cascade: true,
            onDelete: 'CASCADE',
            joinColumn: {
                name: 'flowId',
                foreignKeyConstraintName: 'fk_flow_run_flow_id',
            },
        },
    },
})
