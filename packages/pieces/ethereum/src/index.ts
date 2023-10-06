import {
  createPiece,
  PieceAuth,
  PieceProperty,
  Property,
  Validators
} from '@activepieces/pieces-framework';
import { isEmpty } from '@activepieces/shared';
import { isAddress } from 'viem';
import { contractCall } from './lib/actions/call';
import {
  erc20allowance,
  erc20approve,
  erc20balance,
  erc20send,
} from './lib/actions/erc20';
import { getNetwork } from './lib/actions/populateNetwork';
import { contractRead } from './lib/actions/read';
import { nativeBalance, nativeSend } from './lib/actions/native';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export const AddressValidator = () => ({
    type: Validators.minLength(1).type,
    fn: (property: PieceProperty, processedValue: any, userInput: any) => {
        if (isEmpty(processedValue)) return null;

        if (isAddress(processedValue)) {
            return null;
        }

        if (
            typeof processedValue === 'string' &&
            processedValue.length > 4 &&
            processedValue.includes('.')
        ) {
            return null;
        }

        return 'Invalid address. Should be an 0x address or ENS';
    },
});

export const EthereumAuth = PieceAuth.CustomAuth({
    description: `
EVM based blockchains (Ethereum, Binance Smart Chain, Polygon, etc.) are supported by this piece.
1) RPC URL
you can use any Node as Service provider [Infura](https://www.infura.io/), [Alchemy](https://www.alchemy.com/), [QuickNode](https://www.quicknode.com/) or your own node)
3) Setup Address (with or without private key/mnemonic)
Allows to populate transaction with nonce, dry run transactions before signing and broadcasting (fail fast)
`,
    required: true,
    props: {
        rpc: Property.ShortText({
            displayName: 'RPC URL',
            description: 'URL of the RPC endpoint',
            required: true,
            validators: [Validators.url],
        }),
        address: Property.ShortText({
            displayName: 'Spectator address',
            description:
                'Sender address without key (allows only populate txs and estimate gas)',
            required: false,
        }),
    },
});

export const ethereum = createPiece({
    displayName: 'EVM Chain (Ethereum-like)',
    description: `
EVM based blockchains (Ethereum, Binance Smart Chain, Polygon, etc.) are supported by this piece.
`,
    auth: EthereumAuth,
    logoUrl:
        'https://raw.githubusercontent.com/tookey-io/icons/main/piece-ethereum.png',
    minimumSupportedRelease: '0.8.0',
    authors: [],
    actions: [
        getNetwork,
        nativeBalance,
        nativeSend,
        contractCall,
        contractRead,
        erc20send,
        erc20approve,
        erc20balance,
        erc20allowance,
    ],
    // actions: [getNetwork, sendNative, contractCall, populateTransaction, broadcastTransaction],
    triggers: [],
});
