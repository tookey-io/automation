
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { askOpenRouterAction } from "./lib/actions/ask-open-router";
import { AuthenticationType, HttpMethod, HttpRequest, httpClient } from '@activepieces/pieces-common';

const markdownDescription = `
Follow these instructions to get your OpenAI API Key:

1. Visit the following website: https://openrouter.ai/keys.
2. Once on the website, click on create a key.
3. Once you have created a key, copy it and use it for the Api key field on the site.
`;
export const openRouterAuth = PieceAuth.SecretText({
    description: markdownDescription,
    displayName: 'Api Key',
    required: true,
    validate: async ({ auth }) => {
        // we send a get request to https://openrouter.ai/api/v1/auth/key with the key as a header
        // if the response is 200, then the key is valid
        // if the response is 401, then the key is invalid
        try {
            const request: HttpRequest = {
                url: 'https://openrouter.ai/api/v1/auth/key',
                method: HttpMethod.GET,
                authentication: {
                    type: AuthenticationType.BEARER_TOKEN,
                    token: auth,
                },
            };
            await httpClient.sendRequest(request);
            return {
                valid: true,
            };
        } catch (error) {
            return {
                valid: false,
                error: "Invalid API Key",
            };
        }
    }
});

export const openRouter = createPiece({
    displayName: "OpenRouter",
    auth: openRouterAuth,
    minimumSupportedRelease: '0.8.0',
    logoUrl: "https://cdn.activepieces.com/pieces/open-router.png",
    authors: ["Salem-Alaa"],
    actions: [ askOpenRouterAction ],
    triggers: [],
});
