
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { createList } from "./lib/actions/create-list";
import { unsubscribe } from "./lib/actions/unsubscribe-contact";
import { createContact } from "./lib/actions/create-contact";
export const sendfoxAuth = PieceAuth.SecretText({
    displayName: 'API Key',
    description:"To obtain your personal token, follow these steps:\n1. Log in to your SendFox account.\n2. Visit https://sendfox.com/account/oauth to create one\n3. From OAuth Apps click on Create New Token.\n4. Enter any name you want then click create.\n5. Copy and paste your token here.",
    required: true,
});

export const sendfox = createPiece({
  displayName: "Sendfox",
  auth: sendfoxAuth,
  minimumSupportedRelease: '0.7.1',
  logoUrl: "https://cdn.activepieces.com/pieces/sendfox.png",
  authors: ["Salem-Alaa"],
  actions: [ createList , unsubscribe , createContact ],
  triggers: [],
});