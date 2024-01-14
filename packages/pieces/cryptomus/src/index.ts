import { createPiece } from '@activepieces/pieces-framework';
import { CryptomusAuth } from './lib/auth';
import { cryptomusCreatePaymentAction } from './lib/actions/create-payment';
import { cryptomusGetPaymentCurrencies } from './lib/actions/payment-currecies';
import { cryptomusGetPaymentsHistory } from './lib/actions/payments-history';
import { cryptomusPaymentTrigger } from './lib/triggers/payment-trigger';

export const cryptomus = createPiece({
    displayName: 'Cryptomus',
    auth: CryptomusAuth,
    minimumSupportedRelease: '0.9.0',
    logoUrl: 'https://raw.githubusercontent.com/tookey-io/icons/main/piece-cryptomus.png',
    authors: ["Aler Denisov"],
    actions: [cryptomusCreatePaymentAction, cryptomusGetPaymentsHistory, cryptomusGetPaymentCurrencies],
    triggers: [cryptomusPaymentTrigger],
});
