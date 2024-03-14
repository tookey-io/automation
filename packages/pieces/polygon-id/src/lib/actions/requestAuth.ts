import { ActionContext, PieceAuthProperty, Property, StoreScope, createAction } from "@activepieces/pieces-framework";
import { auth, resolver, protocol } from '@iden3/js-iden3-auth'
import { initializeContext } from "../initializeContext";
import { PolygonIdAuth } from "../..";
import { STORAGE_IDEN3_URL } from "../constants";
import QRCode from 'qrcode'

export const requestAuth = createAction({
    name: "request_auth",
    displayName: "Request Auth",
    description: "Creates authentication request",
    auth: PolygonIdAuth,
    props: {},
    async run(ctx) {
        const state = await initializeContext(ctx);
        const request = auth.createAuthorizationRequest("Testing purpose", state.me.did.string(), `${ctx.serverUrl}v1/flow-runs/${ctx.run.id}/resume/sync?action=return`)
        const file = await QRCode.toDataURL(JSON.stringify(request))
        return {
            request,
            file
        }
    }
})