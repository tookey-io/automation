import {
  AbstractPrivateKeyStore,
  AgentResolver,
  BjjProvider,
  byteEncoder,
  cacheLoader,
  CredentialRequest,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialStorage,
  CredentialWallet,
  defaultEthConnectionConfig,
  EthStateStorage,
  hexToBytes,
  IDataSource,
  Identity,
  IdentityStorage,
  IdentityWallet,
  IssuerResolver,
  KMS,
  KmsKeyType,
  OnChainResolver,
  Profile,
  RHSResolver,
  W3CCredential
} from '@0xpolygonid/js-sdk';
import {
  ActionContext,
  createAction,
  createPiece,
  createTrigger,
  DynamicPropsValue,
  PieceAuth,
  Property,
  StoreScope,
  TriggerStrategy,
  Validators
} from '@activepieces/pieces-framework';
import { PublicKey } from '@iden3/js-crypto';
import { Blockchain, DID, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { Token } from '@iden3/js-jwz';
import { Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import authV2verification from './circuts/authV2/verification_key.json';
import { KeyValueMerkleTreeStorage } from './lib/storage/merke-tree-store';

export const STORAGE_PREFIX = 'polygon_id_3';
export const STORAGE_IDEN3_URL = STORAGE_PREFIX + '_iden3_callback_url';
export const DELIMITER = '__!__';

export const PolygonIdAuth = PieceAuth.CustomAuth({
    required: true,
    props: {
        seed: PieceAuth.SecretText({
            displayName: 'Seed (32 bytes)',
            description: 'The seed to generate BJJ private key',
            required: true,
            validators: [Validators.pattern(/^(0x)?[0-9a-fA-F]{64}$/)],
        }),
    },
});

const defined = <T>(x: T | undefined): x is T => x !== undefined;

class KeyValueDataSource<T> implements IDataSource<T> {
    constructor(
        protected readonly dataPrefix: string,
        protected readonly context: ActionContext<typeof PolygonIdAuth, any>
    ) {}

    listKey() {
        return [STORAGE_PREFIX, this.dataPrefix].join(DELIMITER);
    }

    recordKey(key: string, keyName: string) {
        return [STORAGE_PREFIX, this.dataPrefix, key, keyName].join(DELIMITER);
    }

    allKeys(): Promise<[string, string][]> {
        console.log('allKeys', this.dataPrefix);
        return this.context.store
            .get<[string, string][]>(this.listKey(), StoreScope.PROJECT)
            .then((items) => items ?? []);
    }

    load(): Promise<T[]> {
        console.log('load', this.dataPrefix);
        return this.allKeys().then((records) =>
            Promise.all(records.map(([key, name]) => this.get(key, name))).then((r) => r.filter(defined))
        );
    }

    loadMap(): Promise<Record<`${string}_${string}`, T>> {
        console.log('loadMap', this.dataPrefix);
        return this.allKeys().then((records) =>
            Promise.all(
                records.map(([key, name]) =>
                    this.get(key, name).then((r) => (r ? ([key, name, r] as const) : undefined))
                )
            ).then((records) =>
                Object.fromEntries(records.filter(defined).map(([key, name, r]) => [`${key}_${name}`, r]))
            )
        );
    }

    save(key: string, value: T, keyName?: string | undefined): Promise<void> {
        const notNullkeyName = keyName ?? 'default';
        console.log('save', this.dataPrefix, key, value, notNullkeyName);
        return Promise.all([
            this.context.store.put(this.recordKey(key, notNullkeyName), value, StoreScope.PROJECT),
            this.allKeys().then((records) => {
                const newRecords = records.filter(([k, kn]) => k !== key || kn !== notNullkeyName);
                newRecords.push([key, notNullkeyName]);
                console.log('update list', this.listKey(), newRecords);
                return this.context.store.put(this.listKey(), newRecords, StoreScope.PROJECT);
            }),
        ]).then(() => undefined);
    }

    get(key: string, keyName?: string | undefined): Promise<T | undefined> {
        const notNullkeyName = keyName ?? 'default';
        console.log('get', this.dataPrefix, key, notNullkeyName);
        return this.context.store
            .get<T>(this.recordKey(key, notNullkeyName), StoreScope.PROJECT)
            .then((item) => item ?? undefined);
    }

    delete(key: string, keyName?: string | undefined): Promise<void> {
        const notNullKeyName = keyName ?? 'default';
        console.log('delete', this.dataPrefix, key, notNullKeyName);
        return Promise.all([
            this.context.store.delete(this.recordKey(key, notNullKeyName), StoreScope.PROJECT),
            this.allKeys().then((records) => {
                const newRecords = records.filter(([k, kn]) => k !== key || kn !== notNullKeyName);
                return this.context.store.put(this.listKey(), newRecords, StoreScope.PROJECT);
            }),
        ]).then(() => undefined);
    }
}

class KeyValuePrivateKeyStore implements AbstractPrivateKeyStore {
    storage: KeyValueDataSource<string>;

    constructor(dataPrefix: string, context: ActionContext<typeof PolygonIdAuth, any>) {
        this.storage = new KeyValueDataSource<string>(dataPrefix, context);
    }

    importKey(args: { alias: string; key: string }): Promise<void> {
        return this.storage.save(args.alias, args.key);
    }

    get(args: { alias: string }): Promise<string> {
        return this.storage.get(args.alias).then((key) => {
            if (!key) {
                throw new Error(`Key ${args.alias} not found`);
            }

            return key;
        });
    }
}

const testAction = createAction({
    auth: PolygonIdAuth,
    name: 'test',
    displayName: 'Check my Identity',
    description: '',
    props: {},
    requireAuth: true,
    async run(ctx) {
        const store = await initializeDataStorage(ctx);

        return {
            did: store.me.did,
            credential: store.me.auth.toJSON(),
        };
    },
});

const allRecords = createAction({
    auth: PolygonIdAuth,
    name: 'records',
    displayName: 'Show all stored records',
    description: '',
    props: {},
    requireAuth: true,
    async run(ctx) {
        const store = await initializeDataStorage(ctx);

        const [identities, indentitiesRecords, profilesRecords, credentials, credentialsRecords, pvtRecords] =
            await Promise.all([
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

const initializeDataStorage = async (context: ActionContext<typeof PolygonIdAuth, any>) => {
    const credentialStore = new KeyValueDataSource<W3CCredential>('CREDS', context);
    const credential = new CredentialStorage(credentialStore);
    const identityStore = new KeyValueDataSource<Identity>('IDENTITIES', context);
    const profileStore = new KeyValueDataSource<Profile>('PROFILES', context);
    const identity = new IdentityStorage(identityStore, profileStore);
    const mt = new KeyValueMerkleTreeStorage(context, 40);
    const states = new EthStateStorage({
        ...defaultEthConnectionConfig,
        url: 'https://rpc-mumbai.maticvigil.com',
        contractAddress: '0x134B1BE34911E39A8397ec6289782989729807a4',
        chainId: 80001,
    });

    const keyStore = new KeyValuePrivateKeyStore('KEYS', context);

    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    const statusRegistry = new CredentialStatusResolverRegistry();
    statusRegistry.register(CredentialStatusType.SparseMerkleTreeProof, new IssuerResolver());
    statusRegistry.register(CredentialStatusType.Iden3ReverseSparseMerkleTreeProof, new RHSResolver(states));
    statusRegistry.register(
        CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        new OnChainResolver([
            {
                ...defaultEthConnectionConfig,
                url: 'https://rpc-mumbai.maticvigil.com',
                contractAddress: '0x134B1BE34911E39A8397ec6289782989729807a4',
                chainId: 80001,
            },
        ])
    );
    statusRegistry.register(CredentialStatusType.Iden3commRevocationStatusV1, new AgentResolver());

    const store = {
        credential,
        identity,
        mt,
        states,
    };

    const credWallet = new CredentialWallet(store, statusRegistry);
    const wallet = new IdentityWallet(kms, store, credWallet);
    const seed = context.auth.seed.startsWith('0x') ? context.auth.seed.slice(2) : context.auth.seed;
    const seedPhrase: Uint8Array = hexToBytes(seed);

    const keyId = await bjjProvider.newPrivateKeyFromSeed(seedPhrase);
    const pubKeyHex = await kms.publicKey(keyId);
    const pubKey = PublicKey.newFromHex(pubKeyHex);

    let myAuth = await credential
        .listCredentials()
        .then((credentials) =>
            credentials.find(
                (c) =>
                    c.credentialSubject['type'] === 'AuthBJJCredential' &&
                    c.credentialSubject['x'] === pubKey.p[0].toString() &&
                    c.credentialSubject['y'] === pubKey.p[1].toString()
            )
        );
    let myDid = myAuth?.issuer ? DID.parse(myAuth.issuer) : undefined;

    if (!myAuth) {
        const { did, credential } = await wallet.createIdentity({
            method: DidMethod.Iden3,
            blockchain: Blockchain.Polygon,
            networkId: NetworkId.Mumbai,
            seed: seedPhrase,
            revocationOpts: {
                type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
                id: 'https://rhs-staging.polygonid.me',
            },
        });

        myDid = did;
        myAuth = credential;
    }

    if (!myDid || !myAuth) {
        throw new Error('Unable to create identity');
    }

    return {
        credentialStore,
        credential,
        identityStore,
        profileStore,
        identity,
        mt,
        states,
        keyStore,
        me: {
            did: myDid,
            auth: myAuth,
        },
        wallet,
        credWallet,
        pubKeyHex,
    };
};

type SchemaDefinition = {
    $schema: string;
};

const titleAndDescription = {
    description: Type.String(),
    title: Type.String(),
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
        type: Type.String(),
        uris: Type.Object({
            jsonLdContext: Type.String(),
        }),
        version: Type.String(),
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
                        const displayName = definition.title;
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
                        value:
                            'Invalid schema: \n\n\n' +
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
        const store = await initializeDataStorage(ctx);
        const schemaJson = await cacheLoader({
            ipfsGatewayURL: 'https://ipfs.io',
        })(ctx.propsValue.schema).then((r) => r.document);
        if (Value.Check(SchemaJson, schemaJson)) {
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
                type: schemaJson.$metadata.type,
                credentialSubject,
                expiration: 12345678888, // TODO field
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
        const store = await initializeDataStorage(context);
        const callbackRoot = await context.store.get(STORAGE_IDEN3_URL, StoreScope.PROJECT);

        if (!callbackRoot) {
            throw new Error('Iden3 callback url not found');
        }

        const credentialContext = context.propsValue.credential['@context'];
        if (!Array.isArray(credentialContext) || credentialContext.length === 0) {
            throw new Error('Invalid credential context');
        }

        const schemaJsonLd = credentialContext[credentialContext.length - 1];
        const claim = `${context.serverUrl}v1/flow-runs/${context.run.id}/resume?action=claim`;
        const credentialSubject = context.propsValue.credential['credentialSubject'] as {
            type: string;
            id: string;
        };

        if (
            !credentialSubject ||
            typeof credentialSubject !== 'object' ||
            !credentialSubject['type'] ||
            !credentialSubject['id']
        ) {
            throw new Error('Invalid credential subject');
        }
        const urnId = context.propsValue.credential['id'] as string;
        if (!urnId || typeof urnId !== 'string' || !urnId.startsWith('urn:')) {
            throw new Error('Invalid credential id');
        }
        const id = urnId.slice(4);

        return {
            body: {
                credentials: [
                    {
                        description: `${schemaJsonLd}#${credentialSubject['type']}`,
                        id,
                    },
                ],
                url: callbackRoot + '/sync',
            },
            from: store.me.did.string(),
            id,
            thid: id,
            to: credentialSubject['id'],
            typ: 'application/iden3comm-plain-json',
            type: 'https://iden3-communication.io/credentials/1.0/offer',
        };
    },
});

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

export const polygonId = createPiece({
    displayName: 'Polygon ID',
    auth: PolygonIdAuth,
    minimumSupportedRelease: '0.9.0',
    logoUrl: 'https://raw.githubusercontent.com/tookey-io/icons/main/piece-polygon-id.png',
    authors: ['aler-denisov'],
    actions: [testAction, allRecords, issueCredential, offer],
    triggers: [iden3callback],
});
