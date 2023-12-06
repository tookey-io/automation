import { databaseConnection } from '../../../../src/app/database/database-connection'
import { setupApp } from '../../../../src/app/app'
import { generateMockToken } from '../../../helpers/auth'
import { createMockPieceMetadata, createMockPlatform, createMockProject, createMockUser } from '../../../helpers/mocks'
import { StatusCodes } from 'http-status-codes'
import { FastifyInstance } from 'fastify'
import { FilteredPieceBehavior } from '@activepieces/ee-shared'
import { PieceType, PrincipalType, ProjectType, apId } from '@activepieces/shared'

let app: FastifyInstance | null = null

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

beforeEach(async () => {
    await databaseConnection.getRepository('piece_metadata').delete({})
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('Piece Metadata API', () => {


    describe('Get Piece metadata', () => {
        it('Should return metadata when authenticated', async () => {
            // arrange
            const mockPieceMetadata = createMockPieceMetadata({ name: '@activepieces/a', pieceType: PieceType.OFFICIAL })
            await databaseConnection.getRepository('piece_metadata').save(mockPieceMetadata)

            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save([mockUser])

            const mockPlatform = createMockPlatform({
                ownerId: mockUser.id,
                filteredPieceNames: [],
                filteredPieceBehavior: FilteredPieceBehavior.BLOCKED,
            })
            await databaseConnection.getRepository('platform').save([mockPlatform])

            const mockProject = createMockProject({
                platformId: mockPlatform.id,
                type: ProjectType.PLATFORM_MANAGED,
                ownerId: mockUser.id,
            })
            await databaseConnection.getRepository('project').save([mockProject])

            const testToken = await generateMockToken({
                type: PrincipalType.USER,
                projectId: mockProject.id,
                id: apId(),
            })

            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/pieces/@activepieces/a',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody.id).toBe(mockPieceMetadata.id)
        })

        it('Should return metadata when not authenticated', async () => {


            // arrange
            const mockPieceMetadata = createMockPieceMetadata({ name: '@activepieces/a', pieceType: PieceType.OFFICIAL })
            await databaseConnection.getRepository('piece_metadata').save(mockPieceMetadata)

            const testToken = await generateMockToken({
                projectId: apId(),
                type: PrincipalType.UNKNOWN,
                id: apId(),
            })

            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/pieces/@activepieces/a',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            // Expectations for each attribute
            expect(responseBody.actions).toEqual(mockPieceMetadata.actions)
            expect(responseBody.triggers).toEqual(mockPieceMetadata.triggers)
            expect(responseBody.archiveId).toBe(mockPieceMetadata.archiveId)
            expect(responseBody.auth).toEqual(mockPieceMetadata.auth)
            expect(responseBody.description).toBe(mockPieceMetadata.description)
            expect(responseBody.directoryName).toBe(mockPieceMetadata.directoryName)
            expect(responseBody.displayName).toBe(mockPieceMetadata.displayName)
            expect(responseBody.id).toBe(mockPieceMetadata.id)
            expect(responseBody.logoUrl).toBe(mockPieceMetadata.logoUrl)
            expect(responseBody.maximumSupportedRelease).toBe(mockPieceMetadata.maximumSupportedRelease)
            expect(responseBody.minimumSupportedRelease).toBe(mockPieceMetadata.minimumSupportedRelease)
            expect(responseBody.packageType).toBe(mockPieceMetadata.packageType)
            expect(responseBody.pieceType).toBe(mockPieceMetadata.pieceType)
            expect(responseBody.platformId).toBe(mockPieceMetadata.platformId)
            expect(responseBody.projectId).toBe(mockPieceMetadata.projectId)
            expect(responseBody.version).toBe(mockPieceMetadata.version)
        })
    })
    describe('List Piece Metadata endpoint', () => {
        it('Should list platform and project pieces', async () => {

            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save([mockUser])

            const mockPlatform = createMockPlatform({
                ownerId: mockUser.id,
                filteredPieceNames: [],
                filteredPieceBehavior: FilteredPieceBehavior.BLOCKED,
            })
            await databaseConnection.getRepository('platform').save([mockPlatform])

            const mockProject = createMockProject({
                platformId: mockPlatform.id,
                type: ProjectType.PLATFORM_MANAGED,
                ownerId: mockUser.id,
            })
            const mockProject2 = createMockProject({
                platformId: mockPlatform.id,
                type: ProjectType.PLATFORM_MANAGED,
                ownerId: mockUser.id,
            })
            await databaseConnection.getRepository('project').save([mockProject, mockProject2])

            // arrange
            const mockPieceMetadataA = createMockPieceMetadata({ name: 'a', pieceType: PieceType.CUSTOM, projectId: mockProject.id })
            const mockPieceMetadataB = createMockPieceMetadata({ name: 'b', pieceType: PieceType.OFFICIAL })
            const mockPieceMetadataC = createMockPieceMetadata({ name: 'c', pieceType: PieceType.CUSTOM, projectId: mockProject2.id })
            const mockPieceMetadataD = createMockPieceMetadata({ name: 'd', pieceType: PieceType.CUSTOM, platformId: mockPlatform.id })
            await databaseConnection.getRepository('piece_metadata').save([mockPieceMetadataA, mockPieceMetadataB, mockPieceMetadataC, mockPieceMetadataD])

            const testToken = await generateMockToken({
                type: PrincipalType.USER,
                projectId: mockProject.id,
                id: mockUser.id,
                platform: {
                    id: mockPlatform.id,
                    role: 'MEMBER',
                },
            })

            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/pieces?release=1.1.1',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody).toHaveLength(3)
            expect(responseBody?.[0].id).toBe(mockPieceMetadataA.id)
            expect(responseBody?.[1].id).toBe(mockPieceMetadataB.id)
            expect(responseBody?.[2].id).toBe(mockPieceMetadataD.id)
        })

        it('Should list project pieces', async () => {

            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save([mockUser])

            const mockProject = createMockProject({
                ownerId: mockUser.id,
            })
            const mockProject2 = createMockProject({
                ownerId: mockUser.id,
            })
            await databaseConnection.getRepository('project').save([mockProject, mockProject2])

            // arrange
            const mockPieceMetadataA = createMockPieceMetadata({ name: 'a', pieceType: PieceType.CUSTOM, projectId: mockProject.id })
            const mockPieceMetadataB = createMockPieceMetadata({ name: 'b', pieceType: PieceType.OFFICIAL })
            const mockPieceMetadataC = createMockPieceMetadata({ name: 'c', pieceType: PieceType.CUSTOM, projectId: mockProject2.id })
            await databaseConnection.getRepository('piece_metadata').save([mockPieceMetadataA, mockPieceMetadataB, mockPieceMetadataC])

            const testToken = await generateMockToken({
                type: PrincipalType.USER,
                projectId: mockProject.id,
                id: mockUser.id,
            })

            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/pieces?release=1.1.1',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody).toHaveLength(2)
            expect(responseBody?.[0].id).toBe(mockPieceMetadataA.id)
            expect(responseBody?.[1].id).toBe(mockPieceMetadataB.id)
        })

        it('Sorts by piece name', async () => {
            // arrange
            const mockPieceMetadataA = createMockPieceMetadata({ name: 'a', pieceType: PieceType.OFFICIAL })
            const mockPieceMetadataB = createMockPieceMetadata({ name: 'b', pieceType: PieceType.OFFICIAL })
            await databaseConnection.getRepository('piece_metadata').save([mockPieceMetadataA, mockPieceMetadataB])

            const testToken = await generateMockToken()

            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/pieces?release=1.1.1',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody).toHaveLength(2)
            expect(responseBody?.[0].id).toBe(mockPieceMetadataA.id)
            expect(responseBody?.[1].id).toBe(mockPieceMetadataB.id)
        })

        it('Allows filtered pieces if platform filter is set to "ALLOWED"', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save([mockUser])

            const mockPlatform = createMockPlatform({
                ownerId: mockUser.id,
                filteredPieceNames: ['a'],
                filteredPieceBehavior: FilteredPieceBehavior.ALLOWED,
            })

            await databaseConnection.getRepository('platform').save([mockPlatform])

            const mockPieceMetadataA = createMockPieceMetadata({ name: 'a', pieceType: PieceType.OFFICIAL })
            const mockPieceMetadataB = createMockPieceMetadata({ name: 'b', pieceType: PieceType.OFFICIAL })
            await databaseConnection.getRepository('piece_metadata').save([mockPieceMetadataA, mockPieceMetadataB])

            const testToken = await generateMockToken({
                type: PrincipalType.USER,
                platform: {
                    id: mockPlatform.id,
                    role: 'OWNER',
                },
            })

            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/pieces?release=1.1.1',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody).toHaveLength(1)
            expect(responseBody?.[0].id).toBe(mockPieceMetadataA.id)
        })

        it('Blocks filtered pieces if platform filter is set to "BLOCKED"', async () => {
            // arrange
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save([mockUser])

            const mockPlatform = createMockPlatform({
                ownerId: mockUser.id,
                filteredPieceNames: ['a'],
                filteredPieceBehavior: FilteredPieceBehavior.BLOCKED,
            })

            await databaseConnection.getRepository('platform').save([mockPlatform])

            const mockPieceMetadataA = createMockPieceMetadata({ name: 'a', pieceType: PieceType.OFFICIAL })
            const mockPieceMetadataB = createMockPieceMetadata({ name: 'b', pieceType: PieceType.OFFICIAL })
            await databaseConnection.getRepository('piece_metadata').save([mockPieceMetadataA, mockPieceMetadataB])

            const testToken = await generateMockToken({
                type: PrincipalType.USER,
                platform: {
                    id: mockPlatform.id,
                    role: 'OWNER',
                },
            })

            // act
            const response = await app?.inject({
                method: 'GET',
                url: '/v1/pieces?release=1.1.1',
                headers: {
                    authorization: `Bearer ${testToken}`,
                },
            })

            // assert
            const responseBody = response?.json()

            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(responseBody).toHaveLength(1)
            expect(responseBody?.[0].id).toBe(mockPieceMetadataB.id)
        })
    })
})
