import { BasicAuthPropertyValue, NonAuthPiecePropertyMap, OAuth2PropertyValue, OAuth2Props, PieceAuthProperty, Property, StaticPropsValue, Store, StoreScope, TestOrRunHookContext, TriggerStrategy, createTrigger } from "@activepieces/pieces-framework";
import { TriggerPayload } from "@activepieces/shared";
import { CryptomusTriggerPrefix } from "../common";

export const cryptomusPaymentTrigger = createTrigger({
    name: "payment_webhook",
    displayName: "Payment Webhook",
    description: "Creates webhook to listen for payments updates",
    props: {
        slug: Property.ShortText({
            displayName: "Slug",
            description: "Unique slug to attach webhook with created invoices",
            required: true
        })
    },
    type: TriggerStrategy.WEBHOOK,
    async onEnable(ctx) {
        await ctx.store.put(CryptomusTriggerPrefix + ctx.propsValue.slug, ctx.webhookUrl, StoreScope.PROJECT)
    },
    async onDisable(ctx) {
        await ctx.store.delete(CryptomusTriggerPrefix + ctx.propsValue.slug, StoreScope.PROJECT)
    },
    async run(ctx) {
        return [ctx.payload.body]
    },
    sampleData: {}
})