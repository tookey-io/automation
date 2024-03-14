import { createAction } from '@activepieces/pieces-framework';
import { initializeContext } from '../initializeContext';
import { PolygonIdAuth } from '../..';

export const testAction = createAction({
    auth: PolygonIdAuth,
    name: 'test',
    displayName: 'Check my Identity',
    description: '',
    props: {},
    requireAuth: true,
    async run(ctx) {
        const store = await initializeContext(ctx);

        return {
            did: store.me.did,
            credential: store.me.auth.toJSON(),
        };
    },
});
