import { FastifyInstance } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { setupApp } from '../../../../src/app/app'
import { databaseConnection } from '../../../../src/app/database/database-connection'
import { createMockUser } from '../../../helpers/mocks'
import { OtpType } from '@activepieces/ee-shared'
import { emailService } from '../../../../src/app/ee/helper/email/email-service'

let app: FastifyInstance | null = null

beforeAll(async () => {
    await databaseConnection.initialize()
    app = await setupApp()
})

beforeEach(() => {
    emailService.sendVerifyEmail = jest.fn()
})

afterAll(async () => {
    await databaseConnection.destroy()
    await app?.close()
})

describe('OTP API', () => {
    describe('Create and Send Endpoint', () => {
        it('Generates new OTP', async () => {
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockCreateOtpRequest = {
                email: mockUser.email,
                type: OtpType.EMAIL_VERIFICATION,
            }

            // act
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/otp',
                body: mockCreateOtpRequest,
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.OK)
            const responseBody = response?.json()

            expect(Object.keys(responseBody)).toHaveLength(5)
            expect(responseBody?.id).toHaveLength(21)
            expect(responseBody).toHaveProperty<string>('created')
            expect(responseBody).toHaveProperty<string>('updated')
            expect(responseBody?.type).toBe(mockCreateOtpRequest.type)
            expect(responseBody?.userId).toBe(mockUser.id)
        })

        it('Sends OTP to user', async () => {
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockCreateOtpRequest = {
                email: mockUser.email,
                type: OtpType.EMAIL_VERIFICATION,
            }

            // act
            const response = await app?.inject({
                method: 'POST',
                url: '/v1/otp',
                body: mockCreateOtpRequest,
            })

            // assert
            expect(response?.statusCode).toBe(StatusCodes.OK)
            expect(emailService.sendVerifyEmail).toBeCalledTimes(1)
            expect(emailService.sendVerifyEmail).toHaveBeenCalledWith({
                email: mockUser.email,
                otp: expect.stringMatching(/^\d{6}$/),
                platformId: null,
            })
        })

        it('OTP is unique per user per OTP type', async () => {
            const mockUser = createMockUser()
            await databaseConnection.getRepository('user').save(mockUser)

            const mockCreateOtpRequest = {
                email: mockUser.email,
                type: OtpType.EMAIL_VERIFICATION,
            }

            // act
            const response1 = await app?.inject({
                method: 'POST',
                url: '/v1/otp',
                body: mockCreateOtpRequest,
            })

            const response2 = await app?.inject({
                method: 'POST',
                url: '/v1/otp',
                body: mockCreateOtpRequest,
            })

            // assert
            expect(response1?.statusCode).toBe(StatusCodes.OK)
            expect(response2?.statusCode).toBe(StatusCodes.OK)

            const otpCount = await databaseConnection.getRepository('otp').countBy({
                userId: mockUser.id,
                type: mockCreateOtpRequest.type,
            })

            expect(otpCount).toBe(1)
        })
    })
})
