import { AbstractPrivateKeyStore } from '@0xpolygonid/js-sdk';
import { ActionContext } from '@activepieces/pieces-framework';
import { PolygonIdAuth } from '..';
import { KeyValueDataSource } from './KeyValueDataSource';

export class KeyValuePrivateKeyStore implements AbstractPrivateKeyStore {
    storage: KeyValueDataSource<string>;

    constructor(dataPrefix: string, context: ActionContext<typeof PolygonIdAuth, any>) {
        this.storage = new KeyValueDataSource<string>(dataPrefix, context);
    }

    importKey(args: { alias: string; key: string; }): Promise<void> {
        return this.storage.save(args.alias, args.key);
    }

    get(args: { alias: string; }): Promise<string> {
        return this.storage.get(args.alias).then((key) => {
            if (!key) {
                throw new Error(`Key ${args.alias} not found`);
            }

            return key;
        });
    }
}
