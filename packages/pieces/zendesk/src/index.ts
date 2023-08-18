
import { PieceAuth, Property, createPiece } from '@activepieces/pieces-framework';
import { newTicketInView } from './lib/trigger/new-ticket-in-view';

const markdownProperty = `
**Organization**: The organization name can be found in the URL (e.g https://ORGANIZATION_NAME.zendesk.com).

**Agent Email**: The email you use to log in to Zendesk.

**API Token**: You can find this in the Zendesk Admin Panel under Settings > APIs > Zendesk API.
`

export const zendeskAuth = PieceAuth.CustomAuth({
  
  description: markdownProperty,
  props: {
      email: Property.ShortText({
          displayName: 'Agent Email',
          description: 'The email address you use to login to Zendesk',
          required: true,
      }),
      token: Property.ShortText({
          displayName: 'Token',
          description: 'The API token you can generate in Zendesk',
          required: true,
      }),
      subdomain: Property.ShortText({
          displayName: 'Organization (e.g activepieceshelp)',
          description: 'The subdomain of your Zendesk instance',
          required: true,
      }),
  },
  required: true,
})

export const zendesk = createPiece({
  displayName: 'Zendesk',
      minimumSupportedRelease: '0.5.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/zendesk.png',
  authors: [
    "abuaboud"
  ],
  auth: zendeskAuth,
  actions: [
  ],
  triggers: [
    newTicketInView
  ],
});
