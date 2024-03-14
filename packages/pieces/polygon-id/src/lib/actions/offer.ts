import {
    createAction, Property,
    StoreScope
} from '@activepieces/pieces-framework';
import { initializeContext } from '../initializeContext';
import { STORAGE_IDEN3_URL } from '../constants';
import { PolygonIdAuth } from '../..';
import QRCode from 'qrcode'


export const offer = createAction({
    name: 'offer',
    displayName: '[Iden3] Offer Claim',
    description: 'Generate a claim offer and wait for the claim',
    props: {
        credential: Property.Json({
            displayName: 'Credential',
            description: 'Credential to offer',
            required: true,
        }),
    },
    auth: PolygonIdAuth,
    requireAuth: true,
    async run(context) {
        const store = await initializeContext(context);
        const credentialContext = context.propsValue.credential['@context'];
        if (!Array.isArray(credentialContext) || credentialContext.length === 0) {
            throw new Error('Invalid credential context');
        }

        const schemaJsonLd = credentialContext[credentialContext.length - 1];
        const claim = `${context.serverUrl}v1/flow-runs/${context.run.id}/resume/sync?action=claim`;
        const credentialSubject = context.propsValue.credential['credentialSubject'] as {
            type: string;
            id: string;
        };

        if (!credentialSubject ||
            typeof credentialSubject !== 'object' ||
            !credentialSubject['type'] ||
            !credentialSubject['id']) {
            throw new Error('Invalid credential subject');
        }
        const id = context.propsValue.credential['id'] as string;

        const message = {
            body: {
                credentials: [
                    {
                        description: `${schemaJsonLd}#${credentialSubject['type']}`,
                        id,
                    },
                ],
                url: claim
            },
            from: store.me.did.string(),
            id,
            thid: id,
            to: credentialSubject['id'],
            typ: 'application/iden3comm-plain-json',
            type: 'https://iden3-communication.io/credentials/1.0/offer',
            
        }
        return {
            message,
            file: await QRCode.toDataURL(JSON.stringify(message))
        }
    },
});
