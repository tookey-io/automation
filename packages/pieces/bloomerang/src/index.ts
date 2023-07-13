import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { bloomerangCreateTransaction } from './lib/actions/create-transaction';
import { bloomerangGetContacts } from './lib/actions/get-contacts';
import { bloomerangGetTransactionStuff } from './lib/actions/get-transaction-stuff';
import {bloomerangUpsertContactsDuplicates} from './lib/actions/upsert-contact_duplicates';
import {bloomerangUpsertContactsSearch} from './lib/actions/upsert-contact_search';

export const bloomerangAuth = PieceAuth.SecretText({
  displayName: "API Key",
  required: true,
  description: "API key acquired from your Bloomerang crm"
})

export const bloomerang = createPiece({
  displayName: 'Bloomerang',
      minimumSupportedRelease: '0.5.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/bloomerang.png',
  authors: ['HKudria'],
  auth: bloomerangAuth,
  actions: [
    bloomerangUpsertContactsDuplicates,
    bloomerangUpsertContactsSearch,
    bloomerangCreateTransaction,
    bloomerangGetContacts,
    bloomerangGetTransactionStuff,
  ],
  triggers: [],
});
