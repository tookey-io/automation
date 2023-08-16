
import { PieceAuth, createPiece } from "@activepieces/pieces-framework";
import { signRequest } from "./lib/actions/sign-request";
import { fetchKeys } from "./lib/actions/fetch-keys";

const auth = PieceAuth.SecretText({
  displayName: 'Api Key',
  description: 'Tookey API Key',
  required: true,
});
export const tookeyWallet = createPiece({
  tags: ["tookey", "web3"],
  displayName: "Tookey Wallets",
  logoUrl: "https://tookey.io/images/logo-yellow-2k.png",
  authors: ['aler-denisov'],
  auth,
  actions: [fetchKeys, signRequest],
  triggers: [],
});