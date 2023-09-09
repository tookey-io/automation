import { Equal, FindOperator, IsNull, LessThan, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { databaseConnection } from '../../database/database-connection'
import { PieceMetadataEntity, PieceMetadataSchema } from '../piece-metadata-entity'
import { GetParams, ListParams, PieceMetadataService } from './piece-metadata-service'
import { PieceMetadata, PieceMetadataSummary } from '@activepieces/pieces-framework'
import { EXACT_VERSION_PATTERN, isNil } from '@activepieces/shared'
import { ActivepiecesError, ErrorCode, apId } from '@activepieces/shared'
import { AllPiecesStats, pieceStatsService } from './piece-stats-service'
import * as semver from 'semver'

const repo = databaseConnection.getRepository(PieceMetadataEntity)

export const DbPieceMetadataService = (): PieceMetadataService => {
    return {
        async list({ release, projectId }: ListParams): Promise<PieceMetadataSummary[]> {
            const order = {
                name: 'ASC',
                version: 'DESC',
            } as const

            const pieceMetadataEntityList = await repo.createQueryBuilder()
                .where([
                    {
                        minimumSupportedRelease: LessThanOrEqual(release),
                        maximumSupportedRelease: MoreThanOrEqual(release),
                        projectId: Equal(projectId),
                    },
                    {
                        minimumSupportedRelease: LessThanOrEqual(release),
                        maximumSupportedRelease: MoreThanOrEqual(release),
                        projectId: IsNull(),
                    },
                ])
                .distinctOn(['name'])
                .orderBy(order)
                .getMany()
            return toPieceMetadataSummary(pieceMetadataEntityList)
        },

        async get({ name, version, projectId }: GetParams): Promise<PieceMetadata> {
            const projectPiece: Record<string, unknown> = {
                name,
                projectId: Equal(projectId),
            }
            const officialPiece: Record<string, unknown> = {
                name,
                projectId: IsNull(),
            }
            if (version) {
                projectPiece.version = findSearchOperation(version)
                officialPiece.version = findSearchOperation(version)
            }
            const pieceMetadataEntity = await repo.createQueryBuilder()
                .where([
                    projectPiece,
                    officialPiece,
                ])
                .distinctOn(['name'])
                .orderBy({
                    name: 'ASC',
                    version: 'DESC',
                } as const)
                .getOne()

            if (isNil(pieceMetadataEntity)) {
                throw new ActivepiecesError({
                    code: ErrorCode.ENTITY_NOT_FOUND,
                    params: {
                        message: `piece_metadata_not_found name=${name} version=${version}`,
                    },
                })
            }

            return toPieceMetadata(pieceMetadataEntity)
        },

        async create({ projectId, pieceMetadata }): Promise<PieceMetadataSchema> {
            const existingMetadata = await repo.findOneBy({
                name: pieceMetadata.name,
                version: pieceMetadata.version,
                projectId: projectId ?? IsNull(),
            })
            if (!isNil(existingMetadata)) {
                throw new ActivepiecesError({
                    code: ErrorCode.VALIDATION,
                    params: {
                        message: `piece_metadata_already_exists name=${pieceMetadata.name} version=${pieceMetadata.version} projectId=${projectId}`,
                    },
                })
            }
            return await repo.save({
                id: apId(),
                projectId: projectId ?? undefined,
                ...pieceMetadata,
            })
        },

        async delete({ projectId, id }): Promise<void> {
            const existingMetadata = await repo.findOneBy({
                id,
                projectId: projectId ?? IsNull(),
            })
            if (isNil(existingMetadata)) {
                throw new ActivepiecesError({
                    code: ErrorCode.ENTITY_NOT_FOUND,
                    params: {
                        message: `piece_metadata_not_found id=${id}`,
                    },
                })
            }
            await repo.delete({
                id,
                projectId: projectId ?? undefined,
            })
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

const toPieceMetadataSummary = (pieceMetadataEntityList: PieceMetadataSchema[]): PieceMetadataSummary[] => {
    return pieceMetadataEntityList.map(pieceMetadataEntity => {
        return {
            ...pieceMetadataEntity,
            actions: Object.keys(pieceMetadataEntity.actions).length,
            triggers: Object.keys(pieceMetadataEntity.triggers).length,
        }
    })
}

const toPieceMetadata = (pieceMetadataEntity: PieceMetadataSchema): PieceMetadata => {
    return {
        ...pieceMetadataEntity,
        actions: pieceMetadataEntity.actions,
        triggers: pieceMetadataEntity.triggers,
    }
}

const findSearchOperation = (version: string): FindOperator<string> => {
    if (version.startsWith('^')) {
        return LessThan(increaseMajorVersion(version.substring(1)))
    }
    if (version.startsWith('~')) {
        return LessThan(increaseMinorVersion(version.substring(1)))
    }
    return Equal(version)
}

const increaseMinorVersion = (version: string): string => {
    const incrementedVersion = semver.inc(version, 'minor')
    if (isNil(incrementedVersion)) {
        throw new Error(`Failed to increase minor version ${version}`)
    }
    return incrementedVersion
}

const increaseMajorVersion = (version: string): string => {
    const incrementedVersion = semver.inc(version, 'major')
    if (isNil(incrementedVersion)) {
        throw new Error(`Failed to increase major version ${version}`)
    }
    return incrementedVersion
}
