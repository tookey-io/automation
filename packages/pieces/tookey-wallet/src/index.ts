
import { createPiece } from "@activepieces/pieces-framework";
import packageJson from "../package.json";
import { signRequest } from "./lib/actions/sign-request";
import { auth } from "./lib/actions/auth";
import { fetchKeys } from "./lib/actions/fetchKeys";

export const tookeyWallet = createPiece({
  name: "tookey-wallet",
  tags: ["tookey", "web3"],
  displayName: "Tookey Wallets",
  logoUrl: "https://tookey.io/images/logo-yellow-2k.png",
  version: packageJson.version,
  authors: ['aler-denisov'],
  actions: [auth, fetchKeys, signRequest],
  triggers: [],
});
