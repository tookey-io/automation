import { AppConnectionId } from '../app-connection/app-connection'
import { FileId } from '../file/file'
import { FlowRunId } from '../flow-run/flow-run'
import { FlowId } from '../flows/flow'
import { FlowVersionId } from '../flows/flow-version'
import { ApId } from './id-generator'

export class ActivepiecesError extends Error {
    constructor(public error: ErrorParams, message?: string) {
        super(error.code + (message ? `: ${message}` : ''));
    }
}

type ErrorParams =
    | AppConnectionNotFoundErrorParams
    | AuthenticationParams
    | AuthorizationErrorParams
    | PermissionDeniedErrorParams
    | ConfigNotFoundErrorParams
    | EmailIsNotVerifiedErrorParams
    | EngineOperationFailureParams
    | EntityNotFoundErrorParams
    | ExecutionTimeoutErrorParams
    | ExistingUserErrorParams
    | FileNotFoundErrorParams
    | FlowNotFoundErrorParams
    | FlowOperationErrorParams
    | FlowRunNotFoundErrorParams
    | InvalidApiKeyParams
    | InvalidAppConnectionParams
    | InvalidBearerTokenParams
    | InvalidClaimParams
    | InvalidCloudClaimParams
    | InvalidCredentialsErrorParams
    | InvalidJwtTokenErrorParams
    | InvalidOtpParams
    | InvitationOnlySignUpParams
    | JobRemovalFailureErrorParams
    | OpenAiFailedErrorParams
    | PauseMetadataMissingErrorParams
    | PieceNotFoundErrorParams
    | PieceTriggerNotFoundErrorParams
    | QuotaExceededParams
    | SignUpDisabledParams
    | StepNotFoundErrorParams
    | SystemInvalidErrorParams
    | SystemPropNotDefinedErrorParams
    | QuotaExceededParams
    | InvalidOtpParams
    | PermissionDeniedErrorParams
    | TestTriggerFailedErrorParams
    | TriggerDisableErrorParams
    | TriggerEnableErrorParams
    | TriggerFailedErrorParams
    | ValidationErrorParams
    | InvitationOnlySignUpParams
    | UserIsInActiveErrorParams
    | DomainIsNotAllowedErrorParams
    | EmailAuthIsDisabledParams

export type BaseErrorParams<T, V> = {
    code: T;
    params: V;
};

export type InvitationOnlySignUpParams = BaseErrorParams<
ErrorCode.INVITATION_ONLY_SIGN_UP,
Record<string, never>
>

export type InvalidClaimParams = BaseErrorParams<ErrorCode.INVALID_CLAIM, { redirectUrl: string, tokenUrl: string, clientId: string }>
export type InvalidCloudClaimParams = BaseErrorParams<ErrorCode.INVALID_CLOUD_CLAIM, { pieceName: string }>

export type InvalidBearerTokenParams = BaseErrorParams<
    ErrorCode.INVALID_BEARER_TOKEN,
    {
        message?: string;
    }
>;

export type FileNotFoundErrorParams = BaseErrorParams<
    ErrorCode.FILE_NOT_FOUND,
    { id: FileId }
>;

export type EmailAuthIsDisabledParams = BaseErrorParams<ErrorCode.EMAIL_AUTH_DISABLED, Record<string, never>>

export type AppConnectionNotFoundErrorParams = BaseErrorParams<
    ErrorCode.APP_CONNECTION_NOT_FOUND,
    {
        id: AppConnectionId;
    }
>;

export type AuthorizationErrorParams = BaseErrorParams<
ErrorCode.AUTHORIZATION,
{
    message?: string
}
>

export type PermissionDeniedErrorParams = BaseErrorParams<
    ErrorCode.PERMISSION_DENIED,
    {
        resource: string;
        action: string;
        projectId: string;
    }
>;

export type SystemInvalidErrorParams = BaseErrorParams<
    ErrorCode.SYSTEM_PROP_INVALID,
    {
        prop: string;
    }
>;

export type FlowNotFoundErrorParams = BaseErrorParams<
    ErrorCode.FLOW_NOT_FOUND,
    {
        id: FlowId;
    }
>;

export type FlowRunNotFoundErrorParams = BaseErrorParams<
    ErrorCode.FLOW_RUN_NOT_FOUND,
    {
        id: FlowRunId;
    }
>;

export type InvalidCredentialsErrorParams = BaseErrorParams<
ErrorCode.INVALID_CREDENTIALS,
null
>

export type DomainIsNotAllowedErrorParams = BaseErrorParams<
ErrorCode.DOMAIN_NOT_ALLOWED,
{
    domain: string
}
>

export type EmailIsNotVerifiedErrorParams = BaseErrorParams<
ErrorCode.EMAIL_IS_NOT_VERIFIED,
{
    email: string
}
>

export type UserIsInActiveErrorParams = BaseErrorParams<
ErrorCode.USER_IS_INACTIVE,
{
    email: string
}
>

export type ExistingUserErrorParams = BaseErrorParams<
ErrorCode.EXISTING_USER,
{
    email: string
    platformId: string | null
}
>

export type StepNotFoundErrorParams = BaseErrorParams<
    ErrorCode.STEP_NOT_FOUND,
    {
        pieceName?: string;
        pieceVersion?: string;
        stepName: string;
    }
>;

export type PieceNotFoundErrorParams = BaseErrorParams<
    ErrorCode.PIECE_NOT_FOUND,
    {
        pieceName: string;
        pieceVersion: string | undefined;
    }
>;

export type PieceTriggerNotFoundErrorParams = BaseErrorParams<
    ErrorCode.PIECE_TRIGGER_NOT_FOUND,
    {
        pieceName: string;
        pieceVersion: string;
        triggerName: string;
    }
>;

export type TriggerFailedErrorParams = BaseErrorParams<
    ErrorCode.TRIGGER_FAILED,
    {
        pieceName: string;
        pieceVersion: string;
        triggerName: string;
        error: string | undefined;
    }
>;

export type ConfigNotFoundErrorParams = BaseErrorParams<
    ErrorCode.CONFIG_NOT_FOUND,
    {
        pieceName: string;
        pieceVersion: string;
        stepName: string;
        configName: string;
    }
>;

export type JobRemovalFailureErrorParams = BaseErrorParams<
    ErrorCode.JOB_REMOVAL_FAILURE,
    {
        jobId: ApId;
    }
>;

export type SystemPropNotDefinedErrorParams = BaseErrorParams<
    ErrorCode.SYSTEM_PROP_NOT_DEFINED,
    {
        prop: string;
    }
>;

export type OpenAiFailedErrorParams = BaseErrorParams<
    ErrorCode.OPEN_AI_FAILED,
    Record<string, never>
>;

export type FlowOperationErrorParams = BaseErrorParams<
    ErrorCode.FLOW_OPERATION_INVALID,
    Record<string, never>
>;

export type InvalidJwtTokenErrorParams = BaseErrorParams<
    ErrorCode.INVALID_OR_EXPIRED_JWT_TOKEN,
    {
        token: string;
    }
>;

export type TestTriggerFailedErrorParams = BaseErrorParams<
    ErrorCode.TEST_TRIGGER_FAILED,
    {
        message: string;
    }
>;

export type EntityNotFoundErrorParams = BaseErrorParams<
    ErrorCode.ENTITY_NOT_FOUND,
    {
        message?: string;
        entityType?: string;
        entityId?: string;
    }
>;

export type ExecutionTimeoutErrorParams = BaseErrorParams<
    ErrorCode.EXECUTION_TIMEOUT,
    Record<string, never>
>;

export type ValidationErrorParams = BaseErrorParams<
    ErrorCode.VALIDATION,
    {
        message: string;
    }
>;

export type TriggerEnableErrorParams = BaseErrorParams<
    ErrorCode.TRIGGER_ENABLE,
    {
        flowVersionId?: FlowVersionId;
    }
>;

export type TriggerDisableErrorParams = BaseErrorParams<
    ErrorCode.TRIGGER_DISABLE,
    {
        flowVersionId?: FlowVersionId;
    }
>;

export type PauseMetadataMissingErrorParams = BaseErrorParams<
    ErrorCode.PAUSE_METADATA_MISSING,
    Record<string, never>
>;

export type InvalidApiKeyParams = BaseErrorParams<
    ErrorCode.INVALID_API_KEY,
    Record<string, never>
>;

export type EngineOperationFailureParams = BaseErrorParams<
    ErrorCode.ENGINE_OPERATION_FAILURE,
    {
        message: string;
    }
>;

export type InvalidAppConnectionParams = BaseErrorParams<
    ErrorCode.INVALID_APP_CONNECTION,
    {
        error: string;
    }
>;

export type QuotaExceededParams = BaseErrorParams<
    ErrorCode.QUOTA_EXCEEDED,
    {
        metric:
            | 'connections'
            | 'tasks'
            | 'bots'
            | 'datasource'
            | 'team-members';
        quota: number;
    }
>;

export type SignUpDisabledParams = BaseErrorParams<
ErrorCode.SIGN_UP_DISABLED,
Record<string, never>
>

export type AuthenticationParams = BaseErrorParams<
ErrorCode.AUTHENTICATION,
{
    message: string
}
>

export type InvalidOtpParams = BaseErrorParams<ErrorCode.INVALID_OTP, Record<string, never>>

export enum ErrorCode {
    APP_CONNECTION_NOT_FOUND = 'APP_CONNECTION_NOT_FOUND',
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    CONFIG_NOT_FOUND = 'CONFIG_NOT_FOUND',
    DOMAIN_NOT_ALLOWED = 'DOMAIN_NOT_ALLOWED',
    EMAIL_IS_NOT_VERIFIED = 'EMAIL_IS_NOT_VERIFIED',
    ENGINE_OPERATION_FAILURE = 'ENGINE_OPERATION_FAILURE',
    ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
    EXECUTION_TIMEOUT = 'EXECUTION_TIMEOUT',
    EMAIL_AUTH_DISABLED = 'EMAIL_AUTH_DISABLED',
    EXISTING_USER = 'EXISTING_USER',
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    FLOW_INSTANCE_NOT_FOUND = 'INSTANCE_NOT_FOUND',
    FLOW_NOT_FOUND = 'FLOW_NOT_FOUND',
    FLOW_OPERATION_INVALID = 'FLOW_OPERATION_INVALID',
    FLOW_RUN_NOT_FOUND = 'FLOW_RUN_NOT_FOUND',
    INVALID_API_KEY = 'INVALID_API_KEY',
    INVALID_APP_CONNECTION = 'INVALID_APP_CONNECTION',
    INVALID_BEARER_TOKEN = 'INVALID_BEARER_TOKEN',
    INVALID_CLAIM = 'INVALID_CLAIM',
    INVALID_CLOUD_CLAIM = 'INVALID_CLOUD_CLAIM',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    INVALID_OR_EXPIRED_JWT_TOKEN = 'INVALID_OR_EXPIRED_JWT_TOKEN',
    INVALID_OTP = 'INVALID_OTP',
    INVITATION_ONLY_SIGN_UP = 'INVITATION_ONLY_SIGN_UP',
    JOB_REMOVAL_FAILURE = 'JOB_REMOVAL_FAILURE',
    OPEN_AI_FAILED = 'OPEN_AI_FAILED',
    PAUSE_METADATA_MISSING = 'PAUSE_METADATA_MISSING',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    PIECE_NOT_FOUND = 'PIECE_NOT_FOUND',
    PIECE_TRIGGER_NOT_FOUND = 'PIECE_TRIGGER_NOT_FOUND',
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    SIGN_UP_DISABLED = 'SIGN_UP_DISABLED',
    STEP_NOT_FOUND = 'STEP_NOT_FOUND',
    SYSTEM_PROP_INVALID = 'SYSTEM_PROP_INVALID',
    SYSTEM_PROP_NOT_DEFINED = 'SYSTEM_PROP_NOT_DEFINED',
    TASK_QUOTA_EXCEEDED = 'TASK_QUOTA_EXCEEDED',
    TEST_TRIGGER_FAILED = 'TEST_TRIGGER_FAILED',
    TRIGGER_DISABLE = 'TRIGGER_DISABLE',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    TRIGGER_ENABLE = 'TRIGGER_ENABLE',
    TRIGGER_FAILED = 'TRIGGER_FAILED',
    USER_IS_INACTIVE = 'USER_IS_INACTIVE',
    VALIDATION = 'VALIDATION',

    // TOOKEY: custom errors
}
