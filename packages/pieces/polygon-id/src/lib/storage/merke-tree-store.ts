import { Hash, Merkletree, Node, str2Bytes } from '@iden3/js-merkletree';
import { IdentityMerkleTreeMetaInformation, MerkleTreeType, IMerkleTreeStorage } from '@0xpolygonid/js-sdk';
import * as uuid from 'uuid';
import { ActionContext, StoreScope } from '@activepieces/pieces-framework';
import { PolygonIdAuth } from '../../index';
import { DELIMITER, STORAGE_PREFIX } from '../constants';
import { KeyValueDB } from './LocalStorageDB';

export const MERKLE_TREE_TYPES: MerkleTreeType[] = [
    MerkleTreeType.Claims,
    MerkleTreeType.Revocations,
    MerkleTreeType.Roots,
];

export const createMerkleTreeMetaInfo = (identifier: string): IdentityMerkleTreeMetaInformation[] => {
    const treesMeta: IdentityMerkleTreeMetaInformation[] = [];
    for (let index = 0; index < MERKLE_TREE_TYPES.length; index++) {
        const mType = MERKLE_TREE_TYPES[index];
        const treeId = `${identifier}+${mType}`;
        treesMeta.push({ treeId, identifier, type: mType });
    }
    return treesMeta;
};

/**
 * Merkle tree storage that uses browser local storage
 *
 * @public
 * @class KeyValueMerkleTreeStorage
 * @implements implements IMerkleTreeStorage interface
 */
export class KeyValueMerkleTreeStorage implements IMerkleTreeStorage {
    /**
     * key for the storage key metadata
     *
     * @static
     */
    static readonly storageKeyMeta = [STORAGE_PREFIX, 'merkle-tree-meta'].join(DELIMITER);

    /**
     * Creates an instance of KeyValueMerkleTreeStorage.
     * @param {number} _mtDepth
     */
    constructor(
        protected readonly context: ActionContext<typeof PolygonIdAuth, any>,
        private readonly _mtDepth: number
    ) {}

    /** creates a tree in the local storage */
    async createIdentityMerkleTrees(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]> {
        if (!identifier) {
            identifier = `${uuid.v4()}`;
        }
        const meta = await this.context.store.get<string>(KeyValueMerkleTreeStorage.storageKeyMeta, StoreScope.PROJECT);
        if (meta) {
            const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
            const presentMetaForIdentifier = metaInfo.find((m) => m.treeId === `${identifier}+${m.type}`);
            if (presentMetaForIdentifier) {
                throw new Error(
                    `Present merkle tree meta information in the store for current identifier ${identifier}`
                );
            }
            const identityMetaInfo = metaInfo.filter((m) => m.identifier === identifier);
            if (identityMetaInfo.length > 0) {
                return identityMetaInfo;
            }
            const treesMeta = createMerkleTreeMetaInfo(identifier);
            await this.context.store.put<string>(
                KeyValueMerkleTreeStorage.storageKeyMeta,
                JSON.stringify([...metaInfo, ...treesMeta]),
                StoreScope.PROJECT
            );

            return [...metaInfo, ...treesMeta];
        }
        const treesMeta = createMerkleTreeMetaInfo(identifier);
        await this.context.store.put<string>(
            KeyValueMerkleTreeStorage.storageKeyMeta,
            JSON.stringify(treesMeta),
            StoreScope.PROJECT
        );
        return treesMeta;
    }
    /**
     *
     * getIdentityMerkleTreesInfo from the local storage
     * @param {string} identifier
     * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
     */
    async getIdentityMerkleTreesInfo(identifier: string): Promise<IdentityMerkleTreeMetaInformation[]> {
        const meta = await this.context.store.get<string>(KeyValueMerkleTreeStorage.storageKeyMeta, StoreScope.PROJECT);
        if (meta) {
            const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
            return metaInfo.filter((m) => m.identifier === identifier);
        }
        throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }

    /** get merkle tree from the local storage */
    async getMerkleTreeByIdentifierAndType(identifier: string, mtType: MerkleTreeType): Promise<Merkletree> {
        const resultMeta = await this.getMeta(identifier, mtType);
        const db = await KeyValueDB.create(this.context, str2Bytes(resultMeta.treeId));
        return new Merkletree(db, true, this._mtDepth);
    }

    private async getMeta(identifier: string, mtType: MerkleTreeType) {
        const meta = await this.context.store.get<string>(KeyValueMerkleTreeStorage.storageKeyMeta, StoreScope.PROJECT);
        const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
        if (!meta) {
            throw err;
        }

        const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
        const resultMeta = metaInfo.filter((m) => m.identifier === identifier && m.type === mtType)[0];
        if (!resultMeta) {
            throw err;
        }
        return resultMeta;
    }

    /** adds to merkle tree in the local storage */
    async addToMerkleTree(identifier: string, mtType: MerkleTreeType, hindex: bigint, hvalue: bigint): Promise<void> {
        const resultMeta = await this.getMeta(identifier, mtType);

        const db = await KeyValueDB.create(this.context, str2Bytes(resultMeta.treeId));
        const tree = new Merkletree(db, true, this._mtDepth);

        await tree.add(hindex, hvalue);
    }

    /** binds merkle tree in the local storage to the new identifiers */
    async bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void> {
        const meta = await this.context.store.get<string>(KeyValueMerkleTreeStorage.storageKeyMeta, StoreScope.PROJECT);
        if (!meta) {
            throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
        }
        const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
        const treesMeta = metaInfo
            .filter((m) => m.identifier === oldIdentifier)
            .map((m) => ({ ...m, identifier: newIdentifier }));
        if (treesMeta.length === 0) {
            throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
        }

        const newMetaInfo = [...metaInfo.filter((m) => m.identifier !== oldIdentifier), ...treesMeta];
        this.context.store.put<string>(
            KeyValueMerkleTreeStorage.storageKeyMeta,
            JSON.stringify(newMetaInfo),
            StoreScope.PROJECT
        );
    }
}
