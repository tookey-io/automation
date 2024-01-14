import { databaseConnection } from '../../../../src/app/database/database-connection'
import { setupApp } from '../../../../src/app/app'
import { StatusCodes } from 'http-status-codes'
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

describe('AppSumo API', () => {
    describe('Action endpoint', () => {
        it('Activates new accounts', async () => {
            // arrange
            const mockEmail = 'mock-email'

            const requestBody = {
                action: 'activate',
                plan_id: 'plan_id',
                uuid: 'uuid',
                activation_email: mockEmail,
            }

            const appSumoToken = 'app-sumo-token'

            // act
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/appsumo/action',
                headers: {
                    authorization: `Bearer ${appSumoToken}`,
                },
                body: requestBody,
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.CREATED)
            const responseBody = response?.json()

            expect(responseBody?.message).toBe('success')
            expect(responseBody?.redirect_url).toBe(`https://cloud.activepieces.com/sign-up?email=${mockEmail}`)
        })
    })
})
