import { ApFlagId, isNil } from '@activepieces/shared'
import { FlagsServiceHooks } from '../../flags/flags.hooks'
import { apperanceHelper } from '../helper/apperance-helper'
import { platformService } from '../platform/platform.service'
import { ThirdPartyAuthnProviderEnum } from '@activepieces/ee-shared'
import { resolvePlatformIdForRequest } from '../platform/lib/platform-utils'

export const enterpriseFlagsHooks: FlagsServiceHooks = {
    async modify({ flags, request }) {
        const modifiedFlags = { ...flags }
        const hostname = request.hostname
        const platformId = await resolvePlatformIdForRequest(request)
        const platformEnabled = !isNil(platformId)
        if (platformEnabled) {
            const platform = await platformService.getOneOrThrow(platformId)
            modifiedFlags[ApFlagId.THEME] = await apperanceHelper.getTheme({ platformId })
            modifiedFlags[ApFlagId.SHOW_COMMUNITY] = false
            modifiedFlags[ApFlagId.SHOW_DOCS] = false
            modifiedFlags[ApFlagId.SHOW_BILLING] = false
            modifiedFlags[ApFlagId.THIRD_PARTY_AUTH_PROVIDERS_TO_SHOW_MAP] = {
                [ThirdPartyAuthnProviderEnum.GOOGLE]: false,
                [ThirdPartyAuthnProviderEnum.GITHUB]: false,
            }
            modifiedFlags[ApFlagId.SHOW_BLOG_GUIDE] = false
            modifiedFlags[ApFlagId.SHOW_COMMUNITY_PIECES] = false
            modifiedFlags[ApFlagId.SHOW_POWERED_BY_AP] = platform.showPoweredBy
            modifiedFlags[ApFlagId.CLOUD_AUTH_ENABLED] = platform.cloudAuthEnabled
            modifiedFlags[ApFlagId.FRONTEND_URL] = `https://${hostname}`
            modifiedFlags[ApFlagId.WEBHOOK_URL_PREFIX] = `https://${hostname}/api/v1/webhooks`
            modifiedFlags[ApFlagId.THIRD_PARTY_AUTH_PROVIDER_REDIRECT_URL] = `https://${hostname}/redirect`
            modifiedFlags[ApFlagId.PRIVACY_POLICY_URL] = platform.privacyPolicyUrl
            modifiedFlags[ApFlagId.TERMS_OF_SERVICE_URL] = platform.termsOfServiceUrl
            modifiedFlags[ApFlagId.TEMPLATES_SOURCE_URL] = null
            modifiedFlags[ApFlagId.CHATBOT_ENABLED] = false
            modifiedFlags[ApFlagId.OWN_AUTH2_ENABLED] = false
        }
        return modifiedFlags
    },
}
