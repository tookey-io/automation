import { FastifyRequest } from 'fastify'
import { accessTokenManager } from './lib/access-token-manager'
import { API_KEY_PROTECTED_ROUTES } from '../ee/authentication/api-key-auth-middleware.ee'
import { ActivepiecesError, ErrorCode, PrincipalType, ProjectType, apId } from '@activepieces/shared'

const ignoredRoutes = new Set([
    // BEGIN EE
    '/v1/connection-keys/app-connections',
    '/v1/firebase/users',
    '/v1/firebase/sign-in',
    '/v1/billing/stripe/webhook',
    '/v1/flow-templates',
    '/v1/appsumo/token',
    '/v1/appsumo/action',
    '/v1/flow-templates/:id',
    '/v1/project-members/accept',
    '/v1/managed-authn/external-token',
    '/v1/otp',
    '/v1/authn/local/reset-password',
    '/v1/authn/federated/login',
    '/v1/authn/federated/claim',
    ...(API_KEY_PROTECTED_ROUTES.map(f => f.url)),
    // END EE
    '/v1/chatbots/:id/ask',
    '/v1/chatbots/:id/metadata',
    '/v1/flow-runs/:id/resume',
    '/v1/pieces/stats',
    '/v1/pieces/:name',
    '/v1/pieces/:scope/:name',
    '/v1/app-events/:pieceUrl',
    '/v1/authentication/sign-in',
    '/v1/authentication/sign-up',
    '/v1/flags',
    '/v1/webhooks',
    '/v1/webhooks/:flowId',
    '/v1/webhooks/:flowId/sync',
    '/v1/webhooks/:flowId/simulate',
    '/v1/docs',
    '/redirect',

    // External authentication endpoint
    '/v1/authentication/external/service/auth',
])

const HEADER_PREFIX = 'Bearer '

export const tokenVerifyMiddleware = async (request: FastifyRequest): Promise<void> => {
    request.principal = {
        id: `ANONYMOUS_${apId()}`,
        type: PrincipalType.UNKNOWN,
        projectId: `ANONYMOUS_${apId()}`,
        projectType: ProjectType.STANDALONE,
    }
    const rawToken = request.headers.authorization
    if (!rawToken) {
        if (requiresAuthentication(request.routerPath, request.method)) {
            throw new ActivepiecesError({
                code: ErrorCode.INVALID_BEARER_TOKEN,
                params: {
                    message: 'access token is undefined',
                },
            })
        }
    }
    else {
        try {
            const token = rawToken.substring(HEADER_PREFIX.length)
            const principal = await accessTokenManager.extractPrincipal(token)
            request.principal = principal
        }
        catch (e) {
            if (requiresAuthentication(request.routerPath, request.method)) {
                throw new ActivepiecesError({
                    code: ErrorCode.INVALID_BEARER_TOKEN,
                    params: {
                        message: 'invalid access token',
                    },
                })
            }
        }
    }
}

function requiresAuthentication(routerPath: string, method: string): boolean {
    if (ignoredRoutes.has(routerPath)) {
        return false
    }
    if (routerPath.startsWith('/ui')) {
        return false
    }
    if (routerPath == '/v1/app-credentials' && method == 'GET') {
        return false
    }
    if (routerPath == '/v1/pieces' && method == 'GET') {
        return false
    }
    return true
}
