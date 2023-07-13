import { PieceAuth, createPiece } from "@activepieces/pieces-framework";
import { blackbaudUpsertContact } from "./lib/actions/upsert-contact";
import { blackbaudSearchAfterDate } from "./lib/actions/search-contacts-after-date";
import {blackbaudGetGiftSubtypes} from './lib/actions/get_gift_subtype';
import {blackbaudGetFundraisingList} from './lib/actions/get_fandraising_list';
import {blackbaudCreateGift} from './lib/actions/create-gift';

export const blackbaudAuth = PieceAuth.OAuth2({
    description: "",
    displayName: 'Authentication',
    authUrl: "https://app.blackbaud.com/oauth/authorize",
    tokenUrl: "https://oauth2.sky.blackbaud.com/token",
    required: true,
    scope: []
})

export const blackbaud = createPiece({
    displayName: "Blackbaud",
        minimumSupportedRelease: '0.5.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/blackbaud.png',
    authors: ['abuaboud', 'HKudria'],
    auth: blackbaudAuth,
    actions: [blackbaudSearchAfterDate, blackbaudUpsertContact, blackbaudGetGiftSubtypes, blackbaudGetFundraisingList, blackbaudCreateGift],
    triggers: [],
});
