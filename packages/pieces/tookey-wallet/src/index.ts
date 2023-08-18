
import { PieceAuth, Property, createPiece } from "@activepieces/pieces-framework";
import { signRequest } from "./lib/actions/sign-request";
import { fetchKeys } from "./lib/actions/fetch-keys";

export const TookeyAuth = PieceAuth.CustomAuth({
  displayName: 'Tookey Connection',
  description: `
  To obtain your Tookey token, follow these steps:

  1. Open your telegram bot or official https://t.me/tookey_bot
  2. Send \`/auth\` command to the bot
  3. Click on the auth in authomation button
`,
  required: true,
  props: {
    token: PieceAuth.SecretText({
      displayName: 'Token',
      description: 'The token of the APITable account',
      required: true,
    }),
    backendUrl: Property.ShortText({
      displayName: 'Tookey Backend Url',
      description: 'The url of the tookey infrastructure instance',
      required: true,
    }),
  }
});

export const tookeyWallet = createPiece({
  tags: ["tookey", "web3"],
  displayName: "Tookey Wallets",
  description: "Tookey Wallets",
  logoUrl: "https://tookey.io/images/logo-yellow-2k.png",
  authors: ['aler-denisov'],
  minimumSupportedRelease: '0.5.0',
  auth: TookeyAuth,
  actions: [fetchKeys, signRequest],
  triggers: [],
});