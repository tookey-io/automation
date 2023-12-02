import { apId, ExternalUserRequest, SignUpRequest, User, UserId, UserMeta, UserStatus, isNil } from '@activepieces/shared'
import { passwordHasher } from '../authentication/lib/password-hasher'
import { databaseConnection } from '../database/database-connection'
import { UserEntity } from './user-entity'
import { PlatformId } from '@activepieces/ee-shared'
import { IsNull } from 'typeorm'
import dayjs from 'dayjs'

const userRepo = databaseConnection.getRepository(UserEntity)

export const userService = {
    // TODO: Move to authentication service
    // async inject(request: ExternalUserRequest): Promise<User> {
    //     const hashedPassword = await passwordHasher.hash(apId())
    //     const user = {
    //         id: apId(),
    //         email: request.id,
    //         password: hashedPassword,
    //         firstName: request.firstName,
    //         lastName: request.lastName,
    //         trackEvents: request.trackEvents,
    //         newsLetter: request.newsLetter,
    //         status: UserStatus.VERIFIED,
    //     }
    //     return await userRepo.save(user)
    // },

    async create(params: CreateParams): Promise<User> {
        const hashedPassword = await passwordHasher.hash(params.password)

        const user: NewUser = {
            id: apId(),
            ...params,
            password: hashedPassword,
        }

        await continueSignUpIfInvited(user)
        return userRepo.save(user)
    },

    async verify({ id }: IdParams): Promise<User> {
        const user = await userRepo.findOneByOrFail({ id })

        return userRepo.save({
            ...user,
            status: UserStatus.VERIFIED,
        })
    },

    async get({ id }: IdParams): Promise<User | null> {
        return userRepo.findOneBy({ id })
    },

    async getMetaInfo({ id }: IdParams): Promise<UserMeta | null> {
        const user = await this.get({ id })

        if (isNil(user)) {
            return null
        }

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            title: user.title,
        }
    },

    // TODO REMOVE after firebase migration
    async getbyEmail({ email }: { email: string }): Promise<User | null> {

        return userRepo.createQueryBuilder()
            .andWhere('LOWER(email) = LOWER(:email)', { email })
            .getOne()
    },

    async getByPlatformAndEmail({ platformId, email }: GetByPlatformAndEmailParams): Promise<User | null> {
        const platformWhereQuery = platformId ? { platformId } : { platformId: IsNull() }

        return userRepo.createQueryBuilder()
            .where(platformWhereQuery)
            .andWhere('LOWER(email) = LOWER(:email)', { email })
            .getOne()
    },

    async getByPlatformAndExternalId({ platformId, externalId }: GetByPlatformAndExternalIdParams): Promise<User | null> {
        return userRepo.findOneBy({
            platformId,
            externalId,
        })
    },

    async updatePassword({ id, newPassword }: UpdatePasswordParams): Promise<void> {
        const hashedPassword = await passwordHasher.hash(newPassword)

        await userRepo.update(id, {
            updated: dayjs().toISOString(),
            password: hashedPassword,
        })
    },
}

const continueSignUpIfInvited = async (newUser: NewUser): Promise<void> => {
    const existingUser = await userService.getByPlatformAndEmail({
        platformId: newUser.platformId,
        email: newUser.email,
    })

    if (existingUser && existingUser.status === UserStatus.INVITED) {
        newUser.id = existingUser.id
        newUser.platformId = existingUser.platformId
    }
}

type CreateParams = SignUpRequest & {
    status: UserStatus
    platformId: PlatformId | null
    externalId?: string
}

type NewUser = Omit<User, 'created' | 'updated'>

type GetByPlatformAndEmailParams = {
    platformId: PlatformId | null
    email: string
}

type GetByPlatformAndExternalIdParams = {
    platformId: PlatformId
    externalId: string
}

type IdParams = {
    id: UserId
}

type UpdatePasswordParams = {
    id: UserId
    newPassword: string
}
