import {
    cacheLoader,
    CredentialRequest,
    CredentialStatusType
} from '@0xpolygonid/js-sdk';
import { createAction, DynamicPropsValue, Property, Validators } from '@activepieces/pieces-framework';
import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { initializeContext } from '../initializeContext';
import { defined } from '../defined';
import { PolygonIdAuth } from '../..';

type SchemaDefinition = {
    $schema: string;
};
const titleAndDescription = {
    description: Type.Optional(Type.String()),
    title: Type.Optional(Type.String()),
};

export const DateTimeFormat = Type.Literal('date-time');
export const DateFormat = Type.Literal('date');
export const TimeFormat = Type.Literal('time');
export const DurationFormat = Type.Literal('duration');
export const EmailFormat = Type.Literal('email');
export const IdnEmailFormat = Type.Literal('idn-email');
export const HostnameFormat = Type.Literal('hostname');
export const IdnHostnameFormat = Type.Literal('idn-hostname');
export const IPv4Format = Type.Literal('ipv4');
export const IPv6Format = Type.Literal('ipv6');
export const UuidFormat = Type.Literal('uuid');
export const UriFormat = Type.Literal('uri');
export const UriReferenceFormat = Type.Literal('uri-reference');
export const IriFormat = Type.Literal('iri');
export const IriReferenceFormat = Type.Literal('iri-reference');
export const JsonPointerFormat = Type.Literal('json-pointer');
export const RelativeJsonPointerFormat = Type.Literal('relative-json-pointer');
export const RegexFormat = Type.Literal('regex');

export const StringFormats = Type.Union([
    DateTimeFormat,
    DateFormat,
    TimeFormat,
    DurationFormat,
    EmailFormat,
    IdnEmailFormat,
    HostnameFormat,
    IdnHostnameFormat,
    IPv4Format,
    IPv6Format,
    UuidFormat,
    UriFormat,
    UriReferenceFormat,
    IriFormat,
    IriReferenceFormat,
    JsonPointerFormat,
    RelativeJsonPointerFormat,
    RegexFormat,
]);

export const StringPropertySchema = Type.Object({
    ...titleAndDescription,
    $comment: Type.Optional(Type.String()),
    type: Type.Literal('string'),
    const: Type.Optional(Type.String()),
    default: Type.Optional(Type.String()),
    enum: Type.Optional(Type.Array(Type.String())),
    examples: Type.Optional(Type.Array(Type.String())),
    format: Type.Optional(StringFormats),
    maxLength: Type.Optional(Type.Integer()),
    minLength: Type.Optional(Type.Integer()),
    pattern: Type.Optional(Type.String()),
});

export const NumberPropertySchema = Type.Object({
    ...titleAndDescription,
    $comment: Type.Optional(Type.String()),
    type: Type.Literal('number'),
    const: Type.Optional(Type.Number()),
    default: Type.Optional(Type.Number()),
    enum: Type.Optional(Type.Array(Type.Number())),
    examples: Type.Optional(Type.Array(Type.Number())),
    format: Type.Optional(Type.String()),
    maximum: Type.Optional(Type.Number()),
    minimum: Type.Optional(Type.Number()),
    exclusiveMaximum: Type.Optional(Type.Number()),
    exclusiveMinimum: Type.Optional(Type.Number()),
    multipleOf: Type.Optional(Type.Number()),
});

export const BooleanPropertySchema = Type.Object({
    ...titleAndDescription,
    $comment: Type.Optional(Type.String()),
    type: Type.Literal('boolean'),
    const: Type.Optional(Type.Boolean()),
    default: Type.Optional(Type.Boolean()),
    enum: Type.Optional(Type.Array(Type.Boolean())),
    examples: Type.Optional(Type.Array(Type.Boolean())),
});

export const IntegerPropertySchema = Type.Object({
    ...titleAndDescription,
    $comment: Type.Optional(Type.String()),
    type: Type.Literal('integer'),
    const: Type.Optional(Type.Integer()),
    default: Type.Optional(Type.Integer()),
    enum: Type.Optional(Type.Array(Type.Integer())),
    examples: Type.Optional(Type.Array(Type.Integer())),
    format: Type.Optional(Type.String()),
    maximum: Type.Optional(Type.Integer()),
    minimum: Type.Optional(Type.Integer()),
    exclusiveMaximum: Type.Optional(Type.Integer()),
    exclusiveMinimum: Type.Optional(Type.Integer()),
    multipleOf: Type.Optional(Type.Integer()),
});

export const ObjectPropertySchema = Type.Object({
    ...titleAndDescription,
    type: Type.Literal('object'),
});

export const AnyPropertySchema = Type.Union([
    StringPropertySchema,
    NumberPropertySchema,
    BooleanPropertySchema,
    IntegerPropertySchema,
    ObjectPropertySchema,
]);

export const SchemaJson = Type.Object({
    $metadata: Type.Object({
        type: Type.Optional(Type.String()),
        uris: Type.Object({
            jsonLdContext: Type.String(),
        }),
        version: Type.Optional(Type.String()),
    }),
    ...titleAndDescription,
    properties: Type.Object({
        '@context': Type.Object({
            type: Type.Array(Type.Union([Type.Literal('string'), Type.Literal('array'), Type.Literal('object')])),
        }),
        credentialSubject: Type.Object({
            ...titleAndDescription,
            properties: Type.Record(Type.String(), AnyPropertySchema),
            required: Type.Array(Type.String()),
        }),
        expirationDate: Type.Object({
            format: DateTimeFormat,
            type: Type.Literal('string'),
        }),
        issuanceDate: Type.Object({
            format: DateTimeFormat,
            type: Type.Literal('string'),
        }),
        id: Type.Object({
            type: Type.Literal('string'),
        }),
        issuer: Type.Object({
            type: Type.Array(Type.Union([Type.Literal('string'), Type.Literal('object')])),
            format: UriFormat,
            properties: Type.Object({
                id: Type.Object({
                    format: UriFormat,
                    type: Type.Literal('string'),
                }),
            }),
        }),
        type: Type.Object({
            type: Type.Array(Type.Union([Type.Literal('string'), Type.Literal('array')])),
            items: Type.Object({
                type: Type.Literal('string'),
            }),
        }),
        credentialSchema: Type.Object({
            properties: Type.Object({
                id: Type.Object({
                    type: Type.Literal('string'),
                    format: UriFormat,
                }),
                type: Type.Object({
                    type: Type.Literal('string'),
                }),
            }),
            required: Type.Array(Type.String()),
        }),
    }),
    required: Type.Array(Type.String()),
});

export type SchemaJson = Static<typeof SchemaJson>;

export const issueCredential = createAction({
    name: 'issue',
    displayName: 'Issue Credential',
    description: '',
    auth: PolygonIdAuth,
    requireAuth: true,
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
        fields: Property.DynamicProperties({
            displayName: 'Fields',
            required: true,
            refreshers: ['schema'],
            async props({ schema }, ctx) {
                if (!schema) {
                    return {};
                }
                console.log('test-----', schema, typeof schema);
                const schemaJson = await cacheLoader()(schema).then((r) => r.document);
                const fields: DynamicPropsValue = {};
                if (Value.Check(SchemaJson, schemaJson)) {
                    for (let [key, definition] of Object.entries(schemaJson.properties.credentialSubject.properties)) {
                        const displayName = definition.title || definition.description || key;
                        let description = definition.type + ' ' + definition.description;
                        const required = schemaJson.properties.credentialSubject.required.includes(key);

                        if (definition.type === 'string') {
                            if (definition.$comment) {
                                description += `\n\n${definition.$comment}`;
                            }
                            if (definition.examples) {
                                description += `\n\nExamples: \n${definition.examples.join('\n')}`;
                            }
                            if (definition.enum) {
                                fields[key] = Property.StaticDropdown({
                                    displayName,
                                    description,
                                    required,
                                    options: {
                                        disabled: false,
                                        placeholder: 'Select value',
                                        options: definition.enum.map((value) => ({
                                            value,
                                            label: value.toString(),
                                        })),
                                    },
                                });
                            } else {
                                fields[key] = Property.LongText({
                                    displayName,
                                    description,
                                    required,
                                    defaultValue: definition.const ?? definition.default,
                                    validators: [
                                        definition.format === 'email' ? Validators.email : undefined,
                                        definition.format === 'uri' ? Validators.url : undefined,
                                        definition.const ? Validators.oneOf([definition.const]) : undefined,
                                        definition.minLength ? Validators.minLength(definition.minLength) : undefined,
                                        definition.maxLength ? Validators.maxLength(definition.maxLength) : undefined,
                                        definition.pattern ? Validators.pattern(definition.pattern) : undefined,
                                        // TODO: all formats
                                    ].filter(defined),
                                });
                            }
                        } else if (definition.type === 'number' || definition.type === 'integer') {
                            if (definition.$comment) {
                                description += `\n\n${definition.$comment}`;
                            }
                            if (definition.examples) {
                                description += `\n\nExamples: \n${definition.examples.join('\n')}`;
                            }
                            if (definition.enum) {
                                fields[key] = Property.StaticDropdown({
                                    displayName,
                                    description,
                                    required,
                                    options: {
                                        disabled: false,
                                        placeholder: 'Select value',
                                        options: definition.enum.map((value) => ({
                                            value,
                                            label: value.toString(),
                                        })),
                                    },
                                });
                            } else {
                                fields[key] = Property.Number({
                                    displayName,
                                    description,
                                    required,
                                    defaultValue: definition.const ?? definition.default,
                                    validators: [
                                        definition.const ? Validators.oneOf([definition.const]) : undefined,
                                        definition.type === 'integer' ? Validators.integer : undefined,
                                        definition.minimum ? Validators.minValue(definition.minimum) : undefined,
                                        definition.maximum ? Validators.maxValue(definition.maximum) : undefined,
                                        definition.exclusiveMinimum
                                            ? Validators.minValue(definition.exclusiveMinimum + Number.EPSILON)
                                            : undefined,
                                        definition.exclusiveMaximum
                                            ? Validators.maxValue(definition.exclusiveMaximum)
                                            : undefined,
                                    ].filter(defined),
                                });
                            }
                        } else if (definition.type === 'boolean') {
                            if (definition.$comment) {
                                description += `\n\n${definition.$comment}`;
                            }
                            if (definition.examples) {
                                description += `\n\nExamples: \n${definition.examples.join('\n')}`;
                            }

                            fields[key] = Property.Checkbox({
                                displayName,
                                description,
                                required,
                                defaultValue: definition.const ?? definition.default,
                                validators: [
                                    definition.const ? Validators.oneOf([definition.const]) : undefined,
                                ].filter(defined),
                            });
                        } else if (definition.type === 'object') {
                            fields[key] = Property.Object({
                                displayName,
                                description,
                                required,
                            });
                        }
                    }
                } else {
                    fields['schema'] = Property.MarkDown({
                        value: 'Invalid schema: \n\n\n' +
                            Array.from(Value.Errors(SchemaJson, schemaJson))
                                .map((e) => `Path: ${e.path}\n\nError: ${e.message}\n\nValue: ${e.value}`)
                                .join('\n\n\n'),
                    });
                }

                return fields;
            },
        }),
    },
    async run(ctx) {
        const store = await initializeContext(ctx);
        const schemaJson = await cacheLoader({
            ipfsGatewayURL: 'https://ipfs.io',
        })(ctx.propsValue.schema).then((r) => r.document);
        if (Value.Check(SchemaJson, schemaJson)) {
            const type = schemaJson.$metadata.type || ctx.propsValue.credentialType;

            if (!type) {
                throw new Error('Missing credential type');
            }

            console.log('schemajson is valid', schemaJson.$metadata.type);
            console.log(ctx.propsValue.fields);
            const credentialSubject: Record<string, string | number | object | boolean> = {};

            for (let [key, value] of Object.entries(ctx.propsValue.fields)) {
                const propertySchema = schemaJson.properties.credentialSubject.properties[key];
                if (propertySchema) {
                    if (propertySchema.type === 'boolean') {
                        credentialSubject[key] = value === 'true';
                    } else if (propertySchema.type === 'integer' || propertySchema.type === 'number') {
                        credentialSubject[key] = Number(value);
                    } else {
                        credentialSubject[key] = value;
                    }
                } else {
                    throw new Error(`Invalid field ${key}`);
                }
            }

            const claimRequest: CredentialRequest = {
                credentialSchema: ctx.propsValue.schema,
                type,
                credentialSubject,
                expiration: 12345678888,
                revocationOpts: {
                    type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
                    id: 'https://rhs-staging.polygonid.me',
                },
            };

            const credential = await store.wallet
                .issueCredential(store.me.did, claimRequest, {
                    ipfsGatewayURL: 'https://ipfs.io',
                })
                .catch((e) => {
                    console.log(e);
                    throw e;
                });

            await store.credential.saveCredential(credential);
            return credential;
        } else {
            throw new Error('Invalid schema');
        }
    },
});
