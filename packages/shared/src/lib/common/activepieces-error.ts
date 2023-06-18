import { AppConnectionId } from "../app-connection/app-connection";
import { FileId } from "../file/file";
import { FlowRunId } from "../flow-run/flow-run";
import { FlowId } from "../flows/flow";
import { FlowVersionId } from "../flows/flow-version";
import { InstanceId } from "../instance";
import { ApId } from "./id-generator";

export class ActivepiecesError extends Error {
  constructor(public error: ErrorParams, message?: string) {
    super(error.code + (message ? `: ${message}` : ""));
  }
}

type ErrorParams =
  | AppConnectionNotFoundErrorParams
  | ConfigNotFoundErrorParams
  | EntityNotFoundErrorParams
  | ExecutionTimeoutErrorParams
  | ExistingUserErrorParams
  | FileNotFoundErrorParams
  | FlowInstanceNotFoundErrorParams
  | FlowNotFoundErrorParams
  | FlowOperationErrorParams
  | FlowRunNotFoundErrorParams
  | FlowVersionNotFoundErrorParams
  | InvalidApiKeyParams
  | InvalidBearerTokenParams
  | InvalidClaimParams
  | InvalidCloudClaimParams
  | InvalidCredentialsErrorParams
  | InvalidJwtTokenErrorParams
  | JobRemovalFailureErrorParams
  | OpenAiFailedErrorParams
  | PauseMetadataMissingErrorParams
  | PieceNotFoundErrorParams
  | PieceTriggerNotFoundErrorParams
  | ProjectNotFoundErrorParams
  | StepNotFoundErrorParams
  | SystemInvalidErrorParams
  | SystemPropNotDefinedErrorParams
  | TaskQuotaExceededErrorParams
  | TestTriggerFailedErrorParams
  | TriggerDisableErrorParams
  | TriggerEnableErrorParams
  | TriggerFailedErrorParams
  | ValidationErrorParams
  | UserNotFoundParams

export interface BaseErrorParams<T, V> {
  code: T;
  params: V;
}

export type UserNotFoundParams = BaseErrorParams<ErrorCode.USER_NOT_FOUND, { id: string }>
export type InvalidClaimParams = BaseErrorParams<ErrorCode.INVALID_CLAIM, { redirectUrl: string, tokenUrl: string, clientId: string }>
export type InvalidCloudClaimParams = BaseErrorParams<ErrorCode.INVALID_CLOUD_CLAIM, { appName: string }>

export type InvalidBearerTokenParams = BaseErrorParams<ErrorCode.INVALID_BEARER_TOKEN, Record<string, null>>;

export type FileNotFoundErrorParams = BaseErrorParams<ErrorCode.FILE_NOT_FOUND, { id: FileId }>;

export type AppConnectionNotFoundErrorParams = BaseErrorParams<
  ErrorCode.APP_CONNECTION_NOT_FOUND,
  {
    id: AppConnectionId;
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
>

export type FlowInstanceNotFoundErrorParams = BaseErrorParams<
  ErrorCode.FLOW_INSTANCE_NOT_FOUND,
  {
    id?: InstanceId
  }
>

export type FlowRunNotFoundErrorParams = BaseErrorParams<
  ErrorCode.FLOW_RUN_NOT_FOUND,
  {
    id: FlowRunId;
  }
>

export type ProjectNotFoundErrorParams = BaseErrorParams<
  ErrorCode.PROJECT_NOT_FOUND,
  {
    id: FlowRunId;
  }
>

export type FlowVersionNotFoundErrorParams = BaseErrorParams<
  ErrorCode.FLOW_VERSION_NOT_FOUND,
  {
    id: FlowVersionId;
  }
>

export type InvalidCredentialsErrorParams = BaseErrorParams<
  ErrorCode.INVALID_CREDENTIALS,
  {
    email: string;
  }
>

export type ExistingUserErrorParams = BaseErrorParams<
  ErrorCode.EXISTING_USER,
  {
    email: string;
  }
>

export type StepNotFoundErrorParams = BaseErrorParams<
  ErrorCode.STEP_NOT_FOUND,
  {
    pieceName?: string;
    pieceVersion?: string;
    stepName: string;
  }
>

export type PieceNotFoundErrorParams = BaseErrorParams<
  ErrorCode.PIECE_NOT_FOUND,
  {
    pieceName: string;
    pieceVersion: string;
  }
>

export type PieceTriggerNotFoundErrorParams = BaseErrorParams<
  ErrorCode.PIECE_TRIGGER_NOT_FOUND,
  {
    pieceName: string;
    pieceVersion: string;
    triggerName: string;
  }
>

export type TriggerFailedErrorParams = BaseErrorParams<
  ErrorCode.TRIGGER_FAILED,
  {
    pieceName: string;
    pieceVersion: string;
    triggerName: string;
    error: string | undefined;
  }
>


export type ConfigNotFoundErrorParams = BaseErrorParams<
  ErrorCode.CONFIG_NOT_FOUND,
  {
    pieceName: string;
    pieceVersion: string;
    stepName: string;
    configName: string;
  }
>

export type JobRemovalFailureErrorParams = BaseErrorParams<
  ErrorCode.JOB_REMOVAL_FAILURE,
  {
    jobId: ApId;
  }
>

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
>

export type TaskQuotaExceededErrorParams = BaseErrorParams<
  ErrorCode.TASK_QUOTA_EXCEEDED,
  {
    projectId: string;
  }
>

export type TestTriggerFailedErrorParams = BaseErrorParams<
  ErrorCode.TEST_TRIGGER_FAILED,
  {
    message: string;
  }
>

export type EntityNotFoundErrorParams = BaseErrorParams<
  ErrorCode.ENTITY_NOT_FOUND,
  {
    message: string
  }
>

export type ExecutionTimeoutErrorParams = BaseErrorParams<
  ErrorCode.EXECUTION_TIMEOUT,
  Record<string, never>
>

export type ValidationErrorParams = BaseErrorParams<
  ErrorCode.VALIDATION,
  {
    message: string
  }
>

export type TriggerEnableErrorParams = BaseErrorParams<
  ErrorCode.TRIGGER_ENABLE,
  {
    flowVersionId?: FlowVersionId
  }
>

export type TriggerDisableErrorParams = BaseErrorParams<
  ErrorCode.TRIGGER_DISABLE,
  {
    flowVersionId?: FlowVersionId
  }
>

export type PauseMetadataMissingErrorParams = BaseErrorParams<
  ErrorCode.PAUSE_METADATA_MISSING,
  Record<string, never>
>

export type InvalidApiKeyParams = BaseErrorParams<
  ErrorCode.INVALID_API_KEY,
  Record<string, never>
>

export enum ErrorCode {
  CONFIG_NOT_FOUND = "CONFIG_NOT_FOUND",
  EXISTING_USER = "EXISTING_USER",
  APP_CONNECTION_NOT_FOUND = "APP_CONNECTION_NOT_FOUND",
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  FLOW_NOT_FOUND = "FLOW_NOT_FOUND",
  FLOW_RUN_NOT_FOUND = "FLOW_RUN_NOT_FOUND",
  FLOW_VERSION_NOT_FOUND = "FLOW_VERSION_NOT_FOUND",
  FLOW_INSTANCE_NOT_FOUND = "INSTANCE_NOT_FOUND",
  INVALID_BEARER_TOKEN = "INVALID_BEARER_TOKEN",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  JOB_REMOVAL_FAILURE = "JOB_REMOVAL_FAILURE",
  PIECE_NOT_FOUND = "PIECE_NOT_FOUND",
  PIECE_TRIGGER_NOT_FOUND = "PIECE_TRIGGER_NOT_FOUND",
  STEP_NOT_FOUND = "STEP_NOT_FOUND",
  SYSTEM_PROP_NOT_DEFINED = "SYSTEM_PROP_NOT_DEFINED",
  INVALID_CLAIM = "INVALID_CLAIM",
  PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND",
  INVALID_CLOUD_CLAIM = "INVALID_CLOUD_CLAIM",
  INVALID_OR_EXPIRED_JWT_TOKEN = "INVALID_OR_EXPIRED_JWT_TOKEN",
  TASK_QUOTA_EXCEEDED = "TASK_QUOTA_EXCEEDED",
  SYSTEM_PROP_INVALID = "SYSTEM_PROP_INVALID",
  TRIGGER_FAILED = "TRIGGER_FAILED",
  FLOW_OPERATION_INVALID = "FLOW_OPERATION_INVALID",
  OPEN_AI_FAILED = "OPEN_AI_FAILED",
  TEST_TRIGGER_FAILED = "TEST_TRIGGER_FAILED",
  ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
  VALIDATION = "VALIDATION",
  EXECUTION_TIMEOUT = "EXECUTION_TIMEOUT",
  TRIGGER_ENABLE = "TRIGGER_ENABLE",
  TRIGGER_DISABLE = "TRIGGER_DISABLE",
  PAUSE_METADATA_MISSING = "PAUSE_METADATA_MISSING",
  INVALID_API_KEY = "INVALID_API_KEY",
  USER_NOT_FOUND = "USER_NOT_FOUND"
}
