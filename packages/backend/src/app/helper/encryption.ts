import * as crypto from 'crypto'
import { QueueMode, system } from './system/system'
import { SystemProp } from './system/system-prop'
import { ActivepiecesError, ErrorCode, isNil } from '@activepieces/shared'
import { localFileStore } from './store'
import { promisify } from 'util'
import { randomBytes } from 'node:crypto'
let secret: string | null
const algorithm = 'aes-256-cbc'
const ivLength = 16


export const loadEncryptionKey = async (queueMode: QueueMode): Promise<void> => {
    secret = system.get(SystemProp.ENCRYPTION_KEY) ?? null
    if (queueMode === QueueMode.MEMORY) {
        if (isNil(secret)) {
            secret = await localFileStore.load(SystemProp.ENCRYPTION_KEY)
        }
        if (isNil(secret)) {
            secret = await generateAndStoreSecret()
        }
    }
    if (isNil(secret)) {
        throw new ActivepiecesError({
            code: ErrorCode.SYSTEM_PROP_INVALID,
            params: {
                prop: SystemProp.ENCRYPTION_KEY,
            },
        }, `System property AP_${SystemProp.ENCRYPTION_KEY} must be defined`)
    }
}

const generateAndStoreSecret = async (): Promise<string> => {
    const secretLengthInBytes = 16
    const secretBuffer = await promisify(randomBytes)(secretLengthInBytes)
    const secret = secretBuffer.toString('hex') // Convert to hexadecimal
    await localFileStore.save(SystemProp.ENCRYPTION_KEY, secret)
    return secret
}

export type EncryptedObject = {
    iv: string
    data: string
}

export function encryptObject(object: unknown): EncryptedObject {
    const iv = crypto.randomBytes(ivLength) // Generate a random initialization vector
    const key = Buffer.from(secret!, 'binary')
    const cipher = crypto.createCipheriv(algorithm, key, iv) // Create a cipher with the key and initialization vector
    let encrypted = cipher.update(JSON.stringify(object), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return {
        iv: iv.toString('hex'),
        data: encrypted,
    }
}


export function decryptObject<T>(encryptedObject: EncryptedObject): T {
    const iv = Buffer.from(encryptedObject.iv, 'hex')
    const key = Buffer.from(secret!, 'binary') 
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedObject.data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return JSON.parse(decrypted)
}