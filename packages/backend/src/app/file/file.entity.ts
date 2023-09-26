import { EntitySchema } from 'typeorm'
import { ApIdSchema, BLOB_COLUMN_TYPE, BaseColumnSchemaPart } from '../database/database-common'
import { File, FileCompression, FileType, Project } from '@activepieces/shared'

type FileSchema = File & {
    project: Project
}

export const FileEntity = new EntitySchema<FileSchema>({
    name: 'file',
    columns: {
        ...BaseColumnSchemaPart,
        projectId: { ...ApIdSchema, nullable: true },
        data: {
            type: BLOB_COLUMN_TYPE,
            nullable: false,
        },
        type: {
            type: String,
            default: FileType.UNKNOWN,
            nullable: false,
        },
        compression: {
            type: String,
            default: FileCompression.NONE,
            nullable: false,
        },
    },
    relations: {
        project: {
            type: 'many-to-one',
            target: 'project',
            cascade: true,
            onDelete: 'CASCADE',
            joinColumn: {
                name: 'projectId',
                foreignKeyConstraintName: 'fk_file_project_id',
            },
        },
    },
})
