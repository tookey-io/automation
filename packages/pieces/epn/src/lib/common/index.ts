import { DropdownState, Property } from '@activepieces/pieces-framework';
import { AccountTypesMap, createApi } from '../api';
import { EPN_API_URL } from '../../constants';

export const EPNCommon = {
    topUpCurrency: Property.StaticDropdown({
        displayName: 'Topup currency',
        required: true,
        options: {
            options: [
                { label: 'BTC', value: 'btc' },
                { label: 'USDT TR20', value: 'usdt_tron' },
            ],
        },
    }),
    account: Property.Dropdown({
        displayName: 'Account',
        required: true,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) {
                return {
                    disabled: true,
                    options: [],
                    placeholder: 'Please connect your account',
                };
            }

            try {
                const accounts = await createApi(
                    auth as string,
                    EPN_API_URL
                ).accounts.getAll();

                return {
                    disabled: false,
                    options: accounts.data.map((acc) => ({
                        value: acc.uuid,
                        label: AccountTypesMap[acc.type] + ' $' + acc.balance,
                    })),
                };
            } catch (e: any) {
                console.debug(e);
                return {
                    disabled: true,
                    options: [],
                    placeholder:
                        'toString' in e && typeof e.toString === 'function'
                            ? e.toString()
                            : `${e}`,
                };
            }
        },
    }),
};
