import { PiecesSource, system } from '../../../helper/system/system'
import { SystemProp } from '../../../helper/system/system-prop'
import { PieceManager } from './piece-manager'
import { LocalPieceManager } from './local-piece-manager'
import { RegistryPieceManager } from './registry-piece-manager'

const source = system.getOrThrow<PiecesSource>(SystemProp.PIECES_SOURCE)

const getPieceManager = (): PieceManager => {
    const pieceManagerVariant: Record<PiecesSource, new () => PieceManager> = {
        [PiecesSource.FILE]: LocalPieceManager,
        [PiecesSource.CLOUD_AND_DB]: RegistryPieceManager,
        [PiecesSource.DB]: RegistryPieceManager,
    }

    return new pieceManagerVariant[source]()
}

export const pieceManager = getPieceManager()