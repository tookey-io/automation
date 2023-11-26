import { databaseConnection } from '../../../../src/app/database/database-connection'
import { setupApp } from '../../../../src/app/app'
import { generateMockToken } from '../../../helpers/auth'
import { createMockUser, createMockPlatform } from '../../../helpers/mocks'
import { StatusCodes } from 'http-status-codes'
import { FastifyInstance } from 'fastify'
import { apId } from '@activepieces/shared'
import { FilteredPieceBehavior, LocalesEnum, UpdatePlatformRequestBody } from '@activepieces/ee-shared'

let app: FastifyInstance | null = null

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('Platform API', () => {
    describe('update platform endpoint', () => {
        it('patches a platform by id', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)
            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)
            const testToken = await generateMockToken({ id: mockUser.id, platform: { id: mockPlatform.id, role: 'OWNER' } })
            const requestBody: UpdatePlatformRequestBody = {
                name: 'updated name',
                primaryColor: 'updated primary color',
                logoIconUrl: 'updated logo icon url',
                fullLogoUrl: 'updated full logo url',
                favIconUrl: 'updated fav icon url',
                filteredPieceNames: ['updated filtered piece names'],
                filteredPieceBehavior: FilteredPieceBehavior.ALLOWED,
                smtpHost: 'updated smtp host',
                smtpPort: 123,
                smtpUser: 'updated smtp user',
                smtpPassword: 'updated smtp password',
                smtpSenderEmail: 'updated smtp sender email',
                smtpUseSSL: true,
                privacyPolicyUrl: 'updated privacy policy url',
                termsOfServiceUrl: 'updated terms of service url',
                cloudAuthEnabled: false,
                defaultLocale: LocalesEnum.ENGLISH,
            }
            // act
            const response = await app?.inject({
                method: 'POST',
                url: `/v1/platforms/${mockPlatform.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
                body: requestBody,
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(Object.keys(responseBody)).toHaveLength(22)
            expect(responseBody.id).toBe(mockPlatform.id)
            expect(responseBody.created).toBeDefined()
            expect(responseBody.updated).toBeDefined()
            expect(responseBody.ownerId).toBe(mockUser.id)
            expect(responseBody.name).toBe('updated name')
            expect(responseBody.primaryColor).toBe('updated primary color')
            expect(responseBody.logoIconUrl).toBe('updated logo icon url')
            expect(responseBody.fullLogoUrl).toBe('updated full logo url')
            expect(responseBody.favIconUrl).toBe('updated fav icon url')
            expect(responseBody.filteredPieceNames).toStrictEqual(['updated filtered piece names'])
            expect(responseBody.filteredPieceBehavior).toBe('ALLOWED')
            expect(responseBody.smtpHost).toBe('updated smtp host')
            expect(responseBody.smtpPort).toBe(123)
            expect(responseBody.smtpUser).toBe('updated smtp user')
            expect(responseBody.smtpPassword).toBe('updated smtp password')
            expect(responseBody.smtpSenderEmail).toBe('updated smtp sender email')
            expect(responseBody.smtpUseSSL).toBe(true)
            expect(responseBody.privacyPolicyUrl).toBe('updated privacy policy url')
            expect(responseBody.termsOfServiceUrl).toBe('updated terms of service url')
            expect(responseBody.cloudAuthEnabled).toBe(false)
            expect(responseBody.defaultLocale).toBe(LocalesEnum.ENGLISH)
        })

        it('fails if user is not owner', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const testToken = await generateMockToken({ id: 'random-user-id' })

            // act
            const response = await app?.inject({
                method: 'POST',
                url: `/v1/platforms/${mockPlatform.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
                body: {
                    primaryColor: '#000000',
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })

        it('fails if platform doesn\'t exist', async () => {
            // arrange
            const randomPlatformId = apId()
            const testToken = await generateMockToken()

            // act
            const response = await app?.inject({
                method: 'POST',
                url: `/v1/platforms/${randomPlatformId}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
                body: {
                    primaryColor: '#000000',
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })
    })

    describe('get platform endpoint', () => {
        it('finds a platform by id without being owner', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const testToken = await generateMockToken({ id: mockUser.id })

            // act
            const response = await app?.inject({
                method: 'GET',
                url: `/v1/platforms/${mockPlatform.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })

        it('finds a platform by id', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const testToken = await generateMockToken({ id: mockUser.id, platform: { id: mockPlatform.id, role: 'OWNER' }  })

            // act
            const response = await app?.inject({
                method: 'GET',
                url: `/v1/platforms/${mockPlatform.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody.id).toBe(mockPlatform.id)
            expect(responseBody.ownerId).toBe(mockUser.id)
            expect(responseBody.name).toBe(mockPlatform.name)
            expect(responseBody.primaryColor).toBe(mockPlatform.primaryColor)
            expect(responseBody.logoIconUrl).toBe(mockPlatform.logoIconUrl)
            expect(responseBody.fullLogoUrl).toBe(mockPlatform.fullLogoUrl)
            expect(responseBody.favIconUrl).toBe(mockPlatform.favIconUrl)
        })

        it('fails if platform doesn\'t exist', async () => {
            // arrange
            const randomPlatformId = apId()
            const testToken = await generateMockToken()

            // act
            const response = await app?.inject({
                method: 'GET',
                url: `/v1/platforms/${randomPlatformId}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })
    })
})
