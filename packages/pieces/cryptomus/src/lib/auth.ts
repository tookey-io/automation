import { PieceAuth, Property } from '@activepieces/pieces-framework';

const CryptomusAuthDescription = `
You need to release a different API key for accepting payment and making payouts. We're using only ACCEPTING payments key. 

Go to [Official Documentation](https://doc.cryptomus.com/getting-started/getting-api-keys) to know how to issue payments key.
`;

export const CryptomusAuth = PieceAuth.CustomAuth({
    description: CryptomusAuthDescription,
    props: {
        merchant: Property.ShortText({
            displayName: 'Merchant',
            description: 'Your merchant ID',
            required: true,
        }),
        apiKey: PieceAuth.SecretText({
            displayName: 'API Key',
            required: true,
        })
    },
    required: true
});
