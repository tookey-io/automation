import { EntitySchema } from 'typeorm'
import { Project, User } from '@activepieces/shared'
import { BaseColumnSchemaPart } from '../database/database-common'

export type UserSchema = User & {
    projects: Project[]
}

export const UserEntity = new EntitySchema<UserSchema>({
    name: 'user',
    columns: {
        ...BaseColumnSchemaPart,
        email: {
            type: String,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        password: {
            type: String,
        },
        verified: {
            type: Boolean,
        },
        status: {
            type: String,
        },
        trackEvents: {
            type: Boolean,
            nullable: true,
        },
        newsLetter: {
            type: Boolean,
            nullable: true,
        },
        imageUrl: {
            type: String,
            nullable: true,
        },
        title: {
            type: String,
            nullable: true,
        },
        externalId: {
            type: String,
            nullable: true,
        },
        platformId: {
            type: String,
            nullable: true,
        },
    },
    indices: [
        {
            name: 'idx_user_platform_id_email',
            columns: ['platformId', 'email'],
            unique: true,
        },
        {
            name: 'idx_user_platform_id_external_id',
            columns: ['platformId', 'externalId'],
            unique: true,
        },
        {
            name: 'idx_user_partial_unique_email_platform_id_is_null',
            synchronize: false,
        },
    ],
    relations: {
        projects: {
            type: 'one-to-many',
            target: 'user',
            inverseSide: 'owner',
        },
    },
})
