
import { PieceAuth, createPiece } from "@activepieces/pieces-framework";
import { xeroCreateContact } from "./lib/actions/create-contact";
import { xeroCreateInvoice } from "./lib/actions/create-invoice";

export const xeroAuth = PieceAuth.OAuth2({
  description: `
  1. Log in to Xero
  2. Go to (Developer portal)[https://developer.xero.com/app/manage/]
  3. Click on the App you want to integrate
  4. On the left, click on \`Configuration\`
  5. Enter your \`redirect url\`
  6. Copy the \`Client Id\` and \`Client Secret\`
  `,
  
  authUrl: "https://login.xero.com/identity/connect/authorize",
  tokenUrl: "https://identity.xero.com/connect/token",
  required: true,
  scope: [
    'accounting.contacts',
    'accounting.transactions'
  ]
})

export const xero = createPiece({
  displayName: "Xero",
      minimumSupportedRelease: '0.5.0',
    logoUrl: "https://cdn.activepieces.com/pieces/xero.png",
  authors: ['kanarelo'],
  auth: xeroAuth,
  actions: [xeroCreateContact, xeroCreateInvoice],
  triggers: [],
});
