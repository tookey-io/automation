import { KeyringStorage } from "@funded-labs/plug-controller/dist/interfaces/storage";

export class StorageMock implements KeyringStorage {
    private store: any;

    public isSupported: boolean;

    public local: {
        get: () => any;
        set: (obj: any) => void;
    };

    public constructor() {
        this.store = {};
        this.local = {
            set: this.set.bind(this),
            get: this.get.bind(this),
        };
        this.isSupported = true;
    }

    public set = async (obj: unknown): Promise<void> => {
        if (obj instanceof Object)
            this.store = {
                ...this.store,
                ...obj,
            };
    };

    public get =(): any => {
        return { ...this.store };
    };

    public clear = (): any => {
        this.set({});
        return {};
    };
}