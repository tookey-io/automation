import { createAction } from '@activepieces/pieces-framework';
import { initializeContext } from '../initializeContext';
import { PolygonIdAuth } from '../..';

export const allRecords = createAction({
    auth: PolygonIdAuth,
    name: 'records',
    displayName: 'Show all stored records',
    description: '',
    props: {},
    requireAuth: true,
    async run(ctx) {
        const store = await initializeContext(ctx);

        const [identities, indentitiesRecords, profilesRecords, credentials, credentialsRecords, pvtRecords] = await Promise.all([
            store.identity.getAllIdentities().then((identities) => identities.map((i) => i.did)),
            store.identityStore.loadMap(),
            store.profileStore.loadMap(),
            store.credential.listCredentials().then((credentials) => credentials.map((c) => c.toJSON())),
            store.credentialStore.loadMap(),
            store.keyStore.storage.loadMap(),
        ]);

        return { identities, indentitiesRecords, profilesRecords, credentials, credentialsRecords, pvtRecords };
    },
});
