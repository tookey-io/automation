import { ActionContext, PieceAuthProperty, Property, Validators, createAction } from "@activepieces/pieces-framework";
import { EPNAuth } from "../../index";
import { EPNCommon } from "../common";
import { createApi } from "../api";

export const TopupToBalance = createAction({
    auth: EPNAuth,
    requireAuth: true,
    name: "topup_to_balance",
    displayName: "Topup to amount",
    description: "Topup to desired balance",
    props: {
        desiredBalance: Property.Number({
            displayName: "Desired balance",
            description: "Difference between desired balance and current balance should be greater than 30 (minimum topup amount)",
            required: true,
            validators: [
                Validators.minValue(30),
                Validators.maxValue(1000000),
            ],
        }),
        currency: EPNCommon.topUpCurrency,
    },
    async run({ auth, propsValue: { desiredBalance, currency }}) {
        console.debug('run topup_to_balance in epn integration')
        const api = createApi(auth);

        const totalBalance = await api.accounts.getAll().then((accounts) => accounts.data.reduce((total, acc) => total + acc.balance, 0));
        const difference = desiredBalance - totalBalance;

        if (difference <= 0) {
            throw new Error("Total balance is greater than desired balance");
        }

        const topup = await api.topup(difference);

        const isBTC = currency === 'btc';

        return {
            amount: isBTC ? topup.data.payload.btc_sum : topup.data.payload.usdt_sum,
            wallet: isBTC ? topup.data.payload.btc : topup.data.payload.usdt,
        }
    }
})