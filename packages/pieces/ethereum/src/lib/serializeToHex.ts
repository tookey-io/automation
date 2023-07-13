import * as ethers from "ethers";

export function serializeToHex(populated: ethers.ethers.TransactionLike<string>) {
    const serialized = {} as any;
    for (const [key, value] of Object.entries(populated)) {
        serialized[key] = typeof value === 'bigint' ? ethers.toBeHex(value) : value;
    }
    return serialized;
}
