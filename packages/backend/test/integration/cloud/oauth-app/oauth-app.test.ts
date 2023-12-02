import { databaseConnection } from '../../../../src/app/database/database-connection'
import { setupApp } from '../../../../src/app/app'
import { generateMockToken } from '../../../helpers/auth'
import { createMockUser, createMockPlatform, createMockOAuthApp } from '../../../helpers/mocks'
import { StatusCodes } from 'http-status-codes'
import { FastifyInstance } from 'fastify'
import { faker } from '@faker-js/faker'
import { UpsertOAuth2AppRequest } from '@activepieces/ee-shared'
import { apId } from '@activepieces/shared'

let app: FastifyInstance | null = null

const upsertRequest: UpsertOAuth2AppRequest = {
    pieceName: faker.lorem.word(),
    clientId: faker.lorem.word(),
    clientSecret: faker.lorem.word(),
}

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('OAuth App API', () => {
    describe('Upsert OAuth APP API', () => {
        it('new OAuth App', async () => {
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const testToken = await generateMockToken({
                id: mockUser.id,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            const response = await app?.inject({
                method: 'POST',
                url: '/v1/oauth-apps',
                body: upsertRequest,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()
            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody.id).toHaveLength(21)
            expect(responseBody.platformId).toBe(mockPlatform.id)
            expect(responseBody.pieceName).toBe(upsertRequest.pieceName)
            expect(responseBody.clientId).toBe(upsertRequest.clientId)
            expect(responseBody.clientSecret).toBeUndefined()
        })

        it('Fails if platform is not found', async () => {
            // arrange
            const nonExistentPlatformId = apId()

            const testToken = await generateMockToken({
                platform: {
                    id: nonExistentPlatformId,
                    role: 'OWNER',
                },
            })
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/oauth-apps',
                body: upsertRequest,
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

            const nonOwnerUserId = apId()
            const testToken = await generateMockToken({
                id: nonOwnerUserId,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            const response = await app?.inject({
                method: 'POST',
                url: '/v1/oauth-apps',
                body: upsertRequest,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })
    })

    describe('Delete OAuth App', () => {
        it('Forbid by Non Owner', async () => {
            // arrange
            const mockUser = createMockUser()
            const mockUserTwo = createMockUser()
            await databaseConnection.getRepository('user').save([mockUser, mockUserTwo])

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const mockOAuthApp = createMockOAuthApp({
                platformId: mockPlatform.id,
            })

            await databaseConnection.getRepository('oauth_app').save(mockOAuthApp)

            const testToken = await generateMockToken({
                id: mockUserTwo.id,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            // act
            const response = await app?.inject({
                method: 'DELETE',
                url: `/v1/oauth-apps/${mockOAuthApp.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })


            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })

        it('By Id', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const mockOAuthApp = createMockOAuthApp({
                platformId: mockPlatform.id,
            })

            await databaseConnection.getRepository('oauth_app').save(mockOAuthApp)

            const testToken = await generateMockToken({
                id: mockUser.id,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            // act
            const response = await app?.inject({
                method: 'DELETE',
                url: `/v1/oauth-apps/${mockOAuthApp.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })


            expect(response?.statusCode).toBe(StatusCodes.OK)
        })
    })

    describe('List OAuth Apps endpoint', () => {
        it('should list OAuth Apps by platform owner', async () => {
            // arrange
            const mockUserOne = createMockUser()
            const mockUserTwo = createMockUser()
            await databaseConnection.getRepository('user').save([mockUserOne, mockUserTwo])

            const mockPlatformOne = createMockPlatform({ ownerId: mockUserOne.id })
            const mockPlatformTwo = createMockPlatform({ ownerId: mockUserTwo.id })
            await databaseConnection.getRepository('platform').save([mockPlatformOne, mockPlatformTwo])

            const mockOAuthAppsOne = createMockOAuthApp({
                platformId: mockPlatformOne.id,
            })

            const mockOAuthAppsTwo = createMockOAuthApp({
                platformId: mockPlatformTwo.id,
            })

            await databaseConnection.getRepository('oauth_app').save([mockOAuthAppsOne, mockOAuthAppsTwo])

            const testToken = await generateMockToken({
                id: mockUserOne.id,
                platform: { id: mockPlatformOne.id, role: 'OWNER' },
            })
            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/oauth-apps',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody.data).toHaveLength(1)
            expect(responseBody.data[0].id).toBe(mockOAuthAppsOne.id)
            expect(responseBody.data[0].clientSecret).toBeUndefined()
        })

        it('should list OAuth Apps by platform member', async () => {
            // arrange
            const mockUserOne = createMockUser()
            const mockUserTwo = createMockUser()
            await databaseConnection.getRepository('user').save([mockUserOne, mockUserTwo])

            const mockPlatformOne = createMockPlatform({ ownerId: mockUserOne.id })
            const mockPlatformTwo = createMockPlatform({ ownerId: mockUserTwo.id })
            await databaseConnection.getRepository('platform').save([mockPlatformOne, mockPlatformTwo])

            const mockOAuthAppsOne = createMockOAuthApp({
                platformId: mockPlatformOne.id,
            })

            const mockOAuthAppsTwo = createMockOAuthApp({
                platformId: mockPlatformTwo.id,
            })

            await databaseConnection.getRepository('oauth_app').save([mockOAuthAppsOne, mockOAuthAppsTwo])

            const testToken = await generateMockToken({
                id: mockUserTwo.id,
                platform: { id: mockPlatformOne.id, role: 'MEMBER' },
            })
            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/oauth-apps',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody.data).toHaveLength(1)
            expect(responseBody.data[0].id).toBe(mockOAuthAppsOne.id)
            expect(responseBody.data[0].clientSecret).toBeUndefined()
        })
    })

    
})
