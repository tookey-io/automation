import { KeyAlgorithm, SigningKey, Platform, OAuthApp, FilteredPieceBehavior, CustomDomain, CustomDomainStatus, OtpModel, OtpType, OtpState, ProjectMember, ApiKey, ProjectMemberRole, ProjectMemberStatus } from '@activepieces/ee-shared'
import { UserStatus, User, apId, Project, NotificationStatus, ProjectType, PieceType, PackageType, Flow, FlowStatus, FlowVersion, TriggerType, FlowVersionState, FlowTemplate, TemplateType } from '@activepieces/shared'
import { faker } from '@faker-js/faker'
import { PieceMetadataSchema } from '../../../src/app/pieces/piece-metadata-entity'
import bcrypt from 'bcrypt'
import { OAuthAppWithEncryptedSecret } from '../../../src/app/ee/oauth-apps/oauth-app.entity'
import { encryptString } from '../../../src/app/helper/encryption'
import dayjs from 'dayjs'
import { generateApiKey } from '../../../src/app/ee/api-keys/api-key-service'

export const CLOUD_PLATFORM_ID = 'cloud-id'

export const createMockUser = (user?: Partial<User>): User => {
    return {
        id: user?.id ?? apId(),
        created: user?.created ?? faker.date.recent().toISOString(),
        updated: user?.updated ?? faker.date.recent().toISOString(),
        email: user?.email ?? faker.internet.email(),
        firstName: user?.firstName ?? faker.person.firstName(),
        lastName: user?.lastName ?? faker.person.lastName(),
        trackEvents: user?.trackEvents ?? faker.datatype.boolean(),
        newsLetter: user?.newsLetter ?? faker.datatype.boolean(),
        password: user?.password ? bcrypt.hashSync(user.password, 10) : faker.internet.password(),
        status: user?.status ?? faker.helpers.enumValue(UserStatus),
        imageUrl: user?.imageUrl,
        title: user?.title,
        externalId: user?.externalId,
        platformId: user?.platformId ?? null,
    }
}

export const createMockOAuthApp = (oAuthApp?: Partial<OAuthApp>): OAuthAppWithEncryptedSecret => {
    return {
        id: oAuthApp?.id ?? apId(),
        created: oAuthApp?.created ?? faker.date.recent().toISOString(),
        updated: oAuthApp?.updated ?? faker.date.recent().toISOString(),
        platformId: oAuthApp?.platformId ?? apId(),
        pieceName: oAuthApp?.pieceName ?? faker.lorem.word(),
        clientId: oAuthApp?.clientId ?? apId(),
        clientSecret: encryptString(faker.lorem.word()),
    }
}

export const createMockTemplate = (template?: Partial<FlowTemplate>): FlowTemplate => {
    return {
        name: template?.name ?? faker.lorem.word(),
        description: template?.description ?? faker.lorem.sentence(),
        type: template?.type ?? faker.helpers.enumValue(TemplateType),
        tags: template?.tags ?? [],
        pieces: template?.pieces ?? [],
        blogUrl: template?.blogUrl ?? faker.internet.url(),
        template: template?.template ?? createMockFlowVersion(),
        projectId: template?.projectId ?? apId(),
        platformId: template?.platformId ?? apId(),
        id: template?.id ?? apId(),
        created: template?.created ?? faker.date.recent().toISOString(),
        updated: template?.updated ?? faker.date.recent().toISOString(),
    }
}

export const createMockProject = (project?: Partial<Project>): Project => {
    return {
        id: project?.id ?? apId(),
        created: project?.created ?? faker.date.recent().toISOString(),
        updated: project?.updated ?? faker.date.recent().toISOString(),
        ownerId: project?.ownerId ?? apId(),
        displayName: project?.displayName ?? faker.lorem.word(),
        notifyStatus: project?.notifyStatus ?? faker.helpers.enumValue(NotificationStatus),
        type: project?.type ?? faker.helpers.enumValue(ProjectType),
        platformId: project?.platformId ?? apId(),
        externalId: project?.externalId ?? apId(),
    }
}

export const createMockPlatform = (platform?: Partial<Platform>): Platform => {
    return {
        id: platform?.id ?? apId(),
        created: platform?.created ?? faker.date.recent().toISOString(),
        updated: platform?.updated ?? faker.date.recent().toISOString(),
        ownerId: platform?.ownerId ?? apId(),
        name: platform?.name ?? faker.lorem.word(),
        primaryColor: platform?.primaryColor ?? faker.color.rgb(),
        logoIconUrl: platform?.logoIconUrl ?? faker.image.urlPlaceholder(),
        fullLogoUrl: platform?.fullLogoUrl ?? faker.image.urlPlaceholder(),
        favIconUrl: platform?.favIconUrl ?? faker.image.urlPlaceholder(),
        filteredPieceNames: platform?.filteredPieceNames ?? [],
        filteredPieceBehavior: platform?.filteredPieceBehavior ?? faker.helpers.enumValue(FilteredPieceBehavior),
        smtpHost: platform?.smtpHost ?? faker.internet.domainName(),
        smtpPort: platform?.smtpPort ?? faker.internet.port(),
        smtpUser: platform?.smtpUser ?? faker.internet.userName(),
        smtpPassword: platform?.smtpPassword ?? faker.internet.password(),
        smtpUseSSL: platform?.smtpUseSSL ?? faker.datatype.boolean(),
        smtpSenderEmail: platform?.smtpSenderEmail ?? faker.internet.email(),
        privacyPolicyUrl: platform?.privacyPolicyUrl ?? faker.internet.url(),
        termsOfServiceUrl: platform?.termsOfServiceUrl ?? faker.internet.url(),
        embeddingEnabled: platform?.embeddingEnabled ?? faker.datatype.boolean(),
        cloudAuthEnabled: platform?.cloudAuthEnabled ?? faker.datatype.boolean(),
        showPoweredBy: platform?.showPoweredBy ?? faker.datatype.boolean(),
    }
}

export const createMockPlatformWithOwner = (params?: CreateMockPlatformWithOwnerParams): CreateMockPlatformWithOwnerReturn => {
    const mockOwnerId = params?.owner?.id ?? apId()
    const mockPlatformId = params?.platform?.id ?? apId()

    const mockOwner = createMockUser({
        ...params?.owner,
        id: mockOwnerId,
        platformId: mockPlatformId,
    })

    const mockPlatform = createMockPlatform({
        ...params?.platform,
        id: mockPlatformId,
        ownerId: mockOwnerId,
    })

    return {
        mockPlatform,
        mockOwner,
    }
}

export const createMockProjectMember = (projectMember?: Partial<ProjectMember>): ProjectMember => {
    return {
        id: projectMember?.id ?? apId(),
        created: projectMember?.created ?? faker.date.recent().toISOString(),
        updated: projectMember?.updated ?? faker.date.recent().toISOString(),
        platformId: projectMember?.platformId ?? null,
        email: projectMember?.email ?? faker.internet.email(),
        projectId: projectMember?.projectId ?? apId(),
        role: projectMember?.role ?? faker.helpers.enumValue(ProjectMemberRole),
        status: projectMember?.status ?? faker.helpers.enumValue(ProjectMemberStatus),
    }
}


const MOCK_SIGNING_KEY_PUBLIC_KEY = `-----BEGIN RSA PUBLIC KEY-----
MIICCgKCAgEAlnd5vGP/1bzcndN/yRD+ZTd6tuemxaJd+12bOZ2QCXcTM03AKSp3
NE5QMyIi13PXMg+z1uPowfivPJ4iVTMaW1U00O7JlUduGR0VrG0BCJlfEf852V71
TfE+2+EpMme9Yw6Gs/YAuOwgVwu3n/XF0il3FTIm1oY1a/MA79rv0RSscnIgCaYJ
e86LWm+H6753Si0MIId/ajIfYYIndN6qRIlPsgagdL+kljUSPEiIzmV0POxTltBo
tXL1t7Mu+meJrY85MXG5W8BS05+q6dJql7Cl0UbPK152ziakB+biMI/4hYlaOIBT
3KeOcz/Jg7Zv21Y0tbdrZ5osVrrNpFsCV7PGyQIUDVmmnCHrOEBS2XM5zOHzTxMl
JQh3Db318rB5415zuBTzrO+20++03kH4SwZEEBg1SDAInYwLOWldbTuZuD0Hx7P2
g4a3OqHHVOcAgtsHgmU7/zCgCIETg4KbRdpSsqOm/YJDWWoLDTwvKnH5QHSBacq1
kxbNAUSuLQESkfZq1Dw5+tdBDJr29bxjmiSggyittTYn1B3iHACNoe4zj9sMQQIf
j9mmntXsa/leIwBVspiEOHYZwJOe5+goSd8K1VIQJxC1DVBxB2eHxMvuo3eyJ0HE
DlebIeZy4zrE1LPgRic1kfdemyxvuN3iwZnPGiY79nL1ZNDM3M4ApSMCAwEAAQ==
-----END RSA PUBLIC KEY-----`

export const createMockApiKey = (apiKey?: Partial<Omit<ApiKey, 'hashedValue' | 'truncatedValue'>>): ApiKey & { value: string } => {
    const { secretHashed, secretTruncated, secret } = generateApiKey()
    return {
        id: apiKey?.id ?? apId(),
        created: apiKey?.created ?? faker.date.recent().toISOString(),
        updated: apiKey?.updated ?? faker.date.recent().toISOString(),
        displayName: apiKey?.displayName ?? faker.lorem.word(),
        platformId: apiKey?.platformId ?? apId(),
        hashedValue: secretHashed,
        value: secret,
        truncatedValue: secretTruncated,
    }
}

export const setupMockApiKeyServiceAccount = (params?: SetupMockApiKeyServiceAccountParams): SetupMockApiKeyServiceAccountReturn => {
    const { mockOwner, mockPlatform } = createMockPlatformWithOwner({
        owner: params?.owner,
        platform: params?.platform,
    })

    const mockApiKey = createMockApiKey({
        ...params?.apiKey,
        platformId: mockPlatform.id,
    })

    return {
        mockOwner,
        mockPlatform,
        mockApiKey,
    }
}

export const createMockSigningKey = (signingKey?: Partial<SigningKey>): SigningKey => {
    return {
        id: signingKey?.id ?? apId(),
        created: signingKey?.created ?? faker.date.recent().toISOString(),
        updated: signingKey?.updated ?? faker.date.recent().toISOString(),
        displayName: signingKey?.displayName ?? faker.lorem.word(),
        platformId: signingKey?.platformId ?? apId(),
        publicKey: signingKey?.publicKey ?? MOCK_SIGNING_KEY_PUBLIC_KEY,
        generatedBy: signingKey?.generatedBy ?? apId(),
        algorithm: signingKey?.algorithm ?? KeyAlgorithm.RSA,
    }
}

export const createProjectMember = (projectMember: Partial<ProjectMember>): ProjectMember => {
    return {
        id: projectMember.id ?? apId(),
        email: projectMember.email ?? faker.internet.email(),
        platformId: projectMember.platformId ?? apId(),
        projectId: projectMember.projectId ?? apId(),
        role: projectMember.role ?? faker.helpers.enumValue(ProjectMember.Role),
        status: projectMember.status ?? faker.helpers.enumValue(ProjectMember.Status),
        created: projectMember.created ?? faker.date.recent().toISOString(),
        updated: projectMember.updated ?? faker.date.recent().toISOString(),
    }
}

export const createMockPieceMetadata = (pieceMetadata?: Partial<Omit<PieceMetadataSchema, 'project'>>): Omit<PieceMetadataSchema, 'project'> => {
    return {
        id: pieceMetadata?.id ?? apId(),
        created: pieceMetadata?.created ?? faker.date.recent().toISOString(),
        updated: pieceMetadata?.updated ?? faker.date.recent().toISOString(),
        name: pieceMetadata?.name ?? faker.lorem.word(),
        displayName: pieceMetadata?.displayName ?? faker.lorem.word(),
        logoUrl: pieceMetadata?.logoUrl ?? faker.image.urlPlaceholder(),
        description: pieceMetadata?.description ?? faker.lorem.sentence(),
        projectId: pieceMetadata?.projectId,
        directoryName: pieceMetadata?.directoryName,
        auth: pieceMetadata?.auth,
        platformId: pieceMetadata?.platformId,
        version: pieceMetadata?.version ?? faker.system.semver(),
        minimumSupportedRelease: pieceMetadata?.minimumSupportedRelease ?? '0.0.0',
        maximumSupportedRelease: pieceMetadata?.maximumSupportedRelease ?? '9.9.9',
        actions: pieceMetadata?.actions ?? {},
        triggers: pieceMetadata?.triggers ?? {},
        pieceType: pieceMetadata?.pieceType ?? faker.helpers.enumValue(PieceType),
        packageType: pieceMetadata?.packageType ?? faker.helpers.enumValue(PackageType),
        archiveId: pieceMetadata?.archiveId,
    }
}

export const createMockCustomDomain = (customDomain?: Partial<CustomDomain>): CustomDomain => {
    return {
        id: customDomain?.id ?? apId(),
        created: customDomain?.created ?? faker.date.recent().toISOString(),
        updated: customDomain?.updated ?? faker.date.recent().toISOString(),
        domain: customDomain?.domain ?? faker.internet.domainName(),
        platformId: customDomain?.platformId ?? apId(),
        status: customDomain?.status ?? faker.helpers.enumValue(CustomDomainStatus),
    }
}

export const createMockOtp = (otp?: Partial<OtpModel>): OtpModel => {
    const now = dayjs()
    const twentyMinutesAgo = now.subtract(20, 'minutes')

    return {
        id: otp?.id ?? apId(),
        created: otp?.created ?? faker.date.recent().toISOString(),
        updated: otp?.updated ?? faker.date.between({ from: twentyMinutesAgo.toDate(), to: now.toDate() }).toISOString(),
        type: otp?.type ?? faker.helpers.enumValue(OtpType),
        userId: otp?.userId ?? apId(),
        value: otp?.value ?? faker.number.int({ min: 100000, max: 999999 }).toString(),
        state: otp?.state ?? faker.helpers.enumValue(OtpState),
    }
}

export const createMockFlow = (flow?: Partial<Flow>): Flow => {
    return {
        id: flow?.id ?? apId(),
        created: flow?.created ?? faker.date.recent().toISOString(),
        updated: flow?.updated ?? faker.date.recent().toISOString(),
        projectId: flow?.projectId ?? apId(),
        status: flow?.status ?? faker.helpers.enumValue(FlowStatus),
        folderId: flow?.folderId ?? null,
        schedule: flow?.schedule ?? null,
        publishedVersionId: flow?.publishedVersionId ?? null,
    }
}

export const createMockFlowVersion = (flowVersion?: Partial<FlowVersion>): FlowVersion => {
    const emptyTrigger = {
        type: TriggerType.EMPTY,
        name: 'trigger',
        settings: {},
        valid: false,
        displayName: 'Select Trigger',
    } as const

    return {
        id: flowVersion?.id ?? apId(),
        created: flowVersion?.created ?? faker.date.recent().toISOString(),
        updated: flowVersion?.updated ?? faker.date.recent().toISOString(),
        displayName: flowVersion?.displayName ?? faker.word.words(),
        flowId: flowVersion?.flowId ?? apId(),
        trigger: flowVersion?.trigger ?? emptyTrigger,
        state: flowVersion?.state ?? faker.helpers.enumValue(FlowVersionState),
        updatedBy: flowVersion?.updatedBy ?? apId(),
        valid: flowVersion?.valid ?? faker.datatype.boolean(),
    }
}

type CreateMockPlatformWithOwnerParams = {
    platform?: Partial<Omit<Platform, 'ownerId'>>
    owner?: Partial<Omit<User, 'platformId'>>
}

type CreateMockPlatformWithOwnerReturn = {
    mockPlatform: Platform
    mockOwner: User
}

type SetupMockApiKeyServiceAccountParams = CreateMockPlatformWithOwnerParams & {
    apiKey?: Partial<Omit<ApiKey, 'hashedValue' | 'truncatedValue'>>
}

type SetupMockApiKeyServiceAccountReturn = CreateMockPlatformWithOwnerReturn & {
    mockApiKey: ApiKey & { value: string }
}
