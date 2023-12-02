import { databaseConnection } from '../../../../src/app/database/database-connection'
import { setupApp } from '../../../../src/app/app'
import { generateMockToken } from '../../../helpers/auth'
import { createMockUser, createMockPlatform, createMockSigningKey } from '../../../helpers/mocks'
import { StatusCodes } from 'http-status-codes'
import { FastifyInstance } from 'fastify'
import { apId } from '@activepieces/shared'
import { faker } from '@faker-js/faker'

let app: FastifyInstance | null = null

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('Signing Key API', () => {
    describe('Add Signing Key API', () => {
        it('Creates new Signing Key', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const testToken = await generateMockToken({
                id: mockUser.id,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            const mockSigningKeyName = faker.lorem.word()
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/signing-keys',
                body: {
                    displayName: mockSigningKeyName,
                },
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.CREATED)
            expect(responseBody.id).toHaveLength(21)
            expect(responseBody.platformId).toBe(mockPlatform.id)
            expect(responseBody.publicKey).toBeDefined()
            expect(responseBody.displayName).toBe(mockSigningKeyName)
            expect(responseBody.privateKey).toBeDefined()
            expect(responseBody.generatedBy).toBe(mockUser.id)
            expect(responseBody.algorithm).toBe('RSA')
        }, 10000)

        it('Fails if platform is not found', async () => {
            // arrange
            const nonExistentPlatformId = apId()

            const testToken = await generateMockToken({
                platform: {
                    id: nonExistentPlatformId,
                    role: 'OWNER',
                },
            })

            const mockSigningKeyName = faker.lorem.word()
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/signing-keys',
                body: {
                    displayName: mockSigningKeyName,
                },
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.NOT_FOUND)
        })

        it('Fails if user is not platform owner', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const mockSigningKey = createMockSigningKey({
                platformId: mockPlatform.id,
                generatedBy: mockUser.id,
            })

            await databaseConnection.getRepository('signing_key').save(mockSigningKey)

            const nonOwnerUserId = apId()
            const testToken = await generateMockToken({
                id: nonOwnerUserId,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            const mockSigningKeyName = faker.lorem.word()
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/signing-keys',
                body: {
                    displayName: mockSigningKeyName,
                },
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })
    })

    describe('Get Signing Key endpoint', () => {
        it('Finds a Signing Key by id', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const mockSigningKey = createMockSigningKey({
                platformId: mockPlatform.id,
                generatedBy: mockUser.id,
            })

            await databaseConnection.getRepository('signing_key').save(mockSigningKey)

            const testToken = await generateMockToken({
                id: mockUser.id,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            // act
            const response = await app?.inject({
                method: 'GET',
                url: `/v1/signing-keys/${mockSigningKey.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody.id).toBe(mockSigningKey.id)
            expect(responseBody.platformId).toBe(mockSigningKey.platformId)
            expect(responseBody.publicKey).toBe(mockSigningKey.publicKey)
            expect(responseBody.generatedBy).toBe(mockSigningKey.generatedBy)
            expect(responseBody.algorithm).toBe(mockSigningKey.algorithm)
        })
    })

    describe('Delete Signing Key endpoint', () => {
        it('Fail if non owner', async () => {
            // arrange
            const mockUser = createMockUser()
            const mockUserTwo = createMockUser()
            await databaseConnection.getRepository('user').save([mockUser, mockUserTwo])

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save([mockPlatform])

            const mockSigningKey = createMockSigningKey({
                platformId: mockPlatform.id,
                generatedBy: mockUser.id,
            })

            await databaseConnection.getRepository('signing_key').save(mockSigningKey)

            const testToken = await generateMockToken({
                id: mockUserTwo.id,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            // act
            const response = await app?.inject({
                method: 'DELETE',
                url: `/v1/signing-keys/${mockSigningKey.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })
    })

    describe('List Signing Keys endpoint', () => {
        it('Filters Signing Keys by platform', async () => {
            // arrange
            const mockUserOne = createMockUser()
            const mockUserTwo = createMockUser()
            await databaseConnection.getRepository('user').save([mockUserOne, mockUserTwo])

            const mockPlatformOne = createMockPlatform({ ownerId: mockUserOne.id })
            const mockPlatformTwo = createMockPlatform({ ownerId: mockUserTwo.id })
            await databaseConnection.getRepository('platform').save([mockPlatformOne, mockPlatformTwo])

            const mockSigningKeyOne = createMockSigningKey({
                platformId: mockPlatformOne.id,
                generatedBy: mockUserOne.id,
            })

            const mockSigningKeyTwo = createMockSigningKey({
                platformId: mockPlatformTwo.id,
                generatedBy: mockUserTwo.id,
            })

            await databaseConnection.getRepository('signing_key').save([mockSigningKeyOne, mockSigningKeyTwo])

            const testToken = await generateMockToken({
                id: mockUserOne.id,
                platform: { id: mockPlatformOne.id, role: 'OWNER' },
            })
            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/signing-keys',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody.data).toHaveLength(1)
            expect(responseBody.data[0].id).toBe(mockSigningKeyOne.id)
        })
    })
})
