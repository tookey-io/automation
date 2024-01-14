import {
    PiecePropValueSchema,
    Property,
    TriggerStrategy,
    createTrigger,
} from '@activepieces/pieces-framework';
import {
    DedupeStrategy,
    HttpMethod,
    HttpRequest,
    Polling,
    httpClient,
    pollingHelper,
} from '@activepieces/pieces-common';
import { EPNAuth } from '../../index';
import { EPN_API_URL } from '../../constants';

const polling: Polling<PiecePropValueSchema<typeof EPNAuth>, {}> = {
    strategy: DedupeStrategy.LAST_ITEM,
    items: async ({ store, auth }) => {
        // TODO: pagination
        const request: HttpRequest = {
            method: HttpMethod.GET,
            url: `${EPN_API_URL}/cards`,
            headers: {
                "Authorization": "Bearer " + auth,
            }
        };
        const response = httpClient.sendRequest<{}>(request)
        throw new Error('Not implemented');
    },
};

export const BalanceLowerThan = createTrigger({
    auth: EPNAuth,
    name: 'balance_lower_than',
    displayName: 'Balance lower than',
    description: 'Triggers when account balance is lower than specified value',
    type: TriggerStrategy.POLLING,
    props: {
        threshold: Property.Number({
            displayName: 'Threshold',
            description: 'Threshold value',
            required: true,
        })
    },
    async test(context) {
        return await pollingHelper.test(polling, {
            store: context.store,
            auth: context.auth,
            propsValue: {},
        });
    },
    async onEnable(context) {
        await pollingHelper.onEnable(polling, {
            store: context.store,
            auth: context.auth,
            propsValue: {},
        });
    },
    async onDisable(context) {
        await pollingHelper.onDisable(polling, {
            store: context.store,
            auth: context.auth,
            propsValue: {},
        });
    },
    async run(context) {
        return await pollingHelper.poll(polling, {
            store: context.store,
            auth: context.auth,
            propsValue: {},
        });
    },
    sampleData: undefined,
});
