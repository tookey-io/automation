import {
    ActionContext,
    DynamicPropsValue,
    PieceAuthProperty,
    Property,
    PropertyContext,
    ShortTextProperty,
    StaticDropdownProperty,
    StaticMultiSelectDropdownProperty,
    StoreScope,
    createAction,
} from '@activepieces/pieces-framework';
import { auth, resolver, protocol } from '@iden3/js-iden3-auth';
import { initializeContext } from '../initializeContext';
import { PolygonIdAuth } from '../..';
import { STORAGE_IDEN3_URL } from '../constants';
import QRCode from 'qrcode';
import { ZeroKnowledgeProofRequest, cacheLoader } from '@0xpolygonid/js-sdk';
import { Value } from '@sinclair/typebox/value';
import { SchemaJson } from './issueCredential';
import { defined } from '../defined';

export const requestCredential = createAction({
    name: 'request_credential',
    displayName: 'Request Credential',
    description: 'Creates verification request',
    auth: PolygonIdAuth,
    props: {
        schema: Property.ShortText({
            displayName: 'Schema',
            description: 'URI of the schema to issue',
            required: true,
        }),
        credentialType: Property.ShortText({
            displayName: 'Credential Type',
            description: 'Type of the credential if not specified in the schema',
            required: false,
        }),
        proof: Property.StaticDropdown({
            displayName: 'Proof Type',
            required: true,
            options: {
                disabled: false,
                placeholder: 'Select proof type',
                options: [
                    { value: 'sig', label: 'Signature-based' },
                    { value: 'mtp', label: 'Merkle Tree Proof' },
                ],
            },
        }),
        field: Property.Dropdown({
            displayName: 'Field',
            refreshers: ['schema'],
            required: true,
            async options({ schema }, ctx) {
                if (!schema) {
                    return {
                        disabled: true,
                        placeholder: 'Provide schema first',
                        options: [],
                    };
                }

                console.log('test-----', schema, typeof schema);
                const schemaJson = await cacheLoader()(schema).then((r) => r.document);
                if (Value.Check(SchemaJson, schemaJson)) {
                    return {
                        disabled: false,
                        placeholder: 'Select field',
                        options: Object.entries(schemaJson.properties.credentialSubject.properties).map(
                            ([key, value]) => ({
                                label: `${key} - ${value.type}`,
                                value: key,
                            })
                        ),
                    };
                } else {
                    console.log(
                        'Schema not valid',
                        Array.from(Value.Errors(SchemaJson, schemaJson)).map((e) => `${e.path}: ${e.message}`)
                    );
                    return {
                        disabled: true,
                        placeholder: 'Schema not valid',
                        options: Array.from(Value.Errors(SchemaJson, schemaJson)).map((e) => ({
                            label: `${e.path}: ${e.message}`,
                            value: e.path,
                        })),
                    };
                }
            },
        }),
        mode: Property.Dropdown({
            displayName: 'Mode',
            required: true,
            refreshers: ['schema', 'field'],
            async options({ schema, field }) {
                if (!schema) {
                    return {
                        disabled: true,
                        placeholder: 'Provide schema first',
                        options: [],
                    };
                }

                if (!field) {
                    return {
                        disabled: true,
                        placeholder: 'Select field first',
                        options: [],
                    };
                }
                const schemaJson = await cacheLoader()(schema).then((r) => r.document);
                if (Value.Check(SchemaJson, schemaJson)) {
                    const kind = schemaJson.properties.credentialSubject.properties[field as unknown as string].type;
                    const isNumber = kind === 'integer' || kind === 'number';
                    return {
                        disabled: false,
                        placeholder: 'Select mode',
                        options: [
                            { label: 'Disclosure', value: 'disclosure' },
                            { label: 'Equal to', value: 'eq' },
                            { label: 'Not equal to', value: 'neq' },
                            { label: 'In', value: 'in' },
                            { label: 'Not in', value: 'nin' },
                            isNumber ? { label: 'Less than', value: 'lt' } : undefined,
                            isNumber ? { label: 'Greater than', value: 'gt' } : undefined,
                        ].filter(defined),
                    };
                } else {
                    return {
                        disabled: true,
                        placeholder: 'Schema not valid',
                        options: Array.from(Value.Errors(SchemaJson, schemaJson)).map((e) => ({
                            label: `${e.path}: ${e.message}`,
                            value: e.path,
                        })),
                    };
                }
            },
        }),
        args: Property.DynamicProperties({
            displayName: 'Arguments',
            required: true,
            refreshers: ['schema', 'mode', 'field'],
            async props({ schema, mode, field }, ctx) {
                if (!schema || !mode || !field) {
                    return {};
                }
                const schemaJson = await cacheLoader()(schema).then((r) => r.document);
                const fields: DynamicPropsValue = {};

                switch (mode as unknown as 'disclosure' | 'eq' | 'neq' | 'in' | 'nin' | 'lt' | 'gt') {
                    case 'disclosure':
                        return fields;
                    case 'eq':
                    case 'neq':
                    case 'lt':
                    case 'gt':
                        fields['value'] = Property.ShortText({
                            displayName: 'Comparison Value',
                            required: true,
                        });
                        return fields;
                    case 'in':
                    case 'nin':
                        fields['value'] = Property.Array({
                            displayName: 'Comparison Values',
                            required: true,
                        });
                        return fields;
                }
            },
        }),
        allowedIssuers: Property.Array({
            displayName: 'Allowed Issuers',
            required: false,
        }),
    },
    async run(ctx) {
        const state = await initializeContext(ctx);
        const request = auth.createAuthorizationRequest(
            'Testing purpose',
            state.me.did.string(),
            `${ctx.serverUrl}v1/flow-runs/${ctx.run.id}/resume/sync?action=return`
        );
        const {
            proof,
            allowedIssuers,
            schema,
            field,
            mode,
            args: { value },
        } = ctx.propsValue;

        const schemaJson = await cacheLoader()(schema).then((r) => r.document);
        if (Value.Check(SchemaJson, schemaJson)) {
            const type = schemaJson.$metadata.type || ctx.propsValue.credentialType;
            if (!type) {
                throw new Error('Credential type not specified');
            }

            const fieldType = schemaJson.properties.credentialSubject.properties[field as unknown as string].type;
            const normalizedValue =
                fieldType === 'integer' || fieldType === 'number'
                    ? Number(value)
                    : fieldType === 'boolean'
                    ? value === 'true'
                    : value;

            const proofRequest: ZeroKnowledgeProofRequest = {
                id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
                circuitId: proof === 'sig' ? 'credentialAtomicQuerySigV2' : 'credentialAtomicQueryMTPV2',
                query: {
                    allowedIssuers: allowedIssuers ?? ['*'],
                    type,
                    context: schemaJson.$metadata.uris.jsonLdContext,
                    credentialSubject: {
                        [field]:
                            mode === 'disclosure'
                                ? {}
                                : {
                                      [`$${mode}`]: normalizedValue,
                                  },
                    },
                },
            };
            request.body.scope = [...request.body.scope, proofRequest];
            const file = await QRCode.toDataURL(JSON.stringify(request));
            return {
                request,
                file,
            };
        } else {
            throw new Error('Schema not valid');
        }
    },
});
