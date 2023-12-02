import { FastifyRequest } from 'fastify'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { cert, initializeApp } from 'firebase-admin/app'
import { DecodedIdToken, getAuth } from 'firebase-admin/auth'
import * as crypto from 'crypto'
import { FirebaseSignInRequest, FirebaseSignUpRequest, Platform, PlatformId } from '@activepieces/ee-shared'
import { PrincipalType, ActivepiecesError, ErrorCode, UserStatus, isNil, UserId, Project, User } from '@activepieces/shared'
import { AuthenticationResponse } from '@activepieces/shared'
import { system } from '../../helper/system/system'
import { SystemProp } from '../../helper/system/system-prop'
import { userService } from '../../user/user-service'
import { accessTokenManager } from '../../authentication/lib/access-token-manager'
import { authenticationService } from '../../authentication/authentication-service'
import { logger } from '../../helper/logger'
import { referralService } from '../referrals/referral.service'
import { platformProjectService } from '../projects/platform-project-service'
import { platformService } from '../platform/platform.service'

const credential = system.get(SystemProp.FIREBASE_ADMIN_CREDENTIALS)
    ? cert(JSON.parse(system.getOrThrow(SystemProp.FIREBASE_ADMIN_CREDENTIALS)))
    : undefined

const firebaseAuth = credential
    ? getAuth(initializeApp({ credential }))
    : undefined

export const firebaseAuthenticationController: FastifyPluginAsyncTypebox = async (app) => {
    app.post(
        '/sign-in',
        {
            schema: {
                body: FirebaseSignInRequest,
            },
        },
        async (request: FastifyRequest<{ Body: FirebaseSignInRequest }>) => {
            try {
                const verifiedToken = await firebaseAuth!.verifyIdToken(request.body.token)
                const user = await getUser({ email: verifiedToken.email!, decodedToken: verifiedToken })
                await assertEmailIsVerified({ user })
                if (!isNil(user) && user.status !== UserStatus.INVITED) {
                    const project = await getProjectByUser(user.id)
                    const platform = await getPlatform(project.platformId)

                    const token = await accessTokenManager.generateToken({
                        id: user.id,
                        type: PrincipalType.USER,
                        projectId: project.id,
                        projectType: project.type,
                        platform: isNil(platform) ? undefined : {
                            id: platform.id,
                            role: platform.ownerId === user.id ? 'OWNER' : 'MEMBER',
                        },
                    })

                    const response: AuthenticationResponse = {
                        projectId: project.id,
                        token,
                        created: user.created,
                        email: user.email,
                        firstName: user.firstName,
                        id: user.id,
                        lastName: user.lastName,
                        newsLetter: user.newsLetter,
                        status: user.status,
                        trackEvents: user.trackEvents,
                        updated: user.updated,
                        platformId: user.platformId,
                    }

                    return response
                }
                else {
                    throw new ActivepiecesError({
                        code: ErrorCode.INVALID_CREDENTIALS,
                        params: { email: verifiedToken.email! },
                    })
                }
            }
            catch (e) {
                logger.error(e)
                throw new ActivepiecesError({
                    code: ErrorCode.INVALID_BEARER_TOKEN,
                    params: {},
                })
            }
        },
    )

    app.post(
        '/users',
        {
            schema: {
                body: FirebaseSignUpRequest,
            },
        },
        async (request: FastifyRequest<{ Body: FirebaseSignUpRequest }>) => {
            try {
                const verifiedToken = await firebaseAuth!.verifyIdToken(request.body.token)
                const user = await getUser({ email: verifiedToken.email!, decodedToken: verifiedToken })
                const referringUserId = request.body.referringUserId
                if (!isNil(user) && user.status !== UserStatus.INVITED) {
                    const project = await getProjectByUser(user.id)
                    const platform = await getPlatform(project.platformId)

                    const token = await accessTokenManager.generateToken({
                        id: user.id,
                        type: PrincipalType.USER,
                        projectId: project.id,
                        platform: isNil(platform) ? undefined : {
                            id: platform.id,
                            role: platform.ownerId === user.id ? 'OWNER' : 'MEMBER',
                        },
                        projectType: project.type,
                    })

                    const response: AuthenticationResponse = {
                        projectId: project.id,
                        token,
                        created: user.created,
                        email: user.email,
                        firstName: user.firstName,
                        id: user.id,
                        lastName: user.lastName,
                        newsLetter: user.newsLetter,
                        status: user.status,
                        trackEvents: user.trackEvents,
                        updated: user.updated,
                        platformId: user.platformId,
                    }

                    if (!isNil(referringUserId)) {
                        await referralService.upsert({
                            referringUserId,
                            referredUserId: user!.id,
                        })
                    }
                    return response
                }
                else {
                    const response = await authenticationService.signUp({
                        email: verifiedToken.email!,
                        trackEvents: true,
                        firstName: request.body.firstName,
                        lastName: request.body.lastName,
                        newsLetter: true,
                        password: crypto.randomBytes(32).toString('hex'),
                        status: UserStatus.INVITED,
                    })
                    if (!isNil(referringUserId)) {
                        await referralService.upsert({
                            referringUserId,
                            referredUserId: response.id,
                        })
                    }
                    return {
                        ...response,
                        token: undefined,
                    }
                }
            }
            catch (e) {
                logger.error(e)
                throw new ActivepiecesError({
                    code: ErrorCode.INVALID_BEARER_TOKEN,
                    params: {},
                })
            }
        },
    )

}

async function getUser({ decodedToken, email }: { decodedToken: DecodedIdToken, email: string }): Promise<User | null> {
    // TODO SEND PLATFORM ID AFTER FIREBASE MIGRATIION
    const user = await userService.getbyEmail({
        email,
    })

    if (decodedToken.email_verified && !isNil(user) && user.status === UserStatus.INVITED) {
        return userService.verify({ id: user.id })
    }

    if (!decodedToken.email_verified && user?.status === UserStatus.VERIFIED) {
        await firebaseAuth?.updateUser(decodedToken.uid, { emailVerified: true })
    }

    return user
}


async function assertEmailIsVerified({
    user,
}: { user: User | null }): Promise<void> {
    if (user?.status === UserStatus.INVITED) {
        throw new ActivepiecesError({
            code: ErrorCode.EMAIL_IS_NOT_VERFIED,
            params: { email: user.email },
        })
    }

}

const getProjectByUser = async (userId: UserId): Promise<Project> => {
    const userProjects = await platformProjectService.getAll({
        ownerId: userId,
    })

    return userProjects[0]
}

const getPlatform = async (platformId: PlatformId | undefined): Promise<Platform | null> => {
    if (isNil(platformId)) {
        return null
    }

    return platformService.getOne(platformId)
}
