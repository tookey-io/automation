import { Principal, assertNotNullOrUndefined } from '@activepieces/shared'
import { ActivepiecesError, ErrorCode } from '@activepieces/shared'
import { jwtUtils } from '../../helper/jwt-utils'


export const accessTokenManager = {
    async generateToken(principal: Principal): Promise<string> {
        const secret = await jwtUtils.getJwtSecret()

        return jwtUtils.sign({
            payload: principal,
            key: secret,
        })
    },

    async extractPrincipal(token: string): Promise<Principal> {
        const secret = await jwtUtils.getJwtSecret()

        try {
            const decoded = await jwtUtils.decodeAndVerify<Principal>({
                jwt: token,
                key: secret,
            })
            assertNotNullOrUndefined(decoded.type, 'decoded.type')
            return decoded
        }
        catch (e) {
            throw new ActivepiecesError({
                code: ErrorCode.INVALID_BEARER_TOKEN,
                params: {
                    message: 'invalid access token',
                },
            })
        }
    },
}
