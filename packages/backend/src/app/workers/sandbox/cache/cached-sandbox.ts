import { mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { system } from '../../../helper/system/system'
import { SystemProp } from '../../../helper/system/system-prop'
import { CachedSandboxState } from './cached-sandbox-state'
import { pieceManager } from '../../../flows/common/piece-installer'
import { engineInstaller } from '../../engine/engine-installer'
import { logger } from '../../../helper/logger'
import { Mutex } from 'async-mutex'
import dayjs from 'dayjs'
import { FileId } from '@activepieces/shared'
import { codeBuilder } from '../../code-worker/code-builder'

export class CachedSandbox {
    private static readonly CACHE_PATH = system.get(SystemProp.CACHE_PATH) ?? resolve('dist', 'cache')

    private readonly lock = new Mutex()
    private _state = CachedSandboxState.CREATED
    private _activeSandboxCount = 0
    private _lastUsedAt = dayjs()

    public readonly key: string

    constructor({ key }: CtorParams) {
        logger.debug({ key }, '[CachedSandbox#ctor]')
        this.key = key
    }

    path(): string {
        return `${CachedSandbox.CACHE_PATH}/sandbox/${this.key}`
    }

    lastUsedAt(): dayjs.Dayjs {
        return this._lastUsedAt
    }

    isInUse(): boolean {
        return this._activeSandboxCount > 0
    }

    async init(): Promise<void> {
        logger.debug({ key: this.key, state: this._state, activeSandboxes: this._activeSandboxCount }, '[CachedSandbox#init]')

        await this.lock.runExclusive(async (): Promise<void> => {
            if (this._state !== CachedSandboxState.CREATED) {
                return
            }

            await this.deletePathIfExists()
            await mkdir(this.path(), { recursive: true })
            this._state = CachedSandboxState.INITIALIZED
        })
    }

    async prepare({ pieces, codeArchives = [] }: PrepareParams): Promise<void> {
        logger.debug({ key: this.key, state: this._state, activeSandboxes: this._activeSandboxCount }, '[CachedSandbox#prepare]')

        await this.lock.runExclusive(async (): Promise<void> => {
            const notInitialized = this._state === CachedSandboxState.CREATED
            if (notInitialized) {
                throw new Error(`[CachedSandbox#prepare] not initialized, Key=${this.key} state=${this._state}`)
            }

            this._activeSandboxCount += 1
            this._lastUsedAt = dayjs()

            const alreadyPrepared = this._state !== CachedSandboxState.INITIALIZED
            if (alreadyPrepared) {
                return
            }

            await pieceManager.install({
                projectPath: this.path(),
                pieces,
            })

            await engineInstaller.install({
                path: this.path(),
            })

            await this.buildCodeArchives(codeArchives)

            this._state = CachedSandboxState.READY
        })
    }

    async decrementActiveSandboxCount(): Promise<void> {
        logger.debug({ key: this.key, state: this._state, activeSandboxes: this._activeSandboxCount }, '[CachedSandbox#decrementActiveSandboxCount]')

        await this.lock.runExclusive((): void => {
            if (this._activeSandboxCount === 0) {
                return
            }

            this._activeSandboxCount -= 1
        })
    }

    private deletePathIfExists(): Promise<void> {
        return rm(this.path(), { recursive: true, force: true })
    }

    private async buildCodeArchives(codeArchives: CodeArchive[]): Promise<void> {
        const buildJobs = codeArchives.map((archive) =>
            codeBuilder.processCodeStep({
                sourceCodeId: archive.id,
                codeZip: archive.content,
                buildPath: this.path(),
            }),
        )

        await Promise.all(buildJobs)
    }
}

type CtorParams = {
    key: string
}

type Piece = {
    name: string
    version: string
}

type CodeArchive = {
    id: FileId
    content: Buffer
}

type PrepareParams = {
    pieces: Piece[]
    codeArchives?: CodeArchive[]
}
