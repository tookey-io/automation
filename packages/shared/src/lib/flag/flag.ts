import { BaseModel } from "../common/base-model";
import { ApId } from "../common/id-generator";

export type FlagId = ApId;

export interface Flag extends BaseModel<FlagId> {
    value: unknown;
}

export const enum ApEnvironment {
    PRODUCTION = "prod",
    DEVELOPMENT = "dev"
}

export const enum ApEdition {
    COMMUNITY = "ce",
    ENTERPRISE = "ee",
    CLOUD = "cloud"
}

export enum ApFlagId {
    SANDBOX_RUN_TIME_SECONDS = 'SANDBOX_RUN_TIME_SECONDS',
    FRONTEND_URL = "FRONTEND_URL",
    EDITION = "EDITION",
    ENVIRONMENT = "ENVIRONMENT",
    WEBHOOK_URL_PREFIX = "WEBHOOK_URL_PREFIX",
    USER_CREATED = "USER_CREATED",
    SIGN_UP_ENABLED = "SIGN_UP_ENABLED",
    TELEMETRY_ENABLED = "TELEMETRY_ENABLED",
    CURRENT_VERSION = "CURRENT_VERSION",
    LATEST_VERSION = "LATEST_VERSION",
    CLOUD_AUTH_ENABLED = "CLOUD_AUTH_ENABLED",
    TEMPLATES_SOURCE_URL = "TEMPLATES_SOURCE_URL"
}
