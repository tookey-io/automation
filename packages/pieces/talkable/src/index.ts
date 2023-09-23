import {
  createPiece,
  PieceAuth,
  Property,
} from '@activepieces/pieces-framework';
import {
  findPerson,
  findCoupon,
  updatePerson,
  anonymizePerson,
  unsubscribePerson,
  createPurchase,
  createPurchasesBatch,
  createEvent,
  createEventsBatch,
  refund,
  getLoyaltyRedeemActions,
  updateReferralStatus,
} from './lib/actions';

const markdownDescription = `
Follow these steps:

1. **Log in to your Talkable account:** Open Talkable https://www.talkable.com/login.

2. **Enter the Talkable site slug and API key:** Go to **All site Settings** > **API Settings**, and copy Site ID and API key.

`;

export const talkableAuth = PieceAuth.CustomAuth({
  description: markdownDescription,
  props: {
    site: Property.ShortText({
      displayName: 'Talkable site ID',
      required: true,
    }),
    api_key: Property.ShortText({
      displayName: 'API key',
      required: true,
    }),
  },
  required: true,
});

export const talkable = createPiece({
  displayName: 'Talkable',
  auth: talkableAuth,
  minimumSupportedRelease: '0.7.1',
  logoUrl:
    'https://www.talkable.com/wp-content/uploads/2021/12/talkable-favicon.svg',
  authors: ['vitalini'],
  actions: [
    findPerson,
    findCoupon,
    updatePerson,
    anonymizePerson,
    unsubscribePerson,
    createPurchase,
    createPurchasesBatch,
    createEvent,
    createEventsBatch,
    refund,
    getLoyaltyRedeemActions,
    updateReferralStatus,
  ],
  triggers: [],
});
