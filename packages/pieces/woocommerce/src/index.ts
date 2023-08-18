import { PieceAuth, Property, createPiece } from "@activepieces/pieces-framework";

import { customer } from "./lib/triggers/customer";
import { coupon } from "./lib/triggers/coupon";
import { order } from "./lib/triggers/order";
import { product } from "./lib/triggers/product";
import { lineItemInOrder } from "./lib/triggers/line-item-in-order";

const authDescription = `
To generate your API credentials, follow the steps below:
1. Go to WooCommerce -> Settings -> Advanced tab -> REST API.
2. Click on Add Key to create a new key.
3. Enter the key description and change the permissions to Read/Write.
4. Click Generate Key.
5. Copy the Consumer Key and Consumer Secret into the fields below. You will not be able to view the Consumer Secret after exiting the page.

Note that the base URL of your WooCommerce instance needs to be on a secure (HTTPS) connection, or the piece will not work even on local instances on the same device.
`;

export const wooAuth = PieceAuth.CustomAuth({
    
    description: authDescription,
    required: true,
    props: {
        baseUrl: Property.ShortText({
            displayName: 'Base URL',
            description: 'The base URL of your app (e.g https://mystore.com) and it should start with HTTPS only',
            required: true,
        }),
        consumerKey: Property.ShortText({
            displayName: 'Consumer Key',
            description: 'The consumer key generated from your app',
            required: true,
        }),
        consumerSecret: PieceAuth.SecretText({
            displayName: 'Consumer Secret',
            description: 'The consumer secret generated from your app',
            required: true,
        })
    },
    async validate( {auth}) {
        const baseUrl = auth.baseUrl;
        if (!baseUrl.match(/^(https):\/\//)) {
            return { valid: false, error: 'Base URL must start with https (e.g https://mystore.com)' }
        }
        return { valid: true}
    }
})

export const woocommerce = createPiece({
    displayName: "WooCommerce",
    logoUrl: "https://cdn.activepieces.com/pieces/woocommerce.png",
    auth: wooAuth,
    minimumSupportedRelease: '0.7.1',
    authors: ['MoShizzle'],
    actions: [],
    triggers: [customer, coupon, order, product, lineItemInOrder],
});
