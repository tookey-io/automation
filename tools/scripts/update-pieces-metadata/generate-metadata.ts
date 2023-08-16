import { getAvailablePieceNames } from '../utils/get-available-piece-names';
import { readPackageJson } from '../utils/files';
import { validateMetadata } from './validate-metadata';
import { PieceMetadata } from '../../../packages/pieces/framework/src';
type Piece = {
  name: string;
  displayName: string;
  version: string;
  minimumSupportedRelease?: string;
  maximumSupportedRelease?: string;
  metadata(): Omit<PieceMetadata, 'name' | 'version'>;
};

const byDisplayNameIgnoreCase = (a: PieceMetadata, b: PieceMetadata) => {
  const aName = a.displayName.toUpperCase();
  const bName = b.displayName.toUpperCase();
  return aName.localeCompare(bName, 'en');
};

export const generateMetadata = async (): Promise<PieceMetadata[]> => {
  console.log('generateMetadata');

  
  const piecePackageNames = await getAvailablePieceNames();
  
  console.log('piecePackageNames', piecePackageNames);
  
  const pieces: PieceMetadata[] = await Promise.all(piecePackageNames.map(async (packageName) => {
    const packagePath = `packages/pieces/${packageName}`;

    const packageJson = await readPackageJson(packagePath);

    const module = await import(`${packagePath}/src/index.ts`);
    const { name: pieceName, version: pieceVersion } = packageJson;
    const piece = extractPieceFromModule({
      module,
      pieceName,
      pieceVersion
    });

    piece.name = packageJson.name;
    piece.version = packageJson.version;
    piece.minimumSupportedRelease = piece.minimumSupportedRelease ?? '0.0.0';
    piece.maximumSupportedRelease =
      piece.maximumSupportedRelease ?? '99999.99999.9999';

    const metadata = {
      ...piece.metadata(),
      name: piece.name,
      version: piece.version
    };
    validateMetadata(metadata);
    return metadata;
  }));
  
  pieces.sort(byDisplayNameIgnoreCase);

  return pieces;
};

export const extractPieceFromModule = (params: {
  module: Record<string, unknown>;
  pieceName: string;
  pieceVersion: string;
}) => {
  const { module, pieceName, pieceVersion } = params;
  const exports = Object.values(module);

  for (const e of exports) {
    if (e !== null && e !== undefined && e.constructor.name === 'Piece') {
      return e as Piece;
    }
  }
  throw new Error("Can't find constructor");
};
