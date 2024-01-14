
export enum LiceneseStatus {
    VALID = 'VALID',
    INVALID = 'INVALID',
    UNKNOWN = 'UNKNOWN',
}

export type SuccessLicenseResponse = {
    status: LiceneseStatus.VALID
    showPoweredBy?: boolean
    ssoEnabled?: boolean
    embeddingEnabled?: boolean
    gitSyncEnabled?: boolean
}
export type LicenseResponse = SuccessLicenseResponse | {
    status: LiceneseStatus.INVALID
} | {
    status: LiceneseStatus.UNKNOWN
}

export type LicenseValidator = {
    validate: () => Promise<LicenseResponse>
}
