import { databaseConnection } from '../../../../src/app/database/database-connection'
import { setupApp } from '../../../../src/app/app'
import { generateMockToken } from '../../../helpers/auth'
import { createMockUser, createMockPlatform, createMockCustomDomain } from '../../../helpers/mocks'
import { StatusCodes } from 'http-status-codes'
import { FastifyInstance } from 'fastify'
import { faker } from '@faker-js/faker'
import { AddDomainRequest, CustomDomainStatus } from '@activepieces/ee-shared'
import { apId } from '@activepieces/shared'

let app: FastifyInstance | null = null

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('Custom Domain API', () => {
    describe('Add Custom Domain API', () => {
        it('should create a new custom domain', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const testToken = await generateMockToken({
                id: mockUser.id,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            const request: AddDomainRequest = {
                domain: faker.internet.domainName(),
            }
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/custom-domains',
                body: request,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.CREATED)
            const responseBody = response?.json()

            expect(responseBody.domain).toBe(request.domain)
            expect(responseBody.status).toBe(CustomDomainStatus.ACTIVE)
        })

        it('should fail if user is not platform owner', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const nonOwnerUserId = apId()
            const testToken = await generateMockToken({
                id: nonOwnerUserId,
                platform: { id: mockPlatform.id, role: 'MEMBER' },
            })

            const request: AddDomainRequest = {
                domain: faker.internet.domainName(),
            }
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/custom-domains',
                body: request,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })
    })


    describe('List Custom Domain API', () => {
        it('should list custom domains', async () => {
            // arrange
            const mockUser1 = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser1)

            const mockPlatform1 = createMockPlatform({ ownerId: mockUser1.id })
            await databaseConnection.getRepository('platform').save(mockPlatform1)

            const mockUser2 = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser2)

            const mockPlatform2 = createMockPlatform({ ownerId: mockUser2.id })
            await databaseConnection.getRepository('platform').save(mockPlatform2)

            const testToken1 = await generateMockToken({
                id: mockUser1.id,
                platform: { id: mockPlatform1.id, role: 'OWNER' },
            })


            const mockCustomDomains1 = [
                createMockCustomDomain({ platformId: mockPlatform1.id, domain: faker.internet.domainName() }),
                createMockCustomDomain({ platformId: mockPlatform1.id, domain: faker.internet.domainName() }),
            ]
            await databaseConnection.getRepository('custom_domain').save(mockCustomDomains1)

            const mockCustomDomains2 = [
                createMockCustomDomain({ platformId: mockPlatform2.id, domain: faker.internet.domainName() }),
            ]
            await databaseConnection.getRepository('custom_domain').save(mockCustomDomains2)

            // act
            const response1 = await app?.inject({
                method: 'GET',
                url: '/v1/custom-domains',
                headers: {
                    authorization: `Bearer ${testToken1}`,
                },
            })
            // assert
            expect(response1?.statusCode).toBe(StatusCodes.OK)
            const responseBody1 = response1?.json()

            // Assert that the response body contains the expected custom domains for platform 1
            expect(responseBody1.data).toHaveLength(mockCustomDomains1.length)
            expect(responseBody1.data[0].id).toBe(mockCustomDomains1[0].id)
            expect(responseBody1.data[1].id).toBe(mockCustomDomains1[1].id)
        })
    })

    describe('Delete Custom Domain API', () => {
        it('should delete a custom domain', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const testToken = await generateMockToken({
                id: mockUser.id,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })

            const customDomain = createMockCustomDomain({
                platformId: mockPlatform.id,
                domain: faker.internet.domainName(),
            })
            await databaseConnection.getRepository('custom_domain').save(customDomain)

            // act
            const response = await app?.inject({
                method: 'DELETE',
                url: `/v1/custom-domains/${customDomain.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.OK)
        })

        it('should fail to delete a custom domain if user is not platform owner', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const nonOwnerUserId = apId()
            const testToken = await generateMockToken({
                id: nonOwnerUserId,
                platform: { id: mockPlatform.id, role: 'MEMBER' },
            })

            const customDomain = createMockCustomDomain({
                platformId: mockPlatform.id,
                domain: faker.internet.domainName(),
            })
            await databaseConnection.getRepository('custom_domain').save(customDomain)

            // act
            const response = await app?.inject({
                method: 'DELETE',
                url: `/v1/custom-domains/${customDomain.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })
    })



})
