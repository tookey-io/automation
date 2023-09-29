import { NonAuthPieceProperty, Property } from '@activepieces/pieces-framework';
import { CallParameters } from 'viem';

type PropsDef<T> = {
    field: T,
    name?: string,
    description?: string,
    required?: boolean,
}

export const makeTransactionReadProps = <TFields extends keyof CallParameters>(
    ...fields: (TFields | PropsDef<TFields>)[]
): Record<TFields | "overrides" | "failOnRevert", NonAuthPieceProperty> => {
    const props = {} as Record<TFields, NonAuthPieceProperty>;
    fields.forEach((field) => {
        const def = typeof field === 'string' ? {
            field,
        } : field;
        if (def.field === 'value')
            props[def.field] = Property.ShortText({
                displayName: def.name ?? 'Value (Native)',
                description: def.description ?? 'Value to send with transaction (native currency in human readable form, such as 1.5)',
                required: def.required ?? false,
            });

        if (def.field === 'account')
            props[def.field] = Property.ShortText({
                displayName: def.name ?? 'From',
                description: def.description ?? 'From address or ENS name (will overrides provided by connection)',
                required: def.required ?? false,
            });

        if (def.field === 'to')
            props[def.field] = Property.ShortText({
                displayName: def.name ?? 'To',
                description: def.description ?? 'To address or ENS name',
                required: def.required ?? true,
            });
    });

    return {
        ...props,
        failOnRevert: Property.Checkbox({
            displayName: 'Fail on revert',
            description: 'Fail if the transaction simulation reverts',
            required: false,
            defaultValue: true,
        }),
        overrides: Property.Object({
            displayName: 'Call overrides (gasLimit, gasPrice, nonce, etc.)',
            required: false,
        }),
    }
};

export const makeTransactionCallProps = <TFields extends keyof CallParameters>(
    ...fields: (TFields | PropsDef<TFields>)[]
): Record<TFields | "populate" | "failOnRevert" | "overrides", NonAuthPieceProperty> => {
    const props = makeTransactionReadProps(...fields);
    return {
        ...props, 

        populate: Property.Checkbox({
            displayName: 'Populate',
            description:
                'Populate transaction from network (gas, nonce, simulation)',
            required: false,
            defaultValue: true,
        }),
        failOnRevert: props.failOnRevert,
        overrides: props.overrides
    };
};
