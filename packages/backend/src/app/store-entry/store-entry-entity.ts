import { EntitySchema } from 'typeorm'
import { ApIdSchema, BaseColumnSchemaPart, JSONB_COLUMN_TYPE } from '../database/database-common'
import { StoreEntry } from '@activepieces/shared'

type StoreEntrySchema = StoreEntry

export const StoreEntryEntity = new EntitySchema<StoreEntrySchema>({
    name: 'store-entry',
    columns: {
        ...BaseColumnSchemaPart,
        key: {
            type: String,
        },
        projectId: ApIdSchema,
        value: {
            type: JSONB_COLUMN_TYPE,
            nullable: true,
        },
    },
})
