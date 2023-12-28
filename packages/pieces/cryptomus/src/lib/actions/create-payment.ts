import { ActionContext, DropdownState, PieceAuthProperty, Property, PropertyContext, StoreScope, createAction } from '@activepieces/pieces-framework';
import { Blockchains, CryptomusApi, CryptomusServices, CryptomusTriggerPrefix, Currencies } from '../common';
import { CryptomusAuth } from '../auth';
import crypto from 'crypto'

export const cryptomusCreatePaymentAction = createAction({
    name: 'create_payment',
    displayName: 'Create Payment',
    description: 'Creates new invoice',
    auth: CryptomusAuth,
    requireAuth: true,
    props: {
        amount: Property.Number({
            displayName: 'Amount',
            required: true,
        }),
        currency: Property.StaticDropdown({
            displayName: 'Currency',
            required: true,
            options: {
                disabled: false,
                placeholder: 'Select currency',
                options: [
                    { value: 'USD', label: 'USD' },
                    ...Array.from(new Set(CryptomusServices.map(({ currency }) => currency))).map((c) => ({
                        value: c,
                        label: c,
                    })),
                ],
            },
        }),
        to_currency: Property.StaticDropdown({
            displayName: 'To currency',
            required: false,
            options: {
                disabled: false,
                placeholder: 'Select currency or left blank',
                options: Array.from(new Set(CryptomusServices.map(({ currency }) => currency))).map((c) => ({
                    value: c,
                    label: c,
                })),
            },
        }),
        lifetime: Property.Number({
            displayName: 'Lifetime in seconds',
            required: false,
        }),
        currencies: Property.StaticMultiSelectDropdown({
            displayName: 'Allowed Currencies',
            required: false,
            options: {
                disabled: false,
                placeholder: 'Select currencies or left blank',
                options: CryptomusServices.map(({ currency, network }) => ({
                    value: `${currency}_${network}`,
                    label: `${currency} (${network})`,
                })),
            },
        }),
        except_currencies: Property.StaticMultiSelectDropdown({
            displayName: 'Except Currencies',
            required: false,
            options: {
                disabled: false,
                placeholder: 'Select currencies or left blank',
                options: CryptomusServices.map(({ currency, network }) => ({
                    value: `${currency}|${network}`,
                    label: `${currency} (${network})`,
                })),
            },
        }),
        additional_data: Property.Json({
            displayName: 'Additional data',
            description: 'Additional data to attach to invoice',
            required: false,
        }),
        webhook_slug: Property.ShortText({
            displayName: 'Webhook Slug',
            description: 'Enter slug if you need to catch webhook. Requires flow with Payment Webhook with the same slug',
            required: false
        })
    },
    async run({ auth, propsValue: { amount, currency, to_currency, currencies, except_currencies, webhook_slug, additional_data, lifetime }, store }) {
        const url_callback = webhook_slug ? await store.get<string>(CryptomusTriggerPrefix + webhook_slug, StoreScope.PROJECT).then(r => r || undefined) : undefined;
        if (webhook_slug && !url_callback) {
            throw new Error(`Payment Webhook with ${webhook_slug} slug not found.`)
        }

        return CryptomusApi.createRequest(auth, 'payment', {
            order_id: crypto.randomUUID(),
            amount: amount.toFixed(),
            currency: currency as Currencies,
            to_currency,
            url_callback,
            additional_data: additional_data ? JSON.stringify(additional_data) : undefined,
            lifetime,
            currencies: currencies?.map((c) => ({
                currency: c.split('|')[0] as Currencies,
                network: c.split('|')[1] as Blockchains,
            })),
            except_currencies: except_currencies?.map((c) => ({
                currency: c.split('|')[0] as Currencies,
                network: c.split('|')[1] as Blockchains,
            })),
        });
    },
});
