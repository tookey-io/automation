import { databaseConnection } from '../../../../src/app/database/database-connection'
import { setupApp } from '../../../../src/app/app'
import { generateMockToken } from '../../../helpers/auth'
import { createMockUser, createMockPlatform, createMockProject } from '../../../helpers/mocks'
import { StatusCodes } from 'http-status-codes'
import { FastifyInstance } from 'fastify'
import { NotificationStatus, ProjectType } from '@activepieces/shared'
import { faker } from '@faker-js/faker'
import { UpdateProjectPlatformRequest } from '@activepieces/ee-shared'
import { stripeHelper } from '../../../../src/app/ee/billing/billing/stripe-helper'

let app: FastifyInstance | null = null

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('Project API', () => {
    describe('List Projects', () => {
        it('it should list owned projects', async () => {
            const mockUser = createMockUser()
            const mockUser2 = createMockUser()
            await databaseConnection.getRepository('user').save([mockUser, mockUser2])

            const mockPlatform = createMockPlatform({
                ownerId: mockUser.id,
            })
            await databaseConnection.getRepository('platform').save([mockPlatform])

            const mockProject = createMockProject({
                ownerId: mockUser.id,
                platformId: mockPlatform.id,
            })
            const mockProject2 = createMockProject({
                ownerId: mockUser.id,
            })
            const mockProject3 = createMockProject({
                ownerId: mockUser2.id,
            })
            await databaseConnection.getRepository('project').save([mockProject, mockProject2, mockProject3])


            stripeHelper.getOrCreateCustomer = jest.fn().mockResolvedValue(faker.string.uuid())


            const testToken = await generateMockToken({
                id: mockUser.id,
                projectId: mockProject2.id,
            })

            const response = await app?.inject({
                method: 'GET',
                url: '/v1/projects',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()
            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody.length).toBe(2)
            expect(responseBody[0].id).toEqual(mockProject.id)
            expect(responseBody[1].id).toEqual(mockProject2.id)
        })

    })

    describe('Update Project', () => {
        it('it should update project and ignore plan as project owner', async () => {
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)
            const mockProject = createMockProject({
                ownerId: mockUser.id,
            })
            await databaseConnection.getRepository('project').save([mockProject])

            const testToken = await generateMockToken({
                id: mockUser.id,
                projectId: mockProject.id,
            })

            const tasks = faker.number.int({ min: 1, max: 100000 })
            const teamMembers = faker.number.int({ min: 1, max: 100 })

            stripeHelper.getOrCreateCustomer = jest.fn().mockResolvedValue(faker.string.uuid())


            const request: UpdateProjectPlatformRequest = {
                displayName: faker.animal.bird(),
                notifyStatus: NotificationStatus.NEVER,
                plan: {
                    tasks,
                    teamMembers,
                },
            }
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/projects/' + mockProject.id,
                body: request,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.OK)
            const responseBody = response?.json()

            expect(responseBody.id).toBe(mockProject.id)
            expect(responseBody.displayName).toBe(request.displayName)
            expect(responseBody.notifyStatus).toBe(request.notifyStatus)
        })

        it('it should update project as platform owner', async () => {
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockPlatform = createMockPlatform({ ownerId: mockUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const mockProject = createMockProject({
                ownerId: mockUser.id,
                platformId: mockPlatform.id,
            })
            const mockProjectTwo = createMockProject({
                ownerId: mockUser.id,
                type: ProjectType.PLATFORM_MANAGED,
                platformId: mockPlatform.id,
            })
            await databaseConnection.getRepository('project').save([mockProject, mockProjectTwo])

            const testToken = await generateMockToken({
                id: mockUser.id,
                projectId: mockProject.id,
                platform: { id: mockPlatform.id, role: 'OWNER' },
            })


            stripeHelper.getOrCreateCustomer = jest.fn().mockResolvedValue(faker.string.uuid())

            const tasks = faker.number.int({ min: 1, max: 100000 })
            const teamMembers = faker.number.int({ min: 1, max: 100 })
            const request: UpdateProjectPlatformRequest = {
                displayName: faker.animal.bird(),
                notifyStatus: NotificationStatus.NEVER,
                plan: {
                    tasks,
                    teamMembers,
                },
            }

            const response = await app?.inject({
                method: 'POST',
                url: '/v1/projects/' + mockProjectTwo.id,
                body: request,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.OK)
            const responseBody = response?.json()
            expect(responseBody.displayName).toBe(request.displayName)
            expect(responseBody.notifyStatus).toBe(request.notifyStatus)
            expect(responseBody.plan.tasks).toEqual(tasks)
            expect(responseBody.plan.teamMembers).toEqual(teamMembers)
        })

        it('Fails if user is not platform owner', async () => {
            const memberUser = createMockUser()
            const platfornOwnerUser = createMockUser()

            await databaseConnection.getRepository('user').save([memberUser, platfornOwnerUser])

            const mockPlatform = createMockPlatform({ ownerId: platfornOwnerUser.id })
            await databaseConnection.getRepository('platform').save(mockPlatform)

            const mockProject = createMockProject({
                ownerId: platfornOwnerUser.id,
                platformId: mockPlatform.id,
            })
            const mockProjectTwo = createMockProject({
                ownerId: platfornOwnerUser.id,
                platformId: mockPlatform.id,
            })
            await databaseConnection.getRepository('project').save([mockProject, mockProjectTwo])

            const testToken = await generateMockToken({
                id: memberUser.id,
                projectId: mockProject.id,
                platform: { id: mockPlatform.id, role: 'MEMBER' },
            })

            const request: UpdateProjectPlatformRequest = {
                displayName: faker.animal.bird(),
                notifyStatus: NotificationStatus.NEVER,
            }
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/projects/' + mockProjectTwo.id,
                body: request,
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })
    })


})
