import { EntitySchema } from 'typeorm'
import { OtpModel, OtpType } from '@activepieces/ee-shared'
import { ApIdSchema, BaseColumnSchemaPart } from '../../database/database-common'
import { User } from '@activepieces/shared'

export type OtpSchema = OtpModel & {
    user: User
}

export const OtpEntity = new EntitySchema<OtpSchema>({
    name: 'otp',
    columns: {
        ...BaseColumnSchemaPart,
        type: {
            type: String,
            enum: OtpType,
            nullable: false,
        },
        userId: {
            ...ApIdSchema,
            nullable: false,
        },
        value: {
            type: String,
            nullable: false,
        },
    },
    indices: [
        {
            name: 'idx_otp_user_id_type',
            columns: ['userId', 'type'],
            unique: true,
        },
    ],
    relations: {
        user: {
            type: 'many-to-one',
            target: 'user',
            cascade: true,
            onDelete: 'CASCADE',
            joinColumn: {
                name: 'userId',
                foreignKeyConstraintName: 'fk_otp_user_id',
            },
        },
    },
})
