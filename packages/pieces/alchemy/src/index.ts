import {
    createPiece,
    createTrigger,
    DynamicPropsValue,
    NonAuthPiecePropertyMap,
    PieceAuth,
    Property,
    SecretTextProperty,
    StaticPropsValue,
    Store,
    StoreScope,
    TestOrRunHookContext,
    TriggerStrategy,
} from '@activepieces/pieces-framework';
import {
    httpClient,
    HttpRequest,
    HttpMethod,
    AuthenticationType,
} from '@activepieces/pieces-common';
import { TriggerPayload } from '@activepieces/shared';
import sampleBlockHook from './sampleBlockHook.json';

const AlchemyHooksAuth = PieceAuth.SecretText({
    displayName: 'Auth token',
    description: `
To get your auth token, go to https://dashboard.alchemy.com/webhooks and click on **Auth token** button in top-right corner.
`,
    required: true,
});

const alchemyCommon = {
    api: 'https://dashboard.alchemy.com/api',
};

const graphqlTrigger = () => {};

enum WebhookNetworks {
    EthereumMainnet = 'ETH_MAINNET',
    EthereumGoerli = 'ETH_GOERLI',
    PolygonMainnet = 'MATIC_MAINNET',
    PolygonMumbai = 'MATIC_MUMBAI',
    ArbitrumMainnet = 'ARB_MAINNET',
    ArbitrumRinkeby = 'ARB_RINKEBY',
    OptimismMainnet = 'OPT_MAINNET',
    OptimismKovan = 'OPT_KOVAN',
    BaseMainnet = 'BASE_MAINNET',
    BaseTestnet = 'BASE_TESTNET',
}

enum WebhookTypes {
    GraphQL = 'GRAPHQL',
    MinedTransaction = 'MINED_TRANSACTION',
    DroppedTransaction = 'DROPPED_TRANSACTION',
    AddressActivity = 'ADDRESS_ACTIVITY',
    NftActivity = 'NFT_ACTIVITY',
    NftMetadataUpdate = 'NFT_METADATA_UPDATE',
}

type NtfFilter = {
    contract_address: string;
    token_id?: number | string;
};

type CommonCreateWebhookParams = {
    network: WebhookNetworks;
    webhook_url: string;
};

type GraphQLCreateWebhookParams = CommonCreateWebhookParams & {
    webhook_type: WebhookTypes.GraphQL;
    graphql_query: string;
};

type TransactionCreateWebhookParams = CommonCreateWebhookParams & {
    webhook_type:
        | WebhookTypes.MinedTransaction
        | WebhookTypes.DroppedTransaction;
    app_id: string;
};

type AddressActivityCreateWebhookParams = CommonCreateWebhookParams & {
    webhook_type: WebhookTypes.AddressActivity;
    app_id?: string;
    addresses: string[];
};

type NftCreateWebhookParams = CommonCreateWebhookParams & {
    webhook_type: WebhookTypes.NftActivity | WebhookTypes.NftMetadataUpdate;
    app_id?: string;
    nft_filters: NtfFilter[];
};

type CreateWebhookParams =
    | GraphQLCreateWebhookParams
    | TransactionCreateWebhookParams
    | AddressActivityCreateWebhookParams
    | NftCreateWebhookParams;

const createWebhook = (auth: string, params: CreateWebhookParams) => {
    return httpClient
        .sendRequest<{
            data: {
                id: string;
                network: WebhookNetworks;
                webhook_type: WebhookTypes;
                webhook_url: string;
                is_active: boolean;
                time_created: number;
                addresses?: string[];
                version: 'v1' | 'v2';
                signing_key: string;
            };
        }>({
            method: HttpMethod.POST,
            url: `${alchemyCommon.api}/create-webhook`,
            body: {
                ...params,
            },
            headers: {
                'X-Alchemy-Token': auth,
            },
        })
        .then((r) => r.body.data);
};

const deleteWebhook = (auth: string, webhook_id: string) => {
    return httpClient.sendRequest({
        method: HttpMethod.DELETE,
        url: `${alchemyCommon.api}/delete-webhook?webhook_id=${webhook_id}`,
        body: {},
        headers: {
            'X-Alchemy-Token': auth,
        },
    });
};

export const SmartContractEventTrigger = createTrigger({
    displayName: 'On smart contract event',
    auth: AlchemyHooksAuth,
    name: 'smart_contract_event',
    description: 'Trigger on smart contract event',
    props: {},
    type: TriggerStrategy.WEBHOOK,
    async onEnable(context) {
        const webhook = await createWebhook(context.auth, {
            webhook_type: WebhookTypes.GraphQL,
            webhook_url: context.webhookUrl,
            network: WebhookNetworks.EthereumMainnet,
            graphql_query: `
block {
  logs(filter: { topics: ["0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"]}) {
    account { address }
    topics
    data
    transaction {
      hash
      nonce
      index
      from { address }
      to { address }
      value
      gasPrice
      maxFeePerGas
      maxPriorityFeePerGas
      gas
      inputData
      status
      gasUsed
      cumulativeGasUsed
      effectiveGasPrice
      createdContract { address }
      logs {
        index
        account { address }
        topics
        data
      }
      r
      s
      v
      type
      accessList
      block {
        number
        hash
        parent {
          number
          hash
        }
      }
    }
  }
}
        `,
        });

        await context.store.put(
            'alchemy_webhook_id',
            { id: webhook.id },
            StoreScope.FLOW
        );
    },
    async onDisable(context) {
        const info = await context.store.get<{ id: string }>(
            'alchemy_webhook_id',
            StoreScope.FLOW
        );
        if (info) {
            await deleteWebhook(context.auth, info.id);
        }
    },
    async run(context) {
        throw new Error('Function not implemented.');
    },
    sampleData: {},
});

export const BlockEventTrigger = createTrigger({
    displayName: 'On block event',
    auth: AlchemyHooksAuth,
    name: 'block_event',
    description: 'Trigger on block event',
    props: {
        network: Property.StaticDropdown({
            displayName: 'Network',
            description: 'Network to listen',
            required: true,
            options: {
                disabled: false,
                options: Object.values(WebhookNetworks)
                    .slice(0, Object.values(WebhookNetworks).length / 2)
                    .map((value) => ({
                        value,
                        label: value,
                    })),
            },
        }),
        blockFields: Property.StaticMultiSelectDropdown({
            displayName: 'Block fields',
            description: 'Fields to include in the blocks',
            required: true,
            defaultValue: [
                'number',
                'parent',
                // 'transactionRoot',
                // 'transactionCount',
                // 'stateRoot',
                // 'receiptsRoot',
                'gasLimit',
                'gasUsed',
                'baseFeePerGas',
                'timestamp',
                // 'logsBloom',
                // 'mixHash',
                // 'difficulty',
                // 'totalDifficulty',
            ],
            options: {
                disabled: false,
                options: [
                    {
                        value: 'number',
                        label: 'Number',
                    },
                    {
                        value: 'parent',
                        label: 'Parent',
                    },
                    {
                        value: 'transactionRoot',
                        label: 'Transaction root',
                    },
                    {
                        value: 'transactionCount',
                        label: 'Transaction count',
                    },
                    {
                        value: 'stateRoot',
                        label: 'State root',
                    },
                    {
                        value: 'receiptsRoot',
                        label: 'Receipts root',
                    },
                    {
                        value: 'gasLimit',
                        label: 'Gas limit',
                    },
                    {
                        value: 'gasUsed',
                        label: 'Gas used',
                    },
                    {
                        value: 'baseFeePerGas',
                        label: 'Base fee per gas',
                    },
                    {
                        value: 'timestamp',
                        label: 'Timestamp',
                    },
                    {
                        value: 'logsBloom',
                        label: 'Logs bloom',
                    },
                    {
                        value: 'mixHash',
                        label: 'Mix hash',
                    },
                    {
                        value: 'difficulty',
                        label: 'Difficulty',
                    },
                    {
                        value: 'totalDifficulty',
                        label: 'Total difficulty',
                    },
                ],
            },
        }),
        includeTransactions: Property.Checkbox({
            displayName: 'Include transactions',
            description: 'Include transactions in the payload',
            required: false,
        }),
        transactionsSetup: Property.DynamicProperties({
            displayName: 'Transactions setup',
            required: true,
            refreshers: ['includeTransactions'],
            async props({ includeTransactions }) {
                if (!includeTransactions) {
                    return {};
                }

                const fields: DynamicPropsValue = {
                    transactionFields: Property.StaticMultiSelectDropdown({
                        displayName: 'Transaction fields',
                        description: 'Fields to include in the transactions',
                        required: true,
                        defaultValue: [
                            'from',
                            'to',
                            'value',
                            'gasPrice',
                            'maxFeePerGas',
                            'maxPriorityFeePerGas',
                            'gas',
                            'inputData',
                            'gasUsed',
                            'createdContract',
                            'logs',
                        ],
                        options: {
                            disabled: false,
                            options: [
                                {
                                    value: 'nonce',
                                    label: 'Nonce',
                                },
                                {
                                    value: 'index',
                                    label: 'Index',
                                },
                                {
                                    value: 'from',
                                    label: 'From',
                                },
                                {
                                    value: 'to',
                                    label: 'To',
                                },
                                {
                                    value: 'value',
                                    label: 'Value',
                                },
                                {
                                    value: 'logs',
                                    label: 'Event Logs',
                                },
                                {
                                    value: 'gasPrice',
                                    label: 'Gas price',
                                },
                                {
                                    value: 'maxFeePerGas',
                                    label: 'Max fee per Gas',
                                },
                                {
                                    value: 'maxPriorityFeePerGas',
                                    label: 'Max priority per Gas',
                                },
                                {
                                    value: 'gas',
                                    label: 'Gas',
                                },
                                {
                                    value: 'inputData',
                                    label: 'Input data',
                                },
                                {
                                    value: 'gasUsed',
                                    label: 'Gas used',
                                },
                                {
                                    value: 'cumulativeGasUsed',
                                    label: 'Cumulative Gas used',
                                },
                                {
                                    value: 'effectiveGasPrice',
                                    label: 'Effective Gas price',
                                },
                                {
                                    value: 'createdContract',
                                    label: 'Created contract',
                                },
                                {
                                    value: 'signature',
                                    label: 'Signature',
                                },
                                {
                                    value: 'type',
                                    label: 'Type',
                                },
                                {
                                    value: 'accessList',
                                    label: 'Access list',
                                },
                            ],
                        },
                    }),
                };
                return fields;
            },
        }),
    },
    type: TriggerStrategy.WEBHOOK,
    async onEnable({ propsValue: props, auth, webhookUrl, store }) {
        const txInclude = (field: string) =>
            props.transactionsSetup?.['transactionFields']?.includes(field) || false;
        const blockInclude = (field: string) =>
            props.blockFields.includes(field);
        const includeTransactions = props.includeTransactions;

        try {
            const webhook = await createWebhook(auth, {
                webhook_type: WebhookTypes.GraphQL,
                webhook_url: webhookUrl,
                network: props.network,
                graphql_query: `
query {
  block {
    hash
    ${blockInclude('number') ? 'number' : ''}
    ${
        blockInclude('parent')
            ? `parent { 
      hash 
      ${blockInclude('number') ? 'number' : ''}
    }`
            : ''
    }
    ${blockInclude('transactionRoot') ? 'transactionRoot' : ''}
    ${blockInclude('transactionCount') ? 'transactionCount' : ''}
    ${blockInclude('stateRoot') ? 'stateRoot' : ''}
    ${blockInclude('receiptsRoot') ? 'receiptsRoot' : ''}
    ${blockInclude('gasLimit') ? 'gasLimit' : ''}
    ${blockInclude('gasUsed') ? 'gasUsed' : ''}
    ${blockInclude('baseFeePerGas') ? 'baseFeePerGas' : ''}
    ${blockInclude('timestamp') ? 'timestamp' : ''}
    ${blockInclude('logsBloom') ? 'logsBloom' : ''}
    ${blockInclude('mixHash') ? 'mixHash' : ''}
    ${blockInclude('difficulty') ? 'difficulty' : ''}
    ${blockInclude('totalDifficulty') ? 'totalDifficulty' : ''}
    ${
        includeTransactions
            ? `
      transactions(filter: { addresses: [] }) {
        hash
        ${txInclude('nonce') ? 'nonce' : ''}
        ${txInclude('index') ? 'index' : ''}
        ${txInclude('from') ? `from { address }` : ''}
        ${txInclude('to') ? `to { address }` : ''}
        ${txInclude('value') ? 'value' : ''}
        ${txInclude('gasPrice') ? 'gasPrice' : ''}
        ${txInclude('maxFeePerGas') ? 'maxFeePerGas' : ''}
        ${txInclude('maxPriorityFeePerGas') ? 'maxPriorityFeePerGas' : ''}
        ${txInclude('gas') ? 'gas' : ''}
        ${txInclude('inputData') ? 'inputData' : ''}
        ${txInclude('gasUsed') ? 'gasUsed' : ''}
        ${txInclude('cumulativeGasUsed') ? 'cumulativeGasUsed' : ''}
        ${txInclude('effectiveGasPrice') ? 'effectiveGasPrice' : ''}
        ${txInclude('createdContract') ? `createdContract { address }` : ''}
        ${
            txInclude('signature')
                ? `
        r
        s
        v
        `
                : ''
        }
        ${txInclude('type') ? 'type' : ''}
        ${txInclude('accessList') ? 'accessList' : ''}
        ${
            txInclude('logs')
                ? `logs {
                    index
                    topics
                    account { address }
                    data
        }`
                : ''
        }
      }
    `
            : ''
    }
  }
}          
          `,
            });
            console.log(webhook);
            await store.put(
                'alchemy_webhook_id',
                { id: webhook.id },
                StoreScope.FLOW
            );
        } catch (e) {
            console.error(e);
            throw e;
        }
    },
    async onDisable({ propsValue: props, auth, webhookUrl, store }) {
        const info = await store.get<{ id: string }>(
            'alchemy_webhook_id',
            StoreScope.FLOW
        );
        if (info) {
            await deleteWebhook(auth, info.id);
        }
    },

    async run(context) {
        console.debug('payload received', context.payload.body);
        return [context.payload.body];
    },

    sampleData: sampleBlockHook,
});

export const alchemy = createPiece({
    displayName: 'Alchemy Webhooks',
    auth: AlchemyHooksAuth,
    minimumSupportedRelease: '0.9.0',
    logoUrl:
        'https://raw.githubusercontent.com/tookey-io/icons/main/piece-alchemy.png',
    authors: ['Aler Denisov'],
    actions: [],
    triggers: [BlockEventTrigger, SmartContractEventTrigger],
});
