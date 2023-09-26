import {
    HttpMessageBody,
    HttpMethod,
    httpClient,
} from '@activepieces/pieces-common';
import { EPN_API_URL } from '../constants';

export const AccountTypesMap = {
    '0': 'default',
    '2': 'card',
    '3': 'partner',
    '4': 'master',
    '5': 'team',
    '6': 'deposit',
    '7': 'provider',
    '8': 'withdraw',
    '9': 'employee',
};

export const AccountStatusesMap = {
    '0': 'active',
    '15': 'deleted',
};



type ApiBoolean = true | '1';

interface LinksDto {
    first: string;
    last: string;
    prev: string;
    next: string;
}

interface LinkMetaDto {
    url: string;
    label: string;
    active: boolean;
}

interface MetaDto {
    current_page: number;
    from: number;
    last_page: number;
    links: LinkMetaDto[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface TariffDto {
    id: number;
    name: string;
    slug: string;
    card_count_min: number;
    card_count_max: number;
    card_price: string;
    replace_price: string;
    start_balance: string;
    duration: number;
    type: number;
    fee_topup: number;
}

interface CardDto {
    holder_name: string;
    holder_address: string;
    mask: string;
    user_uuid: string;
    user_account_uuid: string;
    topup_waiting: false;
    tariff: TariffDto;
    favorite: boolean;
    status: boolean;
    ordered_at: string;
    ordered_until: string;
    created_at: string;
    blocked_at: string;
    uuid: string;
    notifiable: 0;
    description: string;
    external_id: string;
    in_subscription: true;
    not_reorder: true;
    is_auto_replenished: true;
    auto_replenishment: {
        minimum: 10;
        sum: 20;
        last_failed_try_on: string;
        created_at: string;
        updated_at: string;
    };
    card_bin: {
        bin: 5371001;
        is_credit: 0;
        is_3ds: 1;
        type: string;
    };
    account: {
        type: 0;
        currency_id: 1;
        iban: string;
        description: string;
        balance: 10.01;
        status: 0;
        uuid: string;
        created_at: string;
        updated_at: string;
        team: {
            uuid: string;
            title: string;
            type: 1;
            description: string;
        };
        available: {
            limit: 1;
            spend: 1;
            balance: 1;
            from: 1;
        };
        my_role: string;
    };
    team: {
        uuid: string;
        title: string;
        description: string;
        users_count: 10;
        active_cards_count: 10;
        settings: {};
        my_role: string;
        available: {
            limit: 1;
            spend: 1;
            balance: 1;
            from: 1;
        };
        accounts_balance: 10;
        my_cards_balance: 10;
        join_request_count: 10;
        blocked_cards_count: 10;
        invite_uuid: string;
        owner: {
            uuid: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        join_date: string;
    };
    teammate: {
        uuid: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    telegram_notification_options: [
        {
            label: string;
            type_id: 4;
            is_enabled: true;
        }
    ];
    tags: [
        {
            id: 1;
            name: string;
        }
    ];
}

interface AccountDto {
    uuid: string;
    type: keyof typeof AccountTypesMap;
    currency_id: number;
    iban: string;
    description: any;
    balance: number;
    status: number;
    created_at: string;
    updated_at: string;
    team: any;
    teammate: any;
    my_role: any;
}

interface AllCardsRequestDto {
    status: number;
    type: 'all' | 'adv';
    only_teams: ApiBoolean;
    teammate_uuid: string;
    favorite: ApiBoolean;
    is_3ds: ApiBoolean;
    with_replenishments: ApiBoolean;
    search: string;
    balance_from: number;
    balance_to: number;
    description: string;
    external_id: string;
    sort: string;
    direction: 'asc' | 'desc';
    tag: number[];
}

interface AllCardsResponseDto {
    data: CardDto[];
    links?: LinksDto;
    meta?: MetaDto;
}

interface AccountsResponseDto {
    data: AccountDto[];
    links?: LinksDto;
    meta?: MetaDto;
}

interface TopupResponseDto {
    data: {
        payload: {
            btc: string;
            btc_rate: string;
            btc_sum: number;
            usdt: string;
            usdt_rate: string;
            usdt_sum: number;
        };
        amount: number;
        payment_system: string;
    };
    success: true;
}
export const createApi = (auth: string, baseUrl = EPN_API_URL) => {
    const request = <
        TResponse extends HttpMessageBody,
        TRequest extends HttpMessageBody
    >(
        path: string,
        method: HttpMethod,
        data?: TRequest
    ) =>
        httpClient
            .sendRequest<TResponse>({
                url: `${baseUrl.replace(/\/$/, "")}${path}`,
                method,
                headers: {
                    Authorization: 'Bearer ' + auth,
                },
                queryParams: method === HttpMethod.GET ? data : undefined,
                body: method !== HttpMethod.GET ? data : undefined,
            })
            .then((response) => response.body);
    return {
        cards: {
            getAll: async (
                params?: Partial<AllCardsRequestDto>
            ): Promise<AllCardsResponseDto> =>
                request('/card', HttpMethod.GET, params),
            delete: async (cardIds: string[]): Promise<{ status: boolean }> =>
                request(`/card`, HttpMethod.DELETE, {
                    card_uuids: cardIds,
                }),
        },
        accounts: {
            getAll: async (): Promise<AccountsResponseDto> =>
                request('/account', HttpMethod.GET),
            get: async (uuid: string): Promise<{ data: AccountDto }> =>
                request(`/account/${uuid}`, HttpMethod.GET),
        },

        topup: async (amount: number): Promise<TopupResponseDto> =>
            request(`/payment/create/merchant`, HttpMethod.POST, { amount }),
    };
};
