import { UserId, ActivepiecesError, ErrorCode } from '@activepieces/shared'
import { OtpType, ResetPasswordRequestBody, VerifyEmailRequestBody } from '@activepieces/ee-shared'
import { userService } from '../../../user/user-service'
import { otpService } from '../../otp/otp-service'

export const enterpriseLocalAuthnService = {
    async verifyEmail({ userId, otp }: VerifyEmailRequestBody): Promise<void> {
        await confirmOtp({
            userId,
            otp,
            otpType: OtpType.EMAIL_VERIFICATION,
        })

        await userService.verify({ id: userId })
    },

    async resetPassword({ userId, otp, newPassword }: ResetPasswordRequestBody): Promise<void> {
        await confirmOtp({
            userId,
            otp,
            otpType: OtpType.PASSWORD_RESET,
        })

        await userService.updatePassword({
            id: userId,
            newPassword,
        })
    },
}

const confirmOtp = async ({ userId, otp, otpType }: ConfirmOtpParams): Promise<void> => {
    const isOtpValid = await otpService.confirm({
        userId,
        type: otpType,
        value: otp,
    })

    if (!isOtpValid) {
        throw new ActivepiecesError({
            code: ErrorCode.INVALID_OTP,
            params: {},
        })
    }
}


type ConfirmOtpParams = {
    userId: UserId
    otp: string
    otpType: OtpType
}
