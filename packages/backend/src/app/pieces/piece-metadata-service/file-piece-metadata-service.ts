import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import sortBy from 'lodash/sortBy'
import { Piece, PieceMetadata, PieceMetadataSummary } from '@activepieces/pieces-framework'
import { ActivepiecesError, ErrorCode } from '@activepieces/shared'
import { captureException, logger } from '../../helper/logger'
import { GetParams, PieceMetadataService } from './piece-metadata-service'
import { isNil } from 'lodash'

const loadPiecesMetadata = async (): Promise<PieceMetadata[]> => {
    const ignoredPackages = ['framework', 'apps', 'dist', 'common']
    const piecesPath = resolve(cwd(), 'dist', 'packages', 'pieces')
    const piecePackages = await readdir(piecesPath)
    const filteredPiecePackages = piecePackages.filter(d => !ignoredPackages.includes(d))

    const piecesMetadata: PieceMetadata[] = []

    for (const piecePackage of filteredPiecePackages) {
        try {
            const module = await import(`../../../../../pieces/${piecePackage}/src/index.ts`)
            const packageJson = await import(`../../../../../pieces/${piecePackage}/package.json`)
            const piece = Object.values<Piece>(module)[0]
            piecesMetadata.push({
                directoryName: piecePackage,
                ...piece.metadata(),
                name: packageJson.name,
                version: packageJson.version,
            })
        }
        catch(ex) {
            captureException(ex)
            logger.error(ex)
        }
    }

    return sortBy(piecesMetadata, [p => p.displayName.toUpperCase()])
}

export const FilePieceMetadataService = (): PieceMetadataService => {
    return {
        async list(): Promise<PieceMetadataSummary[]> {
            const piecesMetadata = await loadPiecesMetadata()

            return piecesMetadata.map(p => ({
                name: p.name,
                displayName: p.displayName,
                tags: p.tags,
                description: p.description,
                logoUrl: p.logoUrl,
                version: p.version,
                minimumSupportedRelease: p.minimumSupportedRelease,
                maximumSupportedRelease: p.maximumSupportedRelease,
                actions: Object.keys(p.actions).length,
                triggers: Object.keys(p.triggers).length,
            }))
        },

        async get({ name, version }: GetParams): Promise<PieceMetadata> {
            const piecesMetadata = await loadPiecesMetadata()
            const pieceMetadata = piecesMetadata.find(p => p.name === name)

            if (isNil(pieceMetadata)) {
                throw new ActivepiecesError({
                    code: ErrorCode.PIECE_NOT_FOUND,
                    params: {
                        pieceName: name,
                        pieceVersion: version,
                    },
                })
            }

            return pieceMetadata
        },

        async create() {
            throw new Error('Creating pieces is not supported in development mode')
        },

        async stats() {
            return {}
        },
    }
}
