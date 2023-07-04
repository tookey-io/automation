
import { createPiece } from "@activepieces/pieces-framework";
import packageJson from "../package.json";
import { signRequest } from "./lib/actions/sign-request";
import { fetchKeys } from "./lib/actions/fetchKeys";

export const tookeyWallet = createPiece({
  tags: ["tookey", "web3"],
  displayName: "Tookey Wallets",
  logoUrl: "https://tookey.io/images/logo-yellow-2k.png",
  authors: ['aler-denisov'],
  actions: [fetchKeys, signRequest],
  triggers: [],
});
