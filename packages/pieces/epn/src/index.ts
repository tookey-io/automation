
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { BalanceLowerThan } from "./lib/trigger/balanceLowerThan";
import { BalanceChange } from "./lib/trigger/balanceChange";
import { CardIssued } from "./lib/trigger/cardIssued";
import { TopupToBalance } from "./lib/action/topupToBalance";
import { IssueCard } from "./lib/action/issueCard";

export const EPNAuth = PieceAuth.SecretText({
  displayName: "EPN Token",
  required: true,
  description: `
  To obtain your access token, follow these steps:

  1. Log in to your EPN.net account.
  2. Switch to old design.
  3. Go to Settings.
  4. Press 'Copy token' button for Chrome EPN extension box.
  `,
});

export const epn = createPiece({
  displayName: "EPN",
  auth: EPNAuth,
  minimumSupportedRelease: '0.7.1',
  logoUrl: "https://raw.githubusercontent.com/tookey-io/icons/main/piece-epn.png",
  authors: ["Aler Denisov"],
  actions: [TopupToBalance, IssueCard],
  triggers: [BalanceLowerThan, BalanceChange, CardIssued],
});
