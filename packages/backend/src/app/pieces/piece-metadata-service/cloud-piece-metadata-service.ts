import { PieceMetadataSchema } from '../piece-metadata-entity'
import { GetParams, PieceMetadataService } from './piece-metadata-service'
import { PieceMetadata, PieceMetadataSummary } from '@activepieces/pieces-framework'
import { AllPiecesStats, pieceStatsService } from './piece-stats-service'
import { StatusCodes } from 'http-status-codes'
import { SystemProp } from '../../helper/system/system-prop'
import { system } from '../../helper/system/system'
import { ActivepiecesError, EXACT_VERSION_PATTERN, ErrorCode } from '@activepieces/shared'

const CLOUD_API_URL = 'https://cloud.activepieces.com/api/v1/pieces'

const handleHttpErrors = async (response: Response): Promise<void> => {
    if (response.status === StatusCodes.NOT_FOUND.valueOf()) {
        throw new ActivepiecesError({
            code: ErrorCode.ENTITY_NOT_FOUND,
            params: {
                message: 'piece not found',
            },
        })
    }

    if (response.status !== StatusCodes.OK.valueOf()) {
        throw new Error(await response.text())
    }
}

export const CloudPieceMetadataService = (): PieceMetadataService => {
    return {
        async list({ release }): Promise<PieceMetadataSummary[]> {
            const response = await fetch(`${system.getOrThrow(SystemProp.CLOUD_API_URL)}?release=${release}`)
            await handleHttpErrors(response)
            return await response.json() as PieceMetadataSummary[]
        },

        async get({ name, version }: GetParams): Promise<PieceMetadata> {
            const response = await fetch(`${system.getOrThrow(SystemProp.CLOUD_API_URL)}/${name}?version=${version}`)
            await handleHttpErrors(response)
            return await response.json() as PieceMetadata
        },

        async create(): Promise<PieceMetadataSchema> {
            throw new Error('operation not supported')
        },

        async delete(): Promise<void> {
            throw new Error('operation not supported')
        },

        async stats(): Promise<AllPiecesStats> {
            return await pieceStatsService.get()
        },

        async getExactPieceVersion({ name, version, projectId }): Promise<string> {
            const isExactVersion = EXACT_VERSION_PATTERN.test(version)

            if (isExactVersion) {
                return version
            }

            const pieceMetadata = await this.get({
                projectId,
                name,
                version,
            })

            return pieceMetadata.version
        },
    }
}
