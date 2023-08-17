import { readdir } from 'node:fs/promises';

export const getAvailablePieceNames = async (
    filter?: string[]
): Promise<string[]> => {
    const ignoredPackages = ['framework', 'apps', 'dist', 'common'];
    const packageNames = await readdir('packages/pieces');
    return packageNames.filter((p) =>
        filter ? filter.includes(p) : !ignoredPackages.includes(p)
    );
};
