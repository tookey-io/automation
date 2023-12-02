import { SigningKey, SigningKeyId, PlatformId, AddSigningKeyResponse } from '@activepieces/ee-shared'
import { SeekPage, UserId, apId, spreadIfDefined } from '@activepieces/shared'
import { signingKeyGenerator } from './signing-key-generator'
import { databaseConnection } from '../../database/database-connection'
import { SigningKeyEntity } from './signing-key-entity'

const repo = databaseConnection.getRepository<SigningKey>(SigningKeyEntity)

export const signingKeyService = {
    async add({ userId, platformId, displayName }: AddParams): Promise<AddSigningKeyResponse> {

        const generatedSigningKey = await signingKeyGenerator.generate()

        const newSigningKey: NewSigningKey = {
            id: apId(),
            platformId,
            generatedBy: userId,
            publicKey: generatedSigningKey.publicKey,
            algorithm: generatedSigningKey.algorithm,
            displayName,
        }

        const savedKeyPair = await repo.save(newSigningKey)

        return {
            ...savedKeyPair,
            privateKey: generatedSigningKey.privateKey,
        }
    },

    async list({ platformId }: ListParams): Promise<SeekPage<SigningKey>> {
        const data = await repo.findBy({
            ...spreadIfDefined('platformId', platformId),
        })

        return {
            data,
            next: null,
            previous: null,
        }
    },

    async get({ id }: GetParams): Promise<SigningKey | null> {
        return repo.findOneBy({
            id,
        })
    },

    async delete({ platformId, id }: DeleteParams): Promise<void> {
        await repo.delete({
            platformId,
            id,
        })
    },
}


type AddParams = {
    userId: UserId
    platformId: PlatformId
    displayName: string
}

type GetParams = {
    id: SigningKeyId
}

type DeleteParams = {
    id: SigningKeyId
    platformId: PlatformId
}

type NewSigningKey = Omit<SigningKey, 'created' | 'updated'>

type ListParams = {
    platformId?: PlatformId
}
