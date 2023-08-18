import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { calendlyInviteeCanceled } from './lib/trigger/invitee-canceled.trigger';
import { calendlyInviteeCreated } from './lib/trigger/invitee-created.trigger';
import { calendlyCommon } from './lib/common';

const markdown = `
## Obtain your Calendly Personal Token
1. Go to https://calendly.com/integrations/api_webhooks
2. Click on "Create New Token"
3. Copy the token and paste it in the field below
`;
export const calendlyAuth = PieceAuth.SecretText({
  displayName: 'Personal Token',
  required: true,
  description: markdown,
  validate: async ({auth}) => {
    try {
      const user = calendlyCommon.getUser(auth);
      return {
        valid: true
      };
    } catch (e) {
      return {
        valid: false,
        error: 'Connection failed. Please check your token and try again.'
      };
    }
  }
});

export const calendly = createPiece({
  displayName: 'Calendly',
  minimumSupportedRelease: '0.5.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/calendly.png',
  authors: ['AbdulTheActivePiecer'],
  auth: calendlyAuth,
  actions: [],
  triggers: [calendlyInviteeCreated, calendlyInviteeCanceled]
});
