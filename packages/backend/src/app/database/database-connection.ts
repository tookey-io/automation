import { TlsOptions } from 'node:tls'
import { DataSource } from 'typeorm'
import { UserEntity } from '../user/user-entity'
import { ProjectEntity } from '../project/project.entity'
import { FlowEntity } from '../flows/flow/flow.entity'
import { FlowVersionEntity } from '../flows/flow-version/flow-version-entity'
import { FileEntity } from '../file/file.entity'
import { StoreEntryEntity } from '../store-entry/store-entry-entity'
import { FlowRunEntity } from '../flows/flow-run/flow-run-entity'
import { FlagEntity } from '../flags/flag.entity'
import { system } from '../helper/system/system'
import { SystemProp } from '../helper/system/system-prop'
import { AppConnectionEntity } from '../app-connection/app-connection.entity'
import { FlowAndFileProjectId1674788714498 } from './migration/1674788714498-FlowAndFileProjectId'
import { initializeSchema1676238396411 } from './migration/1676238396411-initialize-schema'
import { removeStoreAction1676649852890 } from './migration/1676649852890-remove-store-action'
import { encryptCredentials1676505294811 } from './migration/1676505294811-encrypt-credentials'
import { billing1677286751592 } from './migration/1677286751592-billing'
import { addVersionToPieceSteps1677521257188 } from './migration/1677521257188-add-version-to-piece-steps'
import { AppEventRoutingEntity } from '../app-event-routing/app-event-routing.entity'
import { productEmbed1677894800372 } from './migration/1677894800372-product-embed'
import { TriggerEventEntity } from '../flows/trigger-events/trigger-event.entity'
import { addtriggerevents1678621361185 } from './migration/1678621361185-addtriggerevents'
import { removeCollectionVersion1678492809093 } from './migration/1678492809093-removeCollectionVersion'
import { addEventRouting1678382946390 } from './migration/1678382946390-add-event-routing'
import { bumpFixPieceVersions1678928503715 } from './migration/1678928503715-bump-fix-piece-versions'
import { migrateSchedule1679014156667 } from './migration/1679014156667-migrate-schedule'
import { addNotificationsStatus1680563747425 } from './migration/1680563747425-add-notifications-status'
import { AddInputUiInfo1681107443963 } from './migration/1681107443963-AddInputUiInfo'
import { WebhookSimulationEntity } from '../webhooks/webhook-simulation/webhook-simulation-entity'
import { CreateWebhookSimulationSchema1680698259291 } from './migration/1680698259291-create-webhook-simulation-schema'
import { FlowInstanceEntity } from '../flows/flow-instance/flow-instance.entity'
import { FolderEntity } from '../flows/folder/folder.entity'
import { RemoveCollections1680986182074 } from './migration/1680986182074-RemoveCollections'
import { StoreAllPeriods1681019096716 } from './migration/1681019096716-StoreAllPeriods'
import { AllowNullableStoreEntryAndTrigger1683040965874 } from './migration/1683040965874-allow-nullable-store-entry'
import { RenameNotifications1683195711242 } from './migration/1683195711242-rename-notifications'
import { ListFlowRunsIndices1683199709317 } from './migration/1683199709317-list-flow-runs-indices'
import { ProjectNotifyStatusNotNull1683458275525 } from './migration/1683458275525-project-notify-status-not-null'
import { FlowRunPauseMetadata1683552928243 } from './migration/1683552928243-flow-run-pause-metadata'
import { ChangeVariableSyntax1683898241599 } from './migration/1683898241599-ChangeVariableSyntax'
import { PieceMetadataEntity } from '../pieces/piece-metadata-entity'
import { PieceMetadata1685537054805 } from './migration/1685537054805-piece-metadata'
import { AddProjectIdToPieceMetadata1686090319016 } from './migration/1686090319016-AddProjectIdToPieceMetadata'
import { UnifyPieceName1686138629812 } from './migration/1686138629812-unifyPieceName'

const database = system.getOrThrow(SystemProp.POSTGRES_DATABASE)
const host = system.getOrThrow(SystemProp.POSTGRES_HOST)
const password = system.getOrThrow(SystemProp.POSTGRES_PASSWORD)
const serializedPort = system.getOrThrow(SystemProp.POSTGRES_PORT)
const port = Number.parseInt(serializedPort, 10)
const username = system.getOrThrow(SystemProp.POSTGRES_USERNAME)

const getSslConfig = (): boolean | TlsOptions => {
    const useSsl = system.get(SystemProp.POSTGRES_USE_SSL)

    if (useSsl === 'true') {
        return {
            ca: system.get(SystemProp.POSTGRES_SSL_CA),
        }
    }

    return false
}

const getMigrations = () => {
    return [
        FlowAndFileProjectId1674788714498,
        initializeSchema1676238396411,
        encryptCredentials1676505294811,
        removeStoreAction1676649852890,
        billing1677286751592,
        addVersionToPieceSteps1677521257188,
        productEmbed1677894800372,
        addtriggerevents1678621361185,
        removeCollectionVersion1678492809093,
        addEventRouting1678382946390,
        bumpFixPieceVersions1678928503715,
        migrateSchedule1679014156667,
        addNotificationsStatus1680563747425,
        AddInputUiInfo1681107443963,
        CreateWebhookSimulationSchema1680698259291,
        RemoveCollections1680986182074,
        StoreAllPeriods1681019096716,
        AllowNullableStoreEntryAndTrigger1683040965874,
        RenameNotifications1683195711242,
        ListFlowRunsIndices1683199709317,
        ProjectNotifyStatusNotNull1683458275525,
        FlowRunPauseMetadata1683552928243,
        ChangeVariableSyntax1683898241599,
        PieceMetadata1685537054805,
        AddProjectIdToPieceMetadata1686090319016,
        UnifyPieceName1686138629812,
    ]
}

export const databaseConnection = new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    synchronize: false,
    subscribers: [],
    migrationsRun: true,
    migrationsTransactionMode: 'each',
    ssl: getSslConfig(),
    migrations: getMigrations(),
    entities: [
        TriggerEventEntity,
        FlowInstanceEntity,
        AppEventRoutingEntity,
        FileEntity,
        FlagEntity,
        FlowEntity,
        FlowVersionEntity,
        FlowRunEntity,
        ProjectEntity,
        StoreEntryEntity,
        UserEntity,
        AppConnectionEntity,
        WebhookSimulationEntity,
        FolderEntity,
        PieceMetadataEntity,
    ],
})
