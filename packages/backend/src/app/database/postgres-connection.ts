// inject to main.js
import 'pg'

import { DataSource, MigrationInterface } from 'typeorm'
import { system } from '../helper/system/system'
import { SystemProp } from '../helper/system/system-prop'
import { TlsOptions } from 'node:tls'
import { FlowAndFileProjectId1674788714498 } from './migration/postgres/1674788714498-FlowAndFileProjectId'
import { initializeSchema1676238396411 } from './migration/postgres/1676238396411-initialize-schema'
import { removeStoreAction1676649852890 } from './migration/postgres/1676649852890-remove-store-action'
import { encryptCredentials1676505294811 } from './migration/postgres/1676505294811-encrypt-credentials'
import { billing1677286751592 } from './migration/postgres/1677286751592-billing'
import { addVersionToPieceSteps1677521257188 } from './migration/postgres/1677521257188-add-version-to-piece-steps'
import { productEmbed1677894800372 } from './migration/postgres/1677894800372-product-embed'
import { addtriggerevents1678621361185 } from './migration/postgres/1678621361185-addtriggerevents'
import { removeCollectionVersion1678492809093 } from './migration/postgres/1678492809093-removeCollectionVersion'
import { addEventRouting1678382946390 } from './migration/postgres/1678382946390-add-event-routing'
import { bumpFixPieceVersions1678928503715 } from './migration/postgres/1678928503715-bump-fix-piece-versions'
import { migrateSchedule1679014156667 } from './migration/postgres/1679014156667-migrate-schedule'
import { addNotificationsStatus1680563747425 } from './migration/postgres/1680563747425-add-notifications-status'
import { AddInputUiInfo1681107443963 } from './migration/postgres/1681107443963-AddInputUiInfo'
import { CreateWebhookSimulationSchema1680698259291 } from './migration/postgres/1680698259291-create-webhook-simulation-schema'
import { RemoveCollections1680986182074 } from './migration/postgres/1680986182074-RemoveCollections'
import { StoreAllPeriods1681019096716 } from './migration/postgres/1681019096716-StoreAllPeriods'
import { AllowNullableStoreEntryAndTrigger1683040965874 } from './migration/postgres/1683040965874-allow-nullable-store-entry'
import { RenameNotifications1683195711242 } from './migration/postgres/1683195711242-rename-notifications'
import { ListFlowRunsIndices1683199709317 } from './migration/postgres/1683199709317-list-flow-runs-indices'
import { ProjectNotifyStatusNotNull1683458275525 } from './migration/postgres/1683458275525-project-notify-status-not-null'
import { FlowRunPauseMetadata1683552928243 } from './migration/postgres/1683552928243-flow-run-pause-metadata'
import { ChangeVariableSyntax1683898241599 } from './migration/postgres/1683898241599-ChangeVariableSyntax'
import { PieceMetadata1685537054805 } from './migration/postgres/1685537054805-piece-metadata'
import { AddProjectIdToPieceMetadata1686090319016 } from './migration/postgres/1686090319016-AddProjectIdToPieceMetadata'
import { UnifyPieceName1686138629812 } from './migration/postgres/1686138629812-unifyPieceName'
import { AddScheduleOptions1687384796637 } from './migration/postgres/1687384796637-AddScheduleOptions'
import { AddAuthToPiecesMetadata1688922241747 } from './migration/postgres//1688922241747-AddAuthToPiecesMetadata'
import { AddUpdatedByInFlowVersion1689292797727 } from './migration/postgres/1689292797727-AddUpdatedByInFlowVersion'
import { AddTasksToRun1689351564290 } from './migration/postgres/1689351564290-AddTasksToRun'
import { commonProperties } from './database-connection'
import { AddAppConnectionTypeToTopLevel1691703023866 } from './migration/postgres/1691703023866-add-app-connection-type-to-top-level'
import { AddTagsToRun1692106375081 } from './migration/postgres/1692106375081-AddTagsToRun'
import { AddFileToPostgres1693004806926 } from './migration/postgres/1693004806926-AddFileToPostgres'
import { AddStatusToConnections1693402930301 } from './migration/postgres/1693402930301-AddStatusToConnections'
import { AddUserMetaInformation1693850082449 } from './migration/postgres/1693850082449-AddUserMetaInformation'
import { FixPieceMetadataOrderBug1694367186954 } from './migration/postgres/1694367186954-fix-piece-metadata-order-bug'
import { Chatbot1694902537040 } from './migration/postgres/1694902537040-Chatbot'
import { FileTypeCompression1694691554696 } from './migration/postgres/1694691554696-file-type-compression'
import { AddPieceTypeAndPackageTypeToPieceMetadata1695992551156 } from './migration/postgres/1695992551156-add-piece-type-and-package-type-to-piece-metadata'
import { AddPieceTypeAndPackageTypeToFlowVersion1696245170061 } from './migration/common/1696245170061-add-piece-type-and-package-type-to-flow-version'
import { AddPieceTypeAndPackageTypeToFlowTemplate1696245170062 } from './migration/common/1696245170062-add-piece-type-and-package-type-to-flow-template'
import { AddVisibilityStatusToChatbot1695719749099 } from './migration/postgres/1695719749099-AddVisibilityStatusToChatbot'
import { ApEdition, ApEnvironment } from '@activepieces/shared'
import { getEdition } from '../helper/secret-helper'
import { AddDatasourcesLimit1695916063833 } from '../ee/database/migrations/postgres/1695916063833-AddDatasourcesLimit'
import { MakeStripeSubscriptionNullable1685053959806 } from '../ee/database/migrations/postgres/1685053959806-MakeStripeSubscriptionNullable'
import { AddTemplates1685538145476 } from '../ee/database/migrations/postgres/1685538145476-addTemplates'
import { AddFeaturedDescriptionAndFlagToTemplates1694604120205 } from '../ee/database/migrations/postgres/1694604120205-AddFeaturedDescriptionAndFlagToTemplates'
import { ModifyBilling1694902537045 } from '../ee/database/migrations/postgres/1694902537045-ModifyBilling'
import { FlowTemplateAddUserIdAndImageUrl1694379223109 } from '../ee/database/migrations/postgres/1694379223109-flow-template-add-user-id-and-image-url'
import { ProjectMemberRelations1694381968985 } from '../ee/database/migrations/postgres/1694381968985-project-member-relations'
import { AddReferral1690459469381 } from '../ee/database/migrations/postgres/1690459469381-AddReferral'
import { RemoveCalculatedMetrics1689806173642 } from '../ee/database/migrations/postgres/1689806173642-RemoveCalculatedMetrics'
import { AddTasksPerDays1689336533370 } from '../ee/database/migrations/postgres/1689336533370-AddTasksPerDays'
import { AddProjectMembers1689177797092 } from '../ee/database/migrations/postgres/1689177797092-AddProjectMembers'
import { AddAppSumo1688943462327 } from '../ee/database/migrations/postgres/1688943462327-AddAppSumo'
import { AddBillingParameters1688739844617 } from '../ee/database/migrations/postgres/1688739844617-AddBillingParameters'
import { AddProjectIdToTemplate1688083336934 } from '../ee/database/migrations/postgres/1688083336934-AddProjectIdToTemplate'
import { AddPinnedOrder1686154285890 } from '../ee/database/migrations/postgres/1686154285890-add_pinned_order'
import { AddPinnedAndBlogUrlToTemplates1686133672743 } from '../ee/database/migrations/postgres/1686133672743-AddPinnedAndBlogUrlToTemplates'
import { ChangeToJsonToKeepKeysOrder1685991260335 } from '../ee/database/migrations/postgres/1685991260335-ChangeToJsonToPeserveKeys'
import { AddArchiveIdToPieceMetadata1696950789636 } from './migration/postgres/1696950789636-add-archive-id-to-piece-metadata'
import { AddPlatform1697717995884 } from '../ee/database/migrations/postgres/1697717995884-add-platform'
import { StoreCodeInsideFlow1697969398200 } from './migration/common/1697969398200-store-code-inside-flow'
import { AddPlatformToProject1698065083750 } from './migration/postgres/1698065083750-add-platform-to-project'
import { AddCustomDomain1698077078271 } from '../ee/database/migrations/postgres/1698077078271-AddCustomDomain'
import { AddTerminationReason1698323987669 } from './migration/postgres/1698323987669-AddTerminationReason'
import { AddSigningKey1698602417745 } from './migration/postgres/1698602417745-add-signing-key'
import { ManagedAuthnInitial1698700720482 } from './migration/postgres/1698700720482-managed-authn-initial'
import { AddDisplayNameToSigningKey1698698190965 } from './migration/postgres/1698698190965-AddDisplayNameToSigningKey'
import { AddOAuth2AppEntiity1699221414907 } from './migration/postgres/1699221414907-AddOAuth2AppEntiity'
import { AddFilteredPiecesToPlatform1699281870038 } from './migration/postgres/1699281870038-add-filtered-pieces-to-platform'
import { AddSmtpAndPrivacyUrlToPlatform1699491705906 } from './migration/postgres/1699491705906-AddSmtpAndPrivacyUrlToPlatform'
import { RemoveUnusedFieldsinBilling1700132368636 } from './migration/postgres/1700132368636-RemoveUnusedFieldsinBilling'
import { UpdateUserStatusRenameShadowToInvited1699818680567 } from './migration/common/1699818680567-update-user-status-rename-shadow-to-invited'
import { AddPlatformIdToUser1699901161457 } from './migration/postgres/1699901161457-add-platform-id-to-user'
import { AddOtpEntity1700396157624 } from './migration/postgres/1700396157624-add-otp-entity'
import { AddPlatformDefaultLanguage1700406308445 } from './migration/postgres/1700406308445-AddPlatformDefaultLanguage'
import { AddPlatformIdToPieceMetadata1700522340280 } from './migration/postgres/1700522340280-AddPlatformIdToPieceMetadata'
import { MakeStripeCustomerIdNullable1700751925992 } from './migration/postgres/1700751925992-MakeStripeCustomerIdNullable'
import { AddStateToOtp1701084418793 } from './migration/postgres/1701084418793-add-state-to-otp'
import { AddPartialUniqueIndexForEmailAndPlatformIdIsNull1701096458822 } from './migration/common/1701096458822-add-partial-unique-index-for-email-and-platform-id-is-null'
import { MigrateEeUsersToOldestPlatform1701261357197 } from './migration/postgres/1701261357197-migrate-ee-users-to-oldest-platform'
import { ModifyProjectMembersAndRemoveUserId1701647565290 } from './migration/postgres/1701647565290-ModifyProjectMembersAndRemoveUserId'
import { AddApiKeys1701716639135 } from './migration/postgres/1701716639135-AddApiKeys'
import { AddEmbeddingFeatureToPlatform1701794452891 } from './migration/postgres/1701794452891-AddEmbeddingFeatureToPlatform'
import { AddPlatformIdToFile1701807681821 } from './migration/postgres/1701807681821-AddPlatformIdToFile'
import { AddPlatformIdToFlowTemplates1703411318826 } from './migration/postgres/1703411318826-AddPlatformIdToFlowTemplates'
import { RemoveFlowInstance1702379794665 } from './migration/postgres/1702379794665-remove-flow-instance'


const getSslConfig = (): boolean | TlsOptions => {
    const useSsl = system.get(SystemProp.POSTGRES_USE_SSL)

    if (useSsl === 'true') {
        return {
            ca: system.get(SystemProp.POSTGRES_SSL_CA)?.replace(/\\n/g, '\n'),
        }
    }

    return false
}

const getMigrations = (): (new () => MigrationInterface)[] => {
    const commonMigration = [
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
        AddScheduleOptions1687384796637,
        AddAuthToPiecesMetadata1688922241747,
        AddUpdatedByInFlowVersion1689292797727,
        AddTasksToRun1689351564290,
        AddAppConnectionTypeToTopLevel1691703023866,
        AddTagsToRun1692106375081,
        AddFileToPostgres1693004806926,
        AddStatusToConnections1693402930301,
        AddUserMetaInformation1693850082449,
        FixPieceMetadataOrderBug1694367186954,
        FileTypeCompression1694691554696,
        Chatbot1694902537040,
        AddVisibilityStatusToChatbot1695719749099,
        AddPieceTypeAndPackageTypeToPieceMetadata1695992551156,
        AddPieceTypeAndPackageTypeToFlowVersion1696245170061,
        AddArchiveIdToPieceMetadata1696950789636,
        StoreCodeInsideFlow1697969398200,
        AddPlatformToProject1698065083750,
        AddTerminationReason1698323987669,
        ManagedAuthnInitial1698700720482,
        UpdateUserStatusRenameShadowToInvited1699818680567,
        AddPlatformIdToUser1699901161457,
        AddPlatformIdToPieceMetadata1700522340280,
        AddPartialUniqueIndexForEmailAndPlatformIdIsNull1701096458822,
        AddPlatformIdToFile1701807681821,
        RemoveFlowInstance1702379794665,
    ]

    const edition = getEdition()
    switch (edition) {
        case ApEdition.CLOUD:
            commonMigration.push(
                MakeStripeSubscriptionNullable1685053959806,
                AddTemplates1685538145476,
                ChangeToJsonToKeepKeysOrder1685991260335,
                AddPinnedAndBlogUrlToTemplates1686133672743,
                AddPinnedOrder1686154285890,
                AddProjectIdToTemplate1688083336934,
                AddBillingParameters1688739844617,
                AddAppSumo1688943462327,
                AddProjectMembers1689177797092,
                AddTasksPerDays1689336533370,
                RemoveCalculatedMetrics1689806173642,
                AddReferral1690459469381,
                ProjectMemberRelations1694381968985,
                FlowTemplateAddUserIdAndImageUrl1694379223109,
                AddFeaturedDescriptionAndFlagToTemplates1694604120205,
                ModifyBilling1694902537045,
                AddDatasourcesLimit1695916063833,
                AddPieceTypeAndPackageTypeToFlowTemplate1696245170062,
                AddPlatform1697717995884,
                AddCustomDomain1698077078271,
                AddSigningKey1698602417745,
                AddDisplayNameToSigningKey1698698190965,
                AddOAuth2AppEntiity1699221414907,
                AddFilteredPiecesToPlatform1699281870038,
                AddSmtpAndPrivacyUrlToPlatform1699491705906,
                RemoveUnusedFieldsinBilling1700132368636,
                AddOtpEntity1700396157624,
                AddPlatformDefaultLanguage1700406308445,
                MakeStripeCustomerIdNullable1700751925992,
                AddStateToOtp1701084418793,
                ModifyProjectMembersAndRemoveUserId1701647565290,
                AddApiKeys1701716639135,
                AddEmbeddingFeatureToPlatform1701794452891,
                AddPlatformIdToFlowTemplates1703411318826,
            )
            break
        case ApEdition.ENTERPRISE:
            commonMigration.push(
                AddTemplates1685538145476,
                AddPinnedAndBlogUrlToTemplates1686133672743,
                AddPinnedOrder1686154285890,
                AddProjectIdToTemplate1688083336934,
                FlowTemplateAddUserIdAndImageUrl1694379223109,
                AddFeaturedDescriptionAndFlagToTemplates1694604120205,
                AddProjectMembers1689177797092,
                ProjectMemberRelations1694381968985,
                AddPlatform1697717995884,
                AddCustomDomain1698077078271,
                AddSigningKey1698602417745,
                AddDisplayNameToSigningKey1698698190965,
                AddOAuth2AppEntiity1699221414907,
                AddFilteredPiecesToPlatform1699281870038,
                AddSmtpAndPrivacyUrlToPlatform1699491705906,
                AddOtpEntity1700396157624,
                AddPlatformDefaultLanguage1700406308445,
                MakeStripeSubscriptionNullable1685053959806,
                AddBillingParameters1688739844617,
                AddTasksPerDays1689336533370,
                RemoveCalculatedMetrics1689806173642,
                ModifyBilling1694902537045,
                RemoveUnusedFieldsinBilling1700132368636,
                AddDatasourcesLimit1695916063833,
                MakeStripeCustomerIdNullable1700751925992,
                AddStateToOtp1701084418793,
                MigrateEeUsersToOldestPlatform1701261357197,
                ModifyProjectMembersAndRemoveUserId1701647565290,
                AddApiKeys1701716639135,
                AddEmbeddingFeatureToPlatform1701794452891,
                AddPlatformIdToFlowTemplates1703411318826,
            )
            break
        case ApEdition.COMMUNITY:
            break
    }

    return commonMigration
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

export const createPostgresDataSource = (): DataSource => {

    const database = system.getOrThrow(SystemProp.POSTGRES_DATABASE)
    const host = system.getOrThrow(SystemProp.POSTGRES_HOST)
    const password = system.getOrThrow(SystemProp.POSTGRES_PASSWORD)
    const serializedPort = system.getOrThrow(SystemProp.POSTGRES_PORT)
    const port = Number.parseInt(serializedPort, 10)
    const username = system.getOrThrow(SystemProp.POSTGRES_USERNAME)
    const migrationConfig = getMigrationConfig()

    return new DataSource({
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        ssl: getSslConfig(),
        ...migrationConfig,
        ...commonProperties,
    })
}

type MigrationConfig = {
    migrationsRun?: boolean
    migrationsTransactionMode?: 'all' | 'none' | 'each'
    migrations?: (new () => MigrationInterface)[]
}
