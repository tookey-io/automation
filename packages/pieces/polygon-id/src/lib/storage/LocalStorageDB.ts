import { ActionContext, StoreScope } from '@activepieces/pieces-framework';
import { PolygonIdAuth } from '../../index';
import {
    Bytes,
    Node,
    ITreeStorage,
    Hash,
    ZERO_HASH,
    NODE_TYPE_EMPTY,
    NODE_TYPE_LEAF,
    NODE_TYPE_MIDDLE,
    NodeEmpty,
    NodeLeaf,
    NodeMiddle,
    bytes2Hex,
} from '@iden3/js-merkletree';

export class KeyValueDB implements ITreeStorage {
    static async create(context: ActionContext<typeof PolygonIdAuth, any>, prefix: Bytes): Promise<KeyValueDB> {
        const rootStr = await context.store.get<string>(bytes2Hex(prefix), StoreScope.PROJECT);
        if (rootStr) {
            const bytes: number[] = JSON.parse(rootStr);

            return new KeyValueDB(context, prefix, new Hash(Uint8Array.from(bytes)));
        } else {
            return new KeyValueDB(context, prefix, ZERO_HASH);
        }
    }

    constructor(protected readonly context: ActionContext<typeof PolygonIdAuth, any>, private readonly _prefix: Bytes, private currentRoot: Hash) {
    }

    async get(k: Bytes): Promise<Node | undefined> {
        const kBytes = new Uint8Array([...this._prefix, ...k]);
        const key = bytes2Hex(kBytes);
        const val = await this.context.store.get<string>(key, StoreScope.PROJECT);

        if (val === null) {
            return undefined;
        }

        const obj = JSON.parse(val);
        switch (obj.type) {
            case NODE_TYPE_EMPTY:
                return new NodeEmpty();
            case NODE_TYPE_MIDDLE:
                const cL = new Hash(Uint8Array.from(obj.childL));
                const cR = new Hash(Uint8Array.from(obj.childR));

                return new NodeMiddle(cL, cR);
            case NODE_TYPE_LEAF:
                const k = new Hash(Uint8Array.from(obj.entry[0]));
                const v = new Hash(Uint8Array.from(obj.entry[1]));

                return new NodeLeaf(k, v);
        }

        throw `error: value found for key ${bytes2Hex(kBytes)} is not of type Node`;
    }

    async put(k: Bytes, n: Node): Promise<void> {
        const kBytes = new Uint8Array([...this._prefix, ...k]);
        const key = bytes2Hex(kBytes);
        const toSerialize: Record<string, unknown> = {
            type: n.type,
        };
        if (n instanceof NodeMiddle) {
            toSerialize['childL'] = Array.from(n.childL.bytes);
            toSerialize['childR'] = Array.from(n.childR.bytes);
        } else if (n instanceof NodeLeaf) {
            toSerialize['entry'] = [Array.from(n.entry[0].bytes), Array.from(n.entry[1].bytes)];
        }
        const val = JSON.stringify(toSerialize);
        this.context.store.put<string>(key, val, StoreScope.PROJECT);
    }

    async getRoot(): Promise<Hash> {
        return this.currentRoot;
    }

    async setRoot(r: Hash): Promise<void> {
        this.currentRoot = r;
        this.context.store.put<string>(bytes2Hex(this._prefix), JSON.stringify(Array.from(r.bytes)), StoreScope.PROJECT);
    }
}
