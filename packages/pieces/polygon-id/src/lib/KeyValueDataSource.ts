import { IDataSource } from '@0xpolygonid/js-sdk';
import { ActionContext, StoreScope } from '@activepieces/pieces-framework';
import { PolygonIdAuth } from '..';
import { STORAGE_PREFIX, DELIMITER } from './constants';
import { defined } from './defined';


export class KeyValueDataSource<T> implements IDataSource<T> {
    constructor(
        protected readonly dataPrefix: string,
        protected readonly context: ActionContext<typeof PolygonIdAuth, any>
    ) { }

    listKey() {
        return [STORAGE_PREFIX, this.dataPrefix].join(DELIMITER);
    }

    recordKey(key: string, keyName: string) {
        return [STORAGE_PREFIX, this.dataPrefix, key, keyName].join(DELIMITER);
    }

    allKeys(): Promise<[string, string][]> {
        console.log('allKeys', this.dataPrefix);
        return this.context.store
            .get<[string, string][]>(this.listKey(), StoreScope.PROJECT)
            .then((items) => items ?? []);
    }

    load(): Promise<T[]> {
        console.log('load', this.dataPrefix);
        return this.allKeys().then((records) => Promise.all(records.map(([key, name]) => this.get(key, name))).then((r) => r.filter(defined))
        );
    }

    loadMap(): Promise<Record<`${string}_${string}`, T>> {
        console.log('loadMap', this.dataPrefix);
        return this.allKeys().then((records) => Promise.all(
            records.map(([key, name]) => this.get(key, name).then((r) => (r ? ([key, name, r] as const) : undefined))
            )
        ).then((records) => Object.fromEntries(records.filter(defined).map(([key, name, r]) => [`${key}_${name}`, r]))
        )
        );
    }

    save(key: string, value: T, keyName?: string | undefined): Promise<void> {
        const notNullkeyName = keyName ?? 'default';
        console.log('save', this.dataPrefix, key, value, notNullkeyName);
        return Promise.all([
            this.context.store.put(this.recordKey(key, notNullkeyName), value, StoreScope.PROJECT),
            this.allKeys().then((records) => {
                const newRecords = records.filter(([k, kn]) => k !== key || kn !== notNullkeyName);
                newRecords.push([key, notNullkeyName]);
                console.log('update list', this.listKey(), newRecords);
                return this.context.store.put(this.listKey(), newRecords, StoreScope.PROJECT);
            }),
        ]).then(() => undefined);
    }

    get(key: string, keyName?: string | undefined): Promise<T | undefined> {
        const notNullkeyName = keyName ?? 'default';
        console.log('get', this.dataPrefix, key, notNullkeyName);
        return this.context.store
            .get<T>(this.recordKey(key, notNullkeyName), StoreScope.PROJECT)
            .then((item) => item ?? undefined);
    }

    delete(key: string, keyName?: string | undefined): Promise<void> {
        const notNullKeyName = keyName ?? 'default';
        console.log('delete', this.dataPrefix, key, notNullKeyName);
        return Promise.all([
            this.context.store.delete(this.recordKey(key, notNullKeyName), StoreScope.PROJECT),
            this.allKeys().then((records) => {
                const newRecords = records.filter(([k, kn]) => k !== key || kn !== notNullKeyName);
                return this.context.store.put(this.listKey(), newRecords, StoreScope.PROJECT);
            }),
        ]).then(() => undefined);
    }
}
