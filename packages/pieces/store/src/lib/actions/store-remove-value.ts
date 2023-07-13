import { createAction, Property, StoreScope } from "@activepieces/pieces-framework";

export const storageRemoveValue = createAction({
    name: 'remove_value',
    displayName: 'Remove',
    description: 'Remove a value from storage',
    props: {
        key: Property.ShortText({
            displayName: 'Key',
            required: true
        }),
        store_scope: Property.StaticDropdown({
            displayName: 'Store Scope',
            description: 'The storage scope of the value.',
            required: true,
            options: {
                options: [
                    {
                        label: "Project",
                        value: StoreScope.PROJECT
                    },
                    {
                        label: "Flow",
                        value: StoreScope.FLOW
                    }
                ]
            },
            defaultValue: StoreScope.PROJECT
        })
    },
    async run(context) {
        return await context.store.delete(context.propsValue['key'], context.propsValue.store_scope);
    }
});
