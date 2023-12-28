import { FastifyInstance } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { setupApp } from '../../../../src/app/app'
import { databaseConnection } from '../../../../src/app/database/database-connection'
import { createMockSignInRequest, createMockSignUpRequest } from '../../../helpers/mocks/authn'
import { createMockProject, createMockUser } from '../../../helpers/mocks'
import { ApFlagId, ProjectType, UserStatus } from '@activepieces/shared'
import { faker } from '@faker-js/faker'

let app: FastifyInstance | null = null

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

beforeEach(async () => {
    await databaseConnection.getRepository('flag').delete({})
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('Authentication API', () => {
    describe('Sign up Endpoint', () => {
        it('Adds new user', async () => {
            // arrange
            const mockSignUpRequest = createMockSignUpRequest()

            // act
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/authentication/sign-up',
                body: mockSignUpRequest,
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(Object.keys(responseBody)).toHaveLength(15)
            expect(responseBody?.id).toHaveLength(21)
            expect(responseBody?.created).toBeDefined()
            expect(responseBody?.updated).toBeDefined()
            expect(responseBody?.email).toBe(mockSignUpRequest.email)
            expect(responseBody?.firstName).toBe(mockSignUpRequest.firstName)
            expect(responseBody?.lastName).toBe(mockSignUpRequest.lastName)
            expect(responseBody?.trackEvents).toBe(mockSignUpRequest.trackEvents)
            expect(responseBody?.newsLetter).toBe(mockSignUpRequest.newsLetter)
            expect(responseBody?.password).toBeUndefined()
            expect(responseBody?.status).toBe('VERIFIED')
            expect(responseBody?.platformId).toBe(null)
            expect(responseBody?.externalId).toBe(null)
            expect(responseBody?.projectId).toHaveLength(21)
            expect(responseBody?.token).toBeDefined()
        })
        

        it('Fails if USER_CREATED flag is set, and sign-up is disabled', async () => {
            // arrange
            const mockSignUpRequest = createMockSignUpRequest()
            await databaseConnection.getRepository('flag').save({
                id: ApFlagId.USER_CREATED,
                value: true,
            })

            // act
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/authentication/sign-up',
                body: mockSignUpRequest,
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.FORBIDDEN)
        })

        it('Creates new project for user', async () => {
            // arrange
            const mockSignUpRequest = createMockSignUpRequest()

            // act
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/authentication/sign-up',
                body: mockSignUpRequest,
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.OK)
            const responseBody = response?.json()

            const project = await databaseConnection.getRepository('project').findOneBy({
                id: responseBody.projectId,
            })

            expect(project?.ownerId).toBe(responseBody.id)
            expect(project?.displayName).toBe(`${responseBody.firstName}'s Project`)
            expect(project?.type).toBe(ProjectType.STANDALONE)
            expect(project?.platformId).toBeNull()
        })
    })

    describe('Sign in Endpoint', () => {
        it('Logs in existing users', async () => {
            // arrange
            const mockEmail = faker.internet.email()
            const mockPassword = 'password'

            const mockUser = createMockUser({
                email: mockEmail,
                password: mockPassword,
                status: UserStatus.VERIFIED,
            })
            await databaseConnection.getRepository('user').save(mockUser)

            const mockProject = createMockProject({
                ownerId: mockUser.id,
            })
            await databaseConnection.getRepository('project').save(mockProject)

            const mockSignInRequest = createMockSignInRequest({
                email: mockEmail,
                password: mockPassword,
            })

            // act
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/authentication/sign-in',
                body: mockSignInRequest,
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(Object.keys(responseBody)).toHaveLength(15)
            expect(responseBody?.id).toBe(mockUser.id)
            expect(responseBody?.email).toBe(mockEmail)
            expect(responseBody?.firstName).toBe(mockUser.firstName)
            expect(responseBody?.lastName).toBe(mockUser.lastName)
            expect(responseBody?.trackEvents).toBe(mockUser.trackEvents)
            expect(responseBody?.newsLetter).toBe(mockUser.newsLetter)
            expect(responseBody?.password).toBeUndefined()
            expect(responseBody?.status).toBe(mockUser.status)
            expect(responseBody?.platformId).toBe(null)
            expect(responseBody?.externalId).toBe(null)
            expect(responseBody?.projectId).toBe(mockProject.id)
            expect(responseBody?.token).toBeDefined()
        })

        it('Fails if password doesn\'t match', async () => {
            // arrange
            const mockEmail = faker.internet.email()
            const mockPassword = 'password'

            const mockUser = createMockUser({
                email: mockEmail,
                password: mockPassword,
                status: UserStatus.VERIFIED,
            })
            await databaseConnection.getRepository('user').save(mockUser)

            const mockProject = createMockProject({
                ownerId: mockUser.id,
            })
            await databaseConnection.getRepository('project').save(mockProject)

            const mockSignInRequest = createMockSignInRequest({
                email: mockEmail,
                password: 'wrong password',
            })

            // act
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/authentication/sign-in',
                body: mockSignInRequest,
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.UNAUTHORIZED)
            const responseBody = response?.json()
            expect(responseBody?.code).toBe('INVALID_CREDENTIALS')
        })

    })
})
