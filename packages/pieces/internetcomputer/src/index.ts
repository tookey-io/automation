import {
    ActionContext,
    createAction,
    createPiece,
    PieceAuth,
    PieceAuthProperty,
    Property,
    Validators,
} from '@activepieces/pieces-framework';
import { FungibleMetadata, getTokenActor, Principal } from "@funded-labs/dab-js";
import { createAccountFromMnemonic } from '@funded-labs/plug-controller/dist/utils/account/index';
import { fetchCandid, HttpAgent } from '@dfinity/agent';
import { parseIdl } from '@tookey-io/candid-parser';
import { TOKEN } from '@funded-labs/dab-js/dist/constants/standards';
import { formatUnits, parseUnits } from "viem";

const tokens: string[] = [
    'ryjl3-tyaaa-aaaaa-aaaba-cai',
    'rd6wb-lyaaa-aaaaj-acvla-cai',
    'zfcdd-tqaaa-aaaaq-aaaga-cai',
    'utozz-siaaa-aaaam-qaaxq-cai',
    '2vgyc-jqaaa-aaaao-a2gdq-cai',
    'vtrom-gqaaa-aaaaq-aabia-cai',
    'uf2wh-taaaa-aaaaq-aabna-cai',
    'mxzaz-hqaaa-aaaar-qaada-cai',
    'lcyu6-siaaa-aaaah-adk2a-cai',
    'aanaa-xaaaa-aaaah-aaeiq-cai',
    'xsi2v-cyaaa-aaaaq-aabfq-cai',
    '73mez-iiaaa-aaaaq-aaasq-cai',
    '5573k-xaaaa-aaaak-aacnq-cai',
    'rffwt-piaaa-aaaaq-aabqq-cai',
    'bf7ec-maaaa-aaaag-qcgda-cai',
    'vyisd-zyaaa-aaaah-adpiq-cai',
    'zzriv-cqaaa-aaaao-a2gjq-cai',
    'qi26q-6aaaa-aaaap-qapeq-cai',
    '4c4fd-caaaa-aaaaq-aaa3a-cai',
    'vgqnj-miaaa-aaaal-qaapa-cai',
    '7a6j3-uqaaa-aaaao-a2g5q-cai',
    'djjfs-tyaaa-aaaak-qagtq-cai',
    '2ouva-viaaa-aaaaq-aaamq-cai',
    '5gxp5-jyaaa-aaaag-qarma-cai',
    'lzvjb-wyaaa-aaaam-qarua-cai',
    'j4tiv-oaaaa-aaaan-qau7a-cai',
    'e2gn7-5aaaa-aaaal-abata-cai',
    'ilmem-diaaa-aaaak-actma-cai',
    'iy6hh-xaaaa-aaaan-qauza-cai',
    'ar2zl-5qaaa-aaaan-qavoa-cai',
    '72uqs-pqaaa-aaaak-aes7a-cai',
    'es3he-kyaaa-aaaah-abzna-cai',
    '6rdgd-kyaaa-aaaaq-aaavq-cai',
    'vlzzc-eaaaa-aaaah-ade2q-cai',
    'pcj6u-uaaaa-aaaak-aewnq-cai',
];

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export const InternetComputerConnection = PieceAuth.CustomAuth({
    description: `
You're open to setup credentials for InternetComputer wallet or left it blank.

Without any private key or address you will be limited to use only read methods of InternetComputer.

Public hosts: 
Mainnet: https://icp-api.io
`,
    required: true,
    props: {
        host: Property.ShortText({
            required: true,
            displayName: 'Host',
            description:
                'Host of InternetComputer node. (Public is `https://icp-api.io`)',
        }),
        address: Property.ShortText({
            required: false,
            displayName: 'Address',
            description:
                "If you're using external or tookey signer you can enter your address here.",
        }),
        privateKey: PieceAuth.SecretText({
            required: false,
            displayName: 'Private Key',
            description:
                "If you're using plain private key you can enter it here.",
        }),
        mnemonic: PieceAuth.SecretText({
            required: false,
            validators: [Validators.pattern(/^([a-z]+\s){11,23}[a-z]+$/)],
            displayName: 'Mnemonic Phrase',
            description:
                "If you're using mnemonic phrase you can enter it here.",
        }),
    },
});

export const ReadBalance = createAction({
    requireAuth: true,
    auth: InternetComputerConnection,
    name: 'read_balance',
    displayName: 'Read Token Balance',
    description: 'Returns balance of token for given (or connection) address.',
    props: {
        token: Property.ShortText({
            required: true,
            displayName: 'Token',
            description: 'Token canister id to read balance from.',
        }),
        standard: Property.StaticDropdown({
            displayName: 'Standard',
            required: true,
            options: {
                disabled: false,
                placeholder: 'Select token standard',
                options: Object.values(TOKEN).map((value) => ({
                    value,
                    label: value,
                })),
            },
        }),
        address: Property.ShortText({
            required: false,
            displayName: 'Address',
            description:
                'Address of account to read balance from. (Or leave blank to use connection address)',
        }),
    },
    async run(ctx) {
      const address = ctx.propsValue.address || ctx.auth.address;
      if (!address) {
        throw new Error('Address is required');

      }
        const agent = new HttpAgent({ host: ctx.auth.host, fetch });
        const token = await getTokenActor(({
          canisterId: ctx.propsValue.token,
          agent: agent as any, // TODO: figure out type issue
          standard: ctx.propsValue.standard,
        }))
        const [balance, meta] = await Promise.all([
          token.getBalance(Principal.fromText(address)),
          token.getMetadata().then((metadata) => "fungible" in metadata ? metadata as FungibleMetadata : null),
        ]);

        const { decimals, symbol, name } = meta?.fungible || { decimals: 0, symbol: 'N/A', name: 'N/A' };

        const parsedBalance = formatUnits(BigInt(balance.value), decimals)
        
        return {
          balance: balance.value,
          decimals,
          symbol,
          name,
          parsedBalance,
        }
    },
});

export const InternetComputer = createPiece({
    displayName: 'InternetComputer',
    auth: InternetComputerConnection,
    minimumSupportedRelease: '0.8.0',
    logoUrl:
        'https://raw.githubusercontent.com/tookey-io/icons/main/piece-internetcomputer.png',
    authors: ['Aler Denisov'],
    actions: [ReadBalance],
    triggers: [],
    tags: ['@tookey-io'],
});
