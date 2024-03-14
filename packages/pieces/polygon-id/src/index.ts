import {
  createPiece,
  PieceAuth,
  Validators
} from '@activepieces/pieces-framework';
import { testAction } from './lib/actions/testAction';
import { allRecords } from './lib/actions/allRecords';
import { issueCredential } from './lib/actions/issueCredential';
import { offer } from './lib/actions/offer';
import { iden3callback } from './lib/triggers/iden3callback';
import { requestCredential } from './lib/actions/requestCredential';
import { requestAuth } from './lib/actions/requestAuth';
import { waitForProof } from './lib/actions/waitForProof';
import { waitForClaim } from './lib/actions/waitForClaim';

export const PolygonIdAuth = PieceAuth.CustomAuth({
    required: true,
    props: {
        seed: PieceAuth.SecretText({
            displayName: 'Seed (32 bytes)',
            description: 'The seed to generate BJJ private key',
            required: true,
            validators: [Validators.pattern(/^(0x)?[0-9a-fA-F]{64}$/)],
        }),
    },
});

export const polygonId = createPiece({
    displayName: 'Polygon ID',
    auth: PolygonIdAuth,
    minimumSupportedRelease: '0.9.0',
    logoUrl: 'https://raw.githubusercontent.com/tookey-io/icons/main/piece-polygon-id.png',
    authors: ['aler-denisov'],
    actions: [testAction, allRecords, issueCredential, requestAuth, requestCredential, waitForProof, offer, waitForClaim],
    triggers: [iden3callback],
});
