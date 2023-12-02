import { ActivepiecesError, AuthenticationResponse, ErrorCode, UserStatus, isNil } from '@activepieces/shared'
import { AuthnProvider } from './authn-provider'
import { authenticationService } from '../../../../authentication/authentication-service'
import { system } from '../../../../helper/system/system'
import { SystemProp } from '../../../../helper/system/system-prop'

function getClientId(): string {
    return system.getOrThrow(SystemProp.FEDERATED_AUTHN_GITHUB_CLIENT_ID)
}
  
function getClientSecret(): string {
    return system.getOrThrow(SystemProp.FEDERATED_AUTHN_GITHUB_CLIENT_SECRET)
}
  
function getRedirectUri(): string {
    return system.getOrThrow(SystemProp.FEDERATED_AUTHN_GITHUB_REDIRECT_URI)
}

export const gitHubAuthnProvider: AuthnProvider = {
    async getLoginUrl(): Promise<string> {
        const loginUrl = new URL('https://github.com/login/oauth/authorize')
        loginUrl.searchParams.set('client_id', getClientId())
        loginUrl.searchParams.set('redirect_uri', getRedirectUri())
        return loginUrl.href
    },

    async authenticate(authorizationCode): Promise<AuthenticationResponse> {
        const githubAccessToken = await getGitHubAccessToken(authorizationCode)
        const gitHubUserInfo = await getGitHubUserInfo(githubAccessToken)
        return authenticateUser(gitHubUserInfo)
    },
}

const getGitHubAccessToken = async (authorizationCode: string): Promise<string> => {
    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: getClientId(),
            client_secret: getClientSecret(),
            code: authorizationCode,
            redirect_uri: getRedirectUri(),
        }),
    })

    if (!response.ok) {
        throw new ActivepiecesError({
            code: ErrorCode.INVALID_CREDENTIALS,
            params: {},
        })
    }

    const responseFormData = await response.formData()
    const accessToken = responseFormData.get('access_token')?.toString()

    if (isNil(accessToken)) {
        throw new ActivepiecesError({
            code: ErrorCode.INVALID_CREDENTIALS,
            params: {},
        })
    }

    return accessToken
}

const getGitHubUserInfo = async (gitHubAccessToken: string): Promise<GitHubUserInfo> => {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `token ${gitHubAccessToken}`,
            'X-GitHub-Api-Version': '2022-11-28',
        },
    })

    if (!response.ok) {
        throw new ActivepiecesError({
            code: ErrorCode.INVALID_CREDENTIALS,
            params: {},
        })
    }

    return response.json()
}

const authenticateUser = async (gitHubUserInfo: GitHubUserInfo): Promise<AuthenticationResponse> => {
    return authenticationService.federatedAuthn({
        email: gitHubUserInfo.email,
        userStatus: UserStatus.VERIFIED,
        firstName: gitHubUserInfo.name,
        lastName: '',
        platformId: null,
    })
}

type GitHubUserInfo = {
    name: string
    email: string
}
