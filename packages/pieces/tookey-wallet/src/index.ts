
import { createPiece } from "@activepieces/pieces-framework";
import packageJson from "../package.json";
import { signRequest } from "./lib/actions/sign-request";

export const tookeyWallet = createPiece({
  name: "tookey-wallet",
  displayName: "Tookey Wallets",
  logoUrl: "https://tookey.io/images/logo-yellow-2k.png",
  version: packageJson.version,
  authors: ['aler-denisov'],
  actions: [signRequest],
  triggers: [],
});
