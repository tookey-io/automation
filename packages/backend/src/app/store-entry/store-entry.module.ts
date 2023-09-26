import { storeEntryController } from './store-entry.controller'
import { allowWorkersOnly, entitiesMustBeOwnedByCurrentProject } from '../authentication/authorization'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

export const storeEntryModule: FastifyPluginAsyncTypebox = async (app) => {
    app.addHook('preSerialization', entitiesMustBeOwnedByCurrentProject)
    app.addHook('onRequest', allowWorkersOnly)
    await app.register(storeEntryController, { prefix: '/v1/store-entries' })
}
