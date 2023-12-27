import { ArrayContains, ArrayOverlap, Equal, ILike } from 'typeorm'
import { databaseConnection } from '../../database/database-connection'
import { ActivepiecesError, ListFlowTemplatesRequest, ErrorCode, FlowTemplate, SeekPage, isNil, apId, FlowVersionTemplate, flowHelper, TemplateType } from '@activepieces/shared'
import { FlowTemplateEntity } from './flow-template.entity'
import { CreateFlowTemplateRequest } from '@activepieces/ee-shared'
import { paginationHelper } from '../../helper/pagination/pagination-utils'

const templateRepo = databaseConnection.getRepository<FlowTemplate>(FlowTemplateEntity)

export const flowTemplateService = {
    upsert: async (platformId: string | undefined, projectId: string | undefined, { description,  type, template, blogUrl, tags, id }: CreateFlowTemplateRequest): Promise<FlowTemplate> => {
        const flowTemplate: FlowVersionTemplate = template
        await templateRepo.upsert({
            id: id ?? apId(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            template: flowTemplate as any,
            name: flowTemplate.displayName,
            description: description ?? '',
            pieces: flowHelper.getUsedPieces(flowTemplate.trigger),
            blogUrl,
            type,
            tags,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            platformId,
            projectId,
        }, ['id'])
        return templateRepo.findOneByOrFail({
            id,
        })
    },
    list: async (platformId: string, { pieces, tags, search }: ListFlowTemplatesRequest): Promise<SeekPage<FlowTemplate>> => {
        const commonFilters: Record<string, unknown> = {}
        if (pieces) {
            commonFilters.pieces = ArrayOverlap(pieces)
        }
        if (tags) {
            commonFilters.tags = ArrayContains(tags)
        }
        if (search) {
            commonFilters.name = ILike(`%${search}%`)
            commonFilters.description = ILike(`%${search}%`)
        }
        commonFilters.platformId = Equal(platformId)
        commonFilters.type = Equal(TemplateType.PLATFORM)
        const templates = await templateRepo.createQueryBuilder('flow_template')
            .where(commonFilters)
            .getMany()
        return paginationHelper.createPage(templates, null)
    },
    getOrThrow: async (id: string): Promise<FlowTemplate> => {
        const template = await templateRepo.findOneBy({
            id,
        })
        if (isNil(template)) {
            throw new ActivepiecesError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    message: `Flow template ${id} is not found`,
                },
            })
        }
        return template
    },
    async delete({ id }: { id: string }): Promise<void> {
        await templateRepo.delete({
            id,
        })
    },
}

