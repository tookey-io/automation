import { ExecutionOutput, FileCompression } from '@activepieces/shared'
import { fileCompressor } from '../../file/utils/file-compressor'
import { logger } from '../../helper/logger'

export const logSerializer = {
    async serialize(log: ExecutionOutput): Promise<Buffer> {
        const stringifiedLog = JSON.stringify(log, memoryFileReplacer)
        const binaryLog = Buffer.from(stringifiedLog)

        const compressedLog = await fileCompressor.compress({
            data: binaryLog,
            compression: FileCompression.GZIP,
        })

        logger.debug({
            'binaryLog.byteLength': binaryLog.byteLength,
            'compressedLog.byteLength': compressedLog.byteLength,
        }, '[logSerializer#serialize]')

        return compressedLog
    },
}

const memoryFileReplacer = (_key: string, value: unknown): unknown => {
    if (typeof value === 'string' && value.startsWith('memory://')) {
        return '[TRUNCATED]'
    }

    return value
}
