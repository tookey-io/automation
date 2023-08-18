import { PieceAuth, createPiece } from '@activepieces/pieces-framework'
import crypto from 'crypto'
import { triggers } from './lib/triggers';

export const squareAuth = PieceAuth.OAuth2({
  description: 'Authentication',
  authUrl: 'https://connect.squareup.com/oauth2/authorize',
  tokenUrl: 'https://connect.squareup.com/oauth2/token',
  required: true,
  scope: [
    'MERCHANT_PROFILE_READ',
    'CUSTOMERS_READ',
    'CUSTOMERS_WRITE',
    'ITEMS_READ',
    'ITEMS_WRITE',
    'ORDERS_READ',
    'ORDERS_WRITE',
    'PAYMENTS_READ',
    'INVOICES_READ',
    'APPOINTMENTS_READ',
    'APPOINTMENTS_WRITE',
  ]
})

export const square = createPiece({
  displayName: 'square',
      minimumSupportedRelease: '0.5.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/square.png',
  authors: [
    "abuaboud"
  ],
  auth: squareAuth,
  events: {
    verify: ({ webhookSecret, payload, appWebhookUrl }) => {
      const signature = payload.headers['x-square-hmacsha256-signature'];
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(appWebhookUrl + payload.rawBody);
      const hash = hmac.digest('base64');
      return hash === signature;
    },
    parseAndReply: ({ payload }) => {
      return { event: payload.body?.type, identifierValue: payload.body.merchant_id }
    }
  },
  actions: [
  ],
  triggers,
});
