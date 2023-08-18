import { PieceAuth, createPiece } from "@activepieces/pieces-framework";
import { newLead } from "./lib/triggers/new-lead";

export const facebookLeadsAuth = PieceAuth.OAuth2({
    
    description: '',
    authUrl: "https://graph.facebook.com/oauth/authorize",
    tokenUrl: "https://graph.facebook.com/oauth/access_token",
    required: true,
    scope: ['pages_show_list', 'pages_manage_ads', 'leads_retrieval', 'pages_manage_metadata'],
})

export const facebookLeads = createPiece({
    displayName: "Facebook Leads",
        minimumSupportedRelease: '0.5.0',
    logoUrl: "https://cdn.activepieces.com/pieces/facebook.png",
    authors: ['MoShizzle'],
    auth: facebookLeadsAuth,
    actions: [],
    triggers: [newLead],
    events: {
        parseAndReply: (context) => {
            const payload = context.payload;
            if (payload.queryParams['hub.verify_token'] == 'activepieces') {
                return {
                    reply: {
                        body: payload.queryParams['hub.challenge'],
                        headers: {}
                    }
                };
            }
            return { event: 'lead', identifierValue: payload.body.entry[0].changes[0].value.page_id }
        },
        verify: () => {
            // TODO IMPLEMENT VALIDATION AFTER APP VERIFICATION
            return true;
        }
    }
});
