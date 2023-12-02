import { EntitySchema } from 'typeorm'
import { FilteredPieceBehavior, LocalesEnum, Platform } from '@activepieces/ee-shared'
import { ARRAY_COLUMN_TYPE, ApIdSchema, BaseColumnSchemaPart, isPostgres } from '../../database/database-common'
import { User } from '@activepieces/shared'

type PlatformSchema = Platform & {
    owner: User
}

export const PlatformEntity = new EntitySchema<PlatformSchema>({
    name: 'platform',
    columns: {
        ...BaseColumnSchemaPart,
        ownerId: {
            ...ApIdSchema,
            nullable: false,
        },
        name: {
            type: String,
            nullable: false,
        },
        primaryColor: {
            type: String,
            nullable: false,
        },
        logoIconUrl: {
            type: String,
            nullable: false,
        },
        fullLogoUrl: {
            type: String,
            nullable: false,
        },
        favIconUrl: {
            type: String,
            nullable: false,
        },
        smtpHost: {
            type: String,
            nullable: true,
        },
        smtpPort: {
            type: Number,
            nullable: true,
        },
        smtpUser: {
            type: String,
            nullable: true,
        },
        smtpPassword: {
            type: String,
            nullable: true,
        },
        smtpSenderEmail: {
            type: String,
            nullable: true,
        },
        smtpUseSSL: {
            type: Boolean,
            nullable: true,
        },
        privacyPolicyUrl: {
            type: String,
            nullable: true,
        },
        termsOfServiceUrl: {
            type: String,
            nullable: true,
        },
        showPoweredBy: {
            type: Boolean,
            nullable: false,
        },
        cloudAuthEnabled: {
            type: Boolean,
            nullable: false,
            default: true,
        },
        filteredPieceNames: {
            type: ARRAY_COLUMN_TYPE,
            array: isPostgres(),
            nullable: false,
        },
        filteredPieceBehavior: {
            type: String,
            enum: FilteredPieceBehavior,
            nullable: false,
        },
        defaultLocale: {
            type: String,
            enum: LocalesEnum,
            nullable: true,
        },
    },
    indices: [
    ],
    relations: {
        owner: {
            type: 'one-to-one',
            target: 'user',
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            joinColumn: {
                name: 'ownerId',
                referencedColumnName: 'id',
                foreignKeyConstraintName: 'fk_platform_user',
            },
        },
    },
})
