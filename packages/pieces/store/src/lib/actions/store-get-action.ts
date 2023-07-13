import { createAction, Property, StoreScope } from "@activepieces/pieces-framework";


export const storageGetAction = createAction({
    name: 'get',
    displayName: 'Get',
    description: 'Get a value from storage',
    props: {
        key: Property.ShortText({
            displayName: 'Key',
            required: true
        }),
        defaultValue: Property.ShortText({
            displayName: 'Default Value',
            required: false
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
    async run({store, propsValue}) {
        return await store.get(propsValue['key'], propsValue.store_scope) ?? propsValue['defaultValue'];
    }
});
