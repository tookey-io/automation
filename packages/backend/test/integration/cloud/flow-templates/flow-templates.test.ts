import { databaseConnection } from '../../../../src/app/database/database-connection'
import { setupApp } from '../../../../src/app/app'
import { generateMockToken } from '../../../helpers/auth'
import { createMockUser, createMockPlatform, createMockTemplate, createMockProject, CLOUD_PLATFORM_ID } from '../../../helpers/mocks'
import { StatusCodes } from 'http-status-codes'
import { FastifyInstance } from 'fastify'
import { PlatformRole, PrincipalType, TemplateType, apId } from '@activepieces/shared'

let app: FastifyInstance | null = null

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('Flow Templates', () => {
    describe('List Flow Templates', () => {
        it('should list platform templates only', async () => {
            // arrange
            const { mockPlatform, mockUser, mockPlatformTemplate } = await createMockPlatformTemplate({ platformId: apId() })

            const testToken = await generateMockToken({
                type: PrincipalType.USER,
                id: mockUser.id,
                platform: { id: mockPlatform.id, role: PlatformRole.MEMBER },
            })

            const response = await app?.inject({
                method: 'GET',
                url: '/v1/flow-templates',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.OK)
            const responseBody = response?.json()
            expect(responseBody.data).toHaveLength(1)
            expect(responseBody.data[0].id).toBe(mockPlatformTemplate.id)
        })

        it('should list cloud platform template for anonymous users', async () => {
            // arrange
            const { mockPlatformTemplate } = await createMockPlatformTemplate({ platformId: CLOUD_PLATFORM_ID })
            const _randomPlatformTemplate = await createMockPlatformTemplate({ platformId: apId() })
    
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/flow-templates',
            })
    
            // assert
            expect(response?.statusCode).toBe(StatusCodes.OK)
            const responseBody = response?.json()
            expect(responseBody.data).toHaveLength(1)
            expect(responseBody.data[0].id).toBe(mockPlatformTemplate.id)
        })
    })

    
    describe('Delete Flow Template', () => {
        
        it('should not be able delete platform template as member', async () => {
            // arrange
            const { mockPlatform, mockPlatformTemplate } = await createMockPlatformTemplate({ platformId: apId() })
            const mockUser2 = createMockUser({ platformId: mockPlatform.id })
            const testToken = await generateMockToken({
                type: PrincipalType.USER,
                id: mockUser2.id,
                platform: { id: mockPlatform.id, role: PlatformRole.MEMBER },
            })

            const response = await app?.inject({
                method: 'DELETE',
                url: `/v1/flow-templates/${mockPlatformTemplate.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })


        it('should be able delete platform template as owner', async () => {
            // arrange
            const { mockPlatform, mockUser, mockPlatformTemplate } = await createMockPlatformTemplate({ platformId: apId() })

            const testToken = await generateMockToken({
                type: PrincipalType.USER,
                id: mockUser.id,
                platform: { id: mockPlatform.id, role: PlatformRole.OWNER },
            })

            const response = await app?.inject({
                method: 'DELETE',
                url: `/v1/flow-templates/${mockPlatformTemplate.id}`,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.NO_CONTENT)
        })

        it('should not delete platform template when not authenticated', async () => {
            // arrange
            const { mockPlatformTemplate } = await createMockPlatformTemplate({ platformId: CLOUD_PLATFORM_ID })

            const response = await app?.inject({
                method: 'DELETE',
                url: `/v1/flow-templates/${mockPlatformTemplate.id}`,
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.UNAUTHORIZED)
        })
    })

})


async function createMockPlatformTemplate({ platformId }: { platformId: string }) {
    const mockUser = createMockUser()
    await databaseConnection.getRepository('user').save(mockUser)

    const mockPlatform = createMockPlatform({ id: platformId, ownerId: mockUser.id })
    await databaseConnection.getRepository('platform').save(mockPlatform)

    const mockProject = createMockProject({ ownerId: mockUser.id, platformId: mockPlatform.id })
    await databaseConnection.getRepository('project').save(mockProject)

    const mockPlatformTemplate = createMockTemplate({ platformId: mockPlatform.id, projectId: mockProject.id, type: TemplateType.PLATFORM })
    await databaseConnection.getRepository('flow_template').save(mockPlatformTemplate)

    return { mockUser, mockPlatform, mockProject, mockPlatformTemplate } 
}