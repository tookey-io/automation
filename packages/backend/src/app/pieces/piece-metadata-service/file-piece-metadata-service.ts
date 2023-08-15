import { readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { cwd } from 'node:process'
import { Piece, PieceMetadata, PieceMetadataSummary } from '@activepieces/pieces-framework'
import { ActivepiecesError, ErrorCode, extractPieceFromModule } from '@activepieces/shared'
import { captureException } from '../../helper/logger'
import { GetParams, PieceMetadataService } from './piece-metadata-service'
import { isNil } from '@activepieces/shared'

const loadPiecesMetadata = async (): Promise<PieceMetadata[]> => {
    const ignoredPackages = ['framework', 'apps', 'dist', 'common']
    // const includedPackages = ['core', 'discord', 'tookey-wallet', 'store', 'delay', 'csv', 'ethereum']
    const piecesPath = resolve(cwd(), 'dist', 'packages', 'pieces')
    const piecePackages = await readdir(piecesPath)
    const filteredPiecePackages = piecePackages.filter(d => !ignoredPackages.includes(d))
    // const filteredPiecePackages = piecePackages.filter(d => includedPackages.includes(d))

    console.log(filteredPiecePackages)

    const piecesMetadata: PieceMetadata[] = []

    for (const piecePackage of filteredPiecePackages) {
        try {
            const packageJson = await import(join(piecesPath, piecePackage, 'package.json'))
            const module = await import(join(piecesPath, piecePackage, 'src', 'index'))
            const { name: pieceName, version: pieceVersion } = packageJson
            const piece = extractPieceFromModule<Piece>({
                module,
                pieceName,
                pieceVersion,
            })
            piecesMetadata.push({
                directoryName: piecePackage,
                ...piece.metadata(),
                name: pieceName,
                version: pieceVersion,
            })
        }
        catch (ex) {
            captureException(ex)
        }
    }

    return piecesMetadata.sort((a, b) => a.displayName.toUpperCase().localeCompare(b.displayName.toUpperCase()))
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
                auth: p.auth,
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

        async delete() {
            throw new Error('Deleting pieces is not supported in development mode')
        },
        async create() {
            throw new Error('Creating pieces is not supported in development mode')
        },

        async stats() {
            return {}
        },
    }
}
