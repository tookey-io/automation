import { byteEncoder } from '@0xpolygonid/js-sdk';
import {
    createTrigger, StoreScope,
    TriggerStrategy
} from '@activepieces/pieces-framework';
import { Token } from '@iden3/js-jwz';
import authV2verification from '../../circuts/authV2/verification_key.json';
import { STORAGE_IDEN3_URL } from '../constants';


export const iden3callback = createTrigger({
    name: 'iden3_callback',
    displayName: 'Iden3 Callback',
    description: 'Creates a webhook that will be called when a new incoming message received',
    props: {},
    type: TriggerStrategy.WEBHOOK,
    async onEnable(context) {
        const exist = await context.store.get(STORAGE_IDEN3_URL, StoreScope.PROJECT);
        if (exist) {
            throw new Error('Iden3 callback url already exists');
        }

        await context.store.put(STORAGE_IDEN3_URL, context.webhookUrl, StoreScope.PROJECT);
    },
    async onDisable(context) {
        await context.store.delete(STORAGE_IDEN3_URL, StoreScope.PROJECT);
    },
    async run(context) {
        const jwz = context.payload.body as string;
        if (!jwz || typeof jwz !== 'string') {
            throw new Error('Invalid payload');
        }

        const parsed = await Token.parse(jwz);
        let payloadDecoded: Record<string, unknown> = {};
        try {
            payloadDecoded = JSON.parse(parsed.getPayload());
        } catch (e) {
            console.log('failed parse payload', e, parsed.getPayload());
        }
        const verified = await parsed.verify(byteEncoder.encode(JSON.stringify(authV2verification)));
        return [
            {
                jwz,
                verified,
                payloadDecoded,
            },
        ];
    },
    sampleData: undefined,
});
