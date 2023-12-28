import { ActionContext, PieceAuthProperty, Property, createAction } from '@activepieces/pieces-framework';
import { CryptomusAuth } from '../auth';
import { CryptomusApi, Payment } from '../common';

function formatNumber(num: number, length: number) {
    let result = num.toString();
    while (result.length < length) result = '0' + result;
    return result;
}

function createNewDate(date: Date, TF: string) {
    const year = formatNumber(date.getFullYear(), 4);
    const result = TF.replace('YYYY', year)
        .replace('YY', year.substring(2, 4))
        .replace('MMMM', date.toLocaleString('default', { month: 'long' }))
        .replace('MMM', date.toLocaleString('default', { month: 'short' }))
        .replace('MM', formatNumber(date.getMonth() + 1, 2))
        .replace('DDDD', date.toLocaleString('default', { weekday: 'long' }))
        .replace('DDD', date.toLocaleString('default', { weekday: 'short' }))
        .replace('DD', formatNumber(date.getDate(), 2))
        .replace('HH', formatNumber(date.getHours(), 2))
        .replace('mm', formatNumber(date.getMinutes(), 2))
        .replace('ss', formatNumber(date.getSeconds(), 2))
        .replace('X', (date.getTime() / 1000).toString());
    return result;
}

export const cryptomusGetPaymentsHistory = createAction({
    name: 'payments_history',
    displayName: 'Get Payments',
    description: 'Returns list of payments',
    auth: CryptomusAuth,
    requireAuth: true,
    props: {
        date_from: Property.DateTime({
            displayName: 'Date from',
            required: false,
        }),
        date_to: Property.DateTime({
            displayName: 'Date to',
            required: false,
        }),
    },
    async run(ctx) {
        const payments: Payment[] = [];
        const { date_from, date_to } = ctx.propsValue;
        let current = await CryptomusApi.createRequest(
            ctx.auth,
            'payment_list',
            date_from || date_to
                ? {
                      date_from: date_from ? createNewDate(new Date(date_from), 'YYYY-MM-DD HH:mm:ss') : undefined,
                      date_to: date_to ? createNewDate(new Date(date_to), 'YYYY-MM-DD HH:mm:ss') : undefined,
                  }
                : undefined
        );

        if (current.result && Array.isArray(current.result.items) && current.result.items.length)
            payments.push(...current.result.items);

        // console.log(payments, current.paginate);
        while (current.paginate && current.paginate.hasPages && current.paginate.nextCursor) {
            current = await CryptomusApi.createRequest(ctx.auth, 'payment_list', {
                cursor: current.paginate.nextCursor,
            });
            if (current.result && Array.isArray(current.result.items) && current.result.items.length)
                payments.push(...current.result.items);
        }

        return payments;
    },
});
