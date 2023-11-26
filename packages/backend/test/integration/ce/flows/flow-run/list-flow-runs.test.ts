import { databaseConnection } from '../../../../../src/app/database/database-connection'
import { setupApp } from '../../../../../src/app/app'
import { generateMockToken } from '../../../../helpers/auth'
import { FastifyInstance } from 'fastify'

let app: FastifyInstance | null = null

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('List flow runs endpoint', () => {
    it('should return 200', async () => {
        // arrange
        const testToken = await generateMockToken()

        // act
        const response = await app?.inject({
            method: 'GET',
            url: '/v1/flow-runs',
            headers: {
                authorization: `Bearer ${testToken}`,
            },
        })

        // assert
        expect(response?.statusCode).toBe(200)
    })
})
