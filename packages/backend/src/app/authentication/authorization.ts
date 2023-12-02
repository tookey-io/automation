import { ActivepiecesError, ErrorCode, PrincipalType } from '@activepieces/shared'
import { onRequestHookHandler, preSerializationHookHandler } from 'fastify'
import { logger } from '../helper/logger'

export const allowWorkersOnly: onRequestHookHandler = (request, _res, done) => {
    if (request.principal.type !== PrincipalType.WORKER) {
        throw new ActivepiecesError({
            code: ErrorCode.AUTHORIZATION,
            params: {},
        })
    }

    done()
}

/**
 * Throws an authz error if response entities contain a `projectId` property and
 * the `projectId` property value does not match the principal's `projectId`.
 * Otherwise, does nothing.
 */
export const entitiesMustBeOwnedByCurrentProject: preSerializationHookHandler<Payload | null> = (request, _response, payload, done) => {
    logger.trace({ payload, principal: request.principal, route: request.routeConfig }, 'entitiesMustBeOwnedByCurrentProject')

    if (isObject(payload)) {
        const principalProjectId = request.principal.projectId
        let verdict: AuthzVerdict = 'ALLOW'

        if ('projectId' in payload) {
            if (payload.projectId !== principalProjectId) {
                verdict = 'DENY'
            }
        }
        else if ('data' in payload && Array.isArray(payload.data)) {
            const someEntityNotOwnedByCurrentProject = payload.data.some(entity => {
                return 'projectId' in entity && entity.projectId !== principalProjectId
            })

            if (someEntityNotOwnedByCurrentProject) {
                verdict = 'DENY'
            }
        }

        if (verdict === 'DENY') {
            throw new ActivepiecesError({
                code: ErrorCode.AUTHORIZATION,
                params: {
                    message: 'not owned by current project',
                },
            })
        }
    }

    done()
}

function isObject<T>(obj: T): obj is Exclude<T, null | undefined> {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}


type SingleEntity = {
    projectId?: string
}

type MultipleEntities = {
    data: SingleEntity[]
}

type Payload = SingleEntity | MultipleEntities

type AuthzVerdict = 'ALLOW' | 'DENY'
