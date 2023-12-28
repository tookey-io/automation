import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import crypto from 'crypto';

export const CryptomusTriggerPrefix = 'CRYPTOMUS_'

export const CryptomusServices = [
    {
        network: 'ETH',
        currency: 'VERSE',
        is_available: true,
        limit: {
            min_amount: '2500.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'ETH',
        currency: 'DAI',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'BSC',
        currency: 'ETH',
        is_available: true,
        limit: {
            min_amount: '0.01000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'BSC',
        currency: 'USDT',
        is_available: true,
        limit: {
            min_amount: '0.50000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'DOGE',
        currency: 'DOGE',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'POLYGON',
        currency: 'DAI',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'POLYGON',
        currency: 'MATIC',
        is_available: true,
        limit: {
            min_amount: '0.50000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'ETH',
        currency: 'USDT',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'BSC',
        currency: 'CGPT',
        is_available: true,
        limit: {
            min_amount: '10.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'ARBITRUM',
        currency: 'USDT',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'SOL',
        currency: 'SOL',
        is_available: true,
        limit: {
            min_amount: '0.00010000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'ARBITRUM',
        currency: 'ETH',
        is_available: true,
        limit: {
            min_amount: '0.01000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'ETH',
        currency: 'ETH',
        is_available: true,
        limit: {
            min_amount: '0.01000000',
            max_amount: '1000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'BSC',
        currency: 'BNB',
        is_available: true,
        limit: {
            min_amount: '0.00500000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'BTC',
        currency: 'BTC',
        is_available: true,
        limit: {
            min_amount: '0.00002000',
            max_amount: '100.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'TON',
        currency: 'TON',
        is_available: true,
        limit: {
            min_amount: '0.10000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'BSC',
        currency: 'USDC',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'TRON',
        currency: 'TRX',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '2000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'LTC',
        currency: 'LTC',
        is_available: true,
        limit: {
            min_amount: '0.02000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'ETH',
        currency: 'USDC',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'TRON',
        currency: 'USDT',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'ARBITRUM',
        currency: 'USDC',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'AVALANCHE',
        currency: 'AVAX',
        is_available: true,
        limit: {
            min_amount: '0.10000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'TRON',
        currency: 'USDC',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'AVALANCHE',
        currency: 'USDT',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'BCH',
        currency: 'BCH',
        is_available: true,
        limit: {
            min_amount: '0.00100000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'XMR',
        currency: 'XMR',
        is_available: true,
        limit: {
            min_amount: '0.00100000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'POLYGON',
        currency: 'USDC',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'ETH',
        currency: 'MATIC',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'AVALANCHE',
        currency: 'USDC',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'POLYGON',
        currency: 'USDT',
        is_available: true,
        limit: {
            min_amount: '0.50000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'BSC',
        currency: 'DAI',
        is_available: true,
        limit: {
            min_amount: '1.00000000',
            max_amount: '10000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
    {
        network: 'DASH',
        currency: 'DASH',
        is_available: true,
        limit: {
            min_amount: '0.02000000',
            max_amount: '1000000.00000000',
        },
        commission: {
            fee_amount: '0.00',
            percent: '0.60',
        },
    },
] as const;

type CryptomusAuthData = {
    merchant: string;
    apiKey: string;
};

export type Currencies = (typeof CryptomusServices)[number]['currency'] | 'USD' | 'EUR' | 'RUB';
export type Blockchains = (typeof CryptomusServices)[number]['network'];

export enum ExchangeRates {
    Binance = 'Binance',
    BinanceP2P = 'BinanceP2P',
    Exmo = 'Exmo',
    Kucoin = 'Kucoin',
    Garantexio = 'Garantexio',
}

export enum PaymentStatus {
    // The payment was successful and the client paid exactly as much as required.
    paid = 'paid',
    // The payment was successful and client paid more than required.
    paid_over = 'paid_over',
    // The client paid less than required
    wrong_amount = 'wrong_amount',
    // Payment in processing
    process = 'process',
    // We have seen the transaction in the blockchain and are waiting for the required number of network confirmations.
    confirm_check = 'confirm_check',
    // The client paid less than required, with the possibility of an additional payment
    wrong_amount_waiting = 'wrong_amount_waiting',
    // The payment is verified
    check = 'check',
    // Payment error
    fail = 'fail',
    // Payment cancelled, the client did not pay
    cancel = 'cancel',
    // A system error has occurred
    system_fail = 'system_fail',
    // The refund is being processed
    refund_process = 'refund_process',
    // An error occurred during the refund
    refund_fail = 'refund_fail',
    // The refund was successful
    refund_paid = 'refund_paid',
    // Funds are locked due to the AML program
    locked = 'locked',
}

export type Payment = {
    uuid: string;
    order_id: string;
    amount: string;
    payment_amount: string;
    payer_amount: string;
    discount_percent: number;
    discount: string;
    payer_currency: Currencies | null;
    currency: Currencies;
    merchant_amount: string | null;
    network: Blockchains;
    address: string;
    from: string | null;
    txid: string | null;
    payment_status: PaymentStatus;
    url: string;
    expired_at: number;
    is_final: boolean;
    additional_data: string | null;
    created_at: string;
    updated_at: string;
};

export type Currency = {
    currency: Currencies;
    network: Blockchains;
};

type CryptomusMethods = {
    payment: (args: {
        amount: string;
        currency: Currencies;
        order_id: string;
        network?: string;
        url_return?: string;
        url_success?: string;
        url_callback?: string;
        is_payment_multiple?: boolean;
        lifetime?: number;
        to_currency?: Currencies;
        subtract?: number;
        accuracy_payment_percent?: number;
        additional_data?: string;
        currencies?: Currency[];
        except_currencies?: Currency[];
        course_source?: ExchangeRates;
        from_referral_code?: string;
        discount_percent?: number;
        is_refresh?: boolean;
    }) => Payment;
    payment_info: (args: { uuid: string } | { order_id: string }) => Payment;
    payment_services: (args?: undefined) => Array<(typeof CryptomusServices)[number]>;
    payment_list: (args?: { date_from?: string; date_to?: string } | { cursor: string }) => { items: Payment[] };
};

type CryptomusResponse<T> = {
    state: 0;
    result: T;
    paginate?: {
        count: number;
        hasPages: boolean;
        nextCursor: string;
        previousCursor: string;
        perPage: number;
    };
};

export const CryptomusApi = {
    createRequest: async <T extends keyof CryptomusMethods>(
        auth: CryptomusAuthData,
        method: T,
        args: Parameters<CryptomusMethods[T]>[0]
    ) => {
        console.log(method, args)
        const sign = crypto
            .createHash('md5')
            .update(args ? Buffer.from(JSON.stringify(args)).toString('base64') : "")
            .update(auth.apiKey)
            .digest('hex');

        return httpClient
            .sendRequest<CryptomusResponse<ReturnType<CryptomusMethods[T]>>>({
                url: 'https://api.cryptomus.com/v1/' + method.replaceAll('_', '/'),
                method: HttpMethod.POST,
                body: args,
                headers: {
                    merchant: auth.merchant,
                    sign,
                },
            })
            .then((r) => r.body);
    },
};

// cryptomus.createRequest({} as any, 'createInvoice', {
//     amount: 0,
//     currency: "ETH",
//     order_id: ""
// })
