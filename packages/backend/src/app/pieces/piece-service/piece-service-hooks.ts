import { PackageType, PiecePackage, ProjectId } from '@activepieces/shared'

const defaultHooks: PieceServiceHooks = {
    async getPieceArchivePackage() {
        throw new Error('operation not supported')
    },
}

let hooks = defaultHooks

export const pieceServiceHooks = {
    set(newHooks: PieceServiceHooks): void {
        hooks = newHooks
    },

    get(): PieceServiceHooks {
        return hooks
    },
}

export type PieceServiceHooks = {
    getPieceArchivePackage(p: GetPieceArchivePackageParams): Promise<PiecePackage>
}

export type GetPieceArchivePackageParams = {
    archive: Buffer
    packageType: PackageType.ARCHIVE
    pieceName: string
    pieceVersion: string
    projectId: ProjectId
}
