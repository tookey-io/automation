// inject to main.js
import 'sqlite3'

import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { DataSource, MigrationInterface } from 'typeorm'
import { InitialSql3Migration1690195839899 } from './migration/sqlite/1690195839899-InitialSql3Migration'
import { commonProperties } from './database-connection'
import { AddAppConnectionTypeToTopLevel1691706020626 } from './migration/sqlite/1691706020626-add-app-connection-type-to-top-level'
import { AddImageUrlAndTitleToUser1693774053027 } from './migration/sqlite/1693774053027-AddImageUrlAndTitleToUser'
import { FileTypeCompression1694695212159 } from './migration/sqlite/1694695212159-file-type-compression'
import { AddPieceTypeAndPackageTypeToFlowVersion1696245170061 } from './migration/common/1696245170061-add-piece-type-and-package-type-to-flow-version'
import { ApEdition, ApEnvironment } from '@activepieces/shared'
import { getEdition } from '../helper/secret-helper'
import { AddPieceTypeAndPackageTypeToPieceMetadata1696016228398 } from './migration/sqlite/1696016228398-add-piece-type-and-package-type-to-piece-metadata'
import { AddArchiveIdToPieceMetadata1696956123632 } from './migration/sqlite/1696956123632-add-archive-id-to-piece-metadata'
import { system } from '../helper/system/system'
import { SystemProp } from '../helper/system/system-prop'
import { StoreCodeInsideFlow1697969398200 } from './migration/common/1697969398200-store-code-inside-flow'
import { AddPlatformToProject1698078715730 } from './migration/sqlite/1698078715730-add-platform-to-project'
import { AddExternalIdSqlite1698857968495 } from './migration/sqlite/1698857968495-AddExternalIdSqlite'
import { UpdateUserStatusRenameShadowToInvited1699818680567 } from './migration/common/1699818680567-update-user-status-rename-shadow-to-invited'
import { AddChatBotSqlite1696029443045 } from './migration/sqlite/1696029443045-AddChatBotSqlite'
import { AddStepFileSqlite1692958076906 } from './migration/sqlite/1692958076906-AddStepFileSqlite'
import { AddTagsToRunSqlite1692056190942 } from './migration/sqlite/1692056190942-AddTagsToRunSqlite'
import { AddStatusToConnectionsSqlite1693402376520 } from './migration/sqlite/1693402376520-AddStatusToConnectionsSqlite'
import { AddPlatformIdToUserSqlite1700147448410 } from './migration/sqlite/1700147448410-AddPlatformIdToUserSqlite'
import { AddTerminationReasonSqlite1698323327318 } from './migration/sqlite/1698323327318-AddTerminationReason'
import { AddPlatformIdToPieceMetadataSqlite1700524446967 } from './migration/sqlite/1700524446967-AddPlatformIdToPieceMetadataSqlite'

const getSqliteDatabaseFilePath = (): string => {
    const apConfigDirectoryPath = system.getOrThrow(SystemProp.CONFIG_PATH)
    mkdirSync(apConfigDirectoryPath, { recursive: true })
    return path.resolve(path.join(apConfigDirectoryPath, 'database.sqlite'))
}

const getSqliteDatabaseInMemory = (): string => {
    return ':memory:'
}

const getSqliteDatabase = (): string => {
    const env = system.getOrThrow<ApEnvironment>(SystemProp.ENVIRONMENT)

    if (env === ApEnvironment.TESTING) {
        return getSqliteDatabaseInMemory()
    }
    return getSqliteDatabaseFilePath()
}

const getMigrations = (): (new () => MigrationInterface)[] => {
    const communityMigrations = [
        InitialSql3Migration1690195839899,
        AddAppConnectionTypeToTopLevel1691706020626,
        AddTagsToRunSqlite1692056190942,
        AddStepFileSqlite1692958076906,
        AddStatusToConnectionsSqlite1693402376520,
        AddImageUrlAndTitleToUser1693774053027,
        AddChatBotSqlite1696029443045,
        FileTypeCompression1694695212159,
        AddPieceTypeAndPackageTypeToPieceMetadata1696016228398,
        AddPieceTypeAndPackageTypeToFlowVersion1696245170061,
        AddArchiveIdToPieceMetadata1696956123632,
        StoreCodeInsideFlow1697969398200,
        AddPlatformToProject1698078715730,
        AddTerminationReasonSqlite1698323327318,
        AddExternalIdSqlite1698857968495,
        UpdateUserStatusRenameShadowToInvited1699818680567,
        AddPlatformIdToUserSqlite1700147448410,
        AddPlatformIdToPieceMetadataSqlite1700524446967,
    ]
    const edition = getEdition()
    if (edition !== ApEdition.COMMUNITY) {
        throw new Error(`Edition ${edition} not supported in sqlite3 mode`)
    }
    return communityMigrations
}

const getMigrationConfig = (): MigrationConfig => {
    const env = system.getOrThrow<ApEnvironment>(SystemProp.ENVIRONMENT)

    if (env === ApEnvironment.TESTING) {
        return {}
    }

    return {
        migrationsRun: true,
        migrationsTransactionMode: 'each',
        migrations: getMigrations(),
    }
}

export const createSqlLiteDataSource = (): DataSource => {
    const migrationConfig = getMigrationConfig()

    return new DataSource({
        type: 'sqlite',
        database: getSqliteDatabase(),
        ...migrationConfig,
        ...commonProperties,
    })
}

type MigrationConfig = {
    migrationsRun?: boolean
    migrationsTransactionMode?: 'all' | 'none' | 'each'
    migrations?: (new () => MigrationInterface)[]
}
