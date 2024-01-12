import { ActivepiecesError, ApEnvironment, ApFlagId, AuthenticationResponse, ErrorCode, ExternalServiceAuthRequest, PrincipalType, Project, TelemetryEventName, User, UserId, UserStatus, isNil } from '@activepieces/shared'
import { QueryFailedError } from 'typeorm'
import { flagService } from '../../flags/flag.service'
import { generateRandomPassword } from '../../helper/crypto'
import { logger } from '../../helper/logger'
import { system } from '../../helper/system/system'
import { SystemProp } from '../../helper/system/system-prop'
import { telemetry } from '../../helper/telemetry.utils'
import { userService } from '../../user/user-service'
import { accessTokenManager } from '../lib/access-token-manager'
import { passwordHasher } from '../lib/password-hasher'
import { authenticationServiceHooks as hooks } from './hooks'

const SIGN_UP_ENABLED = system.getBoolean(SystemProp.SIGN_UP_ENABLED) ?? false

export const authenticationService = {
    externalServiceAuth: async (request: ExternalServiceAuthRequest): Promise<{ token: string }> => {
        const passwordMatches = await passwordHasher.compare(request.password, system.getOrThrow(SystemProp.EXTERNAL_PASSWORD))
        if (!passwordMatches) {
            throw new ActivepiecesError({
                code: ErrorCode.INVALID_CREDENTIALS,
                params: null,
            })
        }

        const token = await accessTokenManager.generateToken({
            id: 'EXTERNAL',
            type: PrincipalType.EXTERNAL,
            projectId: 'EXTERNAL',
        })

        return { token }
    },
    async signUp(params: SignUpParams): Promise<AuthenticationResponse> {
        if (!params.skipAsserting)
            await assertSignUpIsEnabled()

        await hooks.get().preSignUp({
            email: params.email,
            platformId: params.platformId,
        })
        const user = await createUser(params)

        return this.signUpResponse({
            user,
            referringUserId: params.referringUserId,
        })
    },

    async signIn(request: SignInParams): Promise<AuthenticationResponse> {
        const user = await userService.getByPlatformAndEmail({
            platformId: request.platformId,
            email: request.email,
        })

        assertUserIsAllowedToSignIn(user)

        await assertPasswordMatches({
            requestPassword: request.password,
            userPassword: user.password,
        })


        return this.signInResponse({
            user,
        })
    },

    async federatedAuthn(params: FederatedAuthnParams): Promise<AuthenticationResponse> {
        const existingUser = await userService.getByPlatformAndEmail({
            platformId: params.platformId,
            email: params.email,
        })

        if (existingUser) {
            return this.signInResponse({
                user: existingUser,
            })
        }

        return this.signUp({
            email: params.email,
            status: params.userStatus,
            firstName: params.firstName,
            lastName: params.lastName,
            trackEvents: true,
            newsLetter: true,
            password: await generateRandomPassword(),
            platformId: params.platformId,
            skipAsserting: params.skipAsseting,
        })
    },

    async signUpResponse({ user, referringUserId }: SignUpResponseParams): Promise<AuthenticationResponse> {
        const authnResponse = await hooks.get().postSignUp({
            user,
            referringUserId,
        })
        await flagService.save({ id: ApFlagId.USER_CREATED, value: true })

        const userWithoutPassword = removePasswordPropFromUser(authnResponse.user)

        await sendTelemetry({
            user, project: authnResponse.project,
        })
        await saveNewsLetterSubscriber(user)

        return {
            ...userWithoutPassword,
            token: authnResponse.token,
            projectId: authnResponse.project.id,
        }
    },

    async signInResponse({ user }: SignInResponseParams): Promise<AuthenticationResponse> {
        const authnResponse = await hooks.get().postSignIn({
            user,
        })

        const userWithoutPassword = removePasswordPropFromUser(authnResponse.user)

        return {
            ...userWithoutPassword,
            token: authnResponse.token,
            projectId: authnResponse.project.id,
        }
    },
}

    const assertSignUpIsEnabled = async (): Promise<void> => {
    const userCreated = await flagService.getOne(ApFlagId.USER_CREATED)

    if (userCreated && !SIGN_UP_ENABLED) {
        throw new ActivepiecesError({
            code: ErrorCode.SIGN_UP_DISABLED,
            params: {},
        })
    }

}

const createUser = async (params: SignUpParams): Promise<User> => {
    try {
        const newUser: NewUser = {
            email: params.email,
            status: params.status,
            firstName: params.firstName,
            lastName: params.lastName,
            trackEvents: params.trackEvents,
            newsLetter: params.newsLetter,
            password: params.password,
            platformId: params.platformId,
        }

        return await userService.create(newUser)
    }
    catch (e: unknown) {
        if (e instanceof QueryFailedError) {
            throw new ActivepiecesError({
                code: ErrorCode.EXISTING_USER,
                params: {
                    email: params.email,
                    platformId: params.platformId,
                },
            })
        }

        throw e
    }
}

const assertUserIsAllowedToSignIn: (user: User | null) => asserts user is User = (user) => {
    if (isNil(user)) {
        throw new ActivepiecesError({
            code: ErrorCode.INVALID_CREDENTIALS,
            params: null,
        })
    }

    if (user.status !== UserStatus.VERIFIED) {
        throw new ActivepiecesError({
            code: ErrorCode.EMAIL_IS_NOT_VERIFIED,
            params: {
                email: user.email,
            },
        })
    }
}

const assertPasswordMatches = async ({ requestPassword, userPassword }: AssertPasswordsMatchParams): Promise<void> => {
    const passwordMatches = await passwordHasher.compare(requestPassword, userPassword)

    if (!passwordMatches) {
        throw new ActivepiecesError({
            code: ErrorCode.INVALID_CREDENTIALS,
            params: null,
        })
    }
}

const removePasswordPropFromUser = (user: User): Omit<User, 'password'> => {
    const { password: _, ...filteredUser } = user
    return filteredUser
}

const sendTelemetry = async ({ user, project }: SendTelemetryParams): Promise<void> => {
    try {
        await telemetry.identify(user, project.id)

        await telemetry.trackProject(project.id, {
            name: TelemetryEventName.SIGNED_UP,
            payload: {
                userId: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                projectId: project.id,
            },
        })
    }
    catch (e) {
        logger.warn({ name: 'AuthenticationService#sendTelemetry', error: e })
    }
}

async function saveNewsLetterSubscriber(user: User): Promise<void> {
    const isPlatformUserOrNotSubscribed = !isNil(user.platformId) || !user.newsLetter
    const environment = system.get(SystemProp.ENVIRONMENT)
    if (isPlatformUserOrNotSubscribed || environment !== ApEnvironment.PRODUCTION) {
        return
    }
    try {
        const response = await fetch('https://us-central1-activepieces-b3803.cloudfunctions.net/addContact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
        })
        return await response.json()
    }
    catch (error) {
        logger.warn(error)
    }
}
type SendTelemetryParams = {
    user: User
    project: Project
}



type NewUser = Omit<User, 'id' | 'created' | 'updated'>

type SignUpParams = {
    email: string
    password: string
    firstName: string
    lastName: string
    trackEvents: boolean
    newsLetter: boolean
    status: UserStatus
    platformId: string | null
    referringUserId?: string
    skipAsserting?: boolean
}

type SignInParams = {
    email: string
    password: string
    platformId: string | null
}

type AssertPasswordsMatchParams = {
    requestPassword: string
    userPassword: string
}

type FederatedAuthnParams = {
    email: string
    userStatus: UserStatus
    firstName: string
    lastName: string
    platformId: string | null
    skipAsseting?: boolean
}

type SignUpResponseParams = {
    user: User
    referringUserId?: UserId
}

type SignInResponseParams = {
    user: User
}
