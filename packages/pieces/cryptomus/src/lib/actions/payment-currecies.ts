import { ActionContext, PieceAuthProperty, createAction } from "@activepieces/pieces-framework";
import { CryptomusAuth } from "../auth";
import { CryptomusApi } from "../common";

export const cryptomusGetPaymentCurrencies = createAction({
    name: "payment_currencies",
    displayName: "Get Payment Currencies",
    description: "Returns list of supported currencies",
    auth: CryptomusAuth,
    requireAuth: true,
    props: {},
    async run(ctx) {
        return CryptomusApi.createRequest(ctx.auth, 'payment_services', undefined)
    },
})