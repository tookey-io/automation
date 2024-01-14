import { FastifyPluginCallbackTypebox, Type } from '@fastify/type-provider-typebox'
import { gitRepoService } from './git-repo.service'
import { PrincipalType, SeekPage } from '@activepieces/shared'
import { ConfigureRepoRequest, GitRepoWithoutSenestiveData, PushGitRepoRequest } from '@activepieces/ee-shared'
import { StatusCodes } from 'http-status-codes'


export const gitRepoController: FastifyPluginCallbackTypebox = (app, _options, done): void => {

    app.post('/', ConfigureRepoRequestSchema, async (request, reply) => {
        await reply.status(StatusCodes.CREATED).send(await gitRepoService.upsert(request.body))
    })

    app.get('/', ListRepoRequestSchema, async (request) => {
        return gitRepoService.list(request.query)
    })

    app.post('/:id/push', PushRepoRequestSchema, async (request) => {
        await gitRepoService.push({
            id: request.params.id,
            commitMessage: request.body.commitMessage,
        })
    })

    app.post('/:id/pull', PullRepoRequestSchema, async (request) => {
        await gitRepoService.pull({
            id: request.params.id,
        })
    })

    app.delete('/:id', DeleteRepoRequestSchema, async (request, reply) => {
        await gitRepoService.delete({
            id: request.params.id,
            projectId: request.principal.projectId,
        })
        await reply.status(StatusCodes.NO_CONTENT).send()
    })

    done()
}

const DeleteRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.SERVICE, PrincipalType.USER],
    },
    schema: {
        tags: ['git-repo'],
        description: 'Delete a git repository information for a project.',
        params: Type.Object({
            id: Type.String(),
        }),
        response: {
            [StatusCodes.NO_CONTENT]: Type.Undefined(),
        },
    },
}

const PullRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.SERVICE, PrincipalType.USER],
    },
    schema: {
        tags: ['git-repo'],
        description: 'Pull all changes from the git repository and overwrite any conflicting changes in the project.',
        params: Type.Object({
            id: Type.String(),
        }),
        response: {
            [StatusCodes.NO_CONTENT]: Type.Undefined(),
        },
    },
}

const PushRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.SERVICE, PrincipalType.USER],
    },
    schema: {
        tags: ['git-repo'],
        description: 'Push all changes from the project and overwrite any conflicting changes in the git repository.',
        body: PushGitRepoRequest,
        params: Type.Object({
            id: Type.String(),
        }),
        response: {
            [StatusCodes.NO_CONTENT]: Type.Undefined(),
        },
    },
}

const ConfigureRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.SERVICE, PrincipalType.USER],
    },
    schema: {
        tags: ['git-repo'],
        description: 'Upsert a git repository information for a project.',
        body: ConfigureRepoRequest,
        response: {
            [StatusCodes.CREATED]: GitRepoWithoutSenestiveData,
        },
    },
}

const ListRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.SERVICE, PrincipalType.USER],
    },
    schema: {
        tags: ['git-repo'],
        querystring: Type.Object({
            projectId: Type.String(),
        }),
        response: {
            [StatusCodes.OK]: SeekPage(GitRepoWithoutSenestiveData),
        },
    },
}