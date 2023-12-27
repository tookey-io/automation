import { AppConnectionValue } from '../app-connection/app-connection'
import { FlowRunId } from '../flow-run/flow-run'
import { FlowVersion } from '../flows/flow-version'
import { ProjectId } from '../project/project'
import { PiecePackage } from '../pieces'
import { ExecutionState, ExecutionType } from '../flow-run/execution/execution-output'

export enum EngineOperationType {
    EXTRACT_PIECE_METADATA = 'EXTRACT_PIECE_METADATA',
    EXECUTE_STEP = 'EXECUTE_STEP',
    EXECUTE_TEST_FLOW = 'EXECUTE_TEST_FLOW',
    EXECUTE_FLOW = 'EXECUTE_FLOW',
    EXECUTE_PROPERTY = 'EXECUTE_PROPERTY',
    EXECUTE_TRIGGER_HOOK = 'EXECUTE_TRIGGER_HOOK',
    EXECUTE_VALIDATE_AUTH = 'EXECUTE_VALIDATE_AUTH',
}

export enum TriggerHookType {
    ON_ENABLE = 'ON_ENABLE',
    ON_DISABLE = 'ON_DISABLE',
    HANDSHAKE = 'HANDSHAKE',
    RUN = 'RUN',
    TEST = 'TEST',
}

export type EngineOperation =
    | ExcuteStepOperation
    | ExecuteFlowOperation
    | ExecutePropsOptions
    | ExecuteTriggerOperation<TriggerHookType>
    | ExecuteExtractPieceMetadata
    | ExecuteValidateAuthOperation

export type BaseEngineOperation = {
    projectId: ProjectId
    workerToken: string
    serverUrl: string
}

export type ExecuteValidateAuthOperation = BaseEngineOperation & {
    piece: PiecePackage
    auth: AppConnectionValue
}

export type ExecuteExtractPieceMetadata = PiecePackage & { projectId: string }

export type ExcuteStepOperation = BaseEngineOperation &  {
    stepName: string
    flowVersion: FlowVersion
}

export type ExecutePropsOptions = BaseEngineOperation & {
    piece: PiecePackage
    propertyName: string
    stepName: string
    input: Record<string, unknown>
}

type BaseExecuteFlowOperation<T extends ExecutionType> = BaseEngineOperation & {
    flowVersion: FlowVersion
    flowRunId: FlowRunId
    triggerPayload: unknown
    executionType: T
}

export type BeginExecuteFlowOperation = BaseExecuteFlowOperation<ExecutionType.BEGIN> & {
    executionState?: ExecutionState
}

export type ResumeExecuteFlowOperation = BaseExecuteFlowOperation<ExecutionType.RESUME> & {
    executionState: ExecutionState
    resumePayload: unknown
}

export type ExecuteFlowOperation = BeginExecuteFlowOperation | ResumeExecuteFlowOperation

export type EngineTestOperation = BeginExecuteFlowOperation & {
    /**
     * original flow version that the current test flow version is derived from.
     * Used to generate the test execution context.
     */
    sourceFlowVersion: FlowVersion
}

export type ExecuteTriggerOperation<HT extends TriggerHookType> = BaseEngineOperation & {
    hookType: HT
    flowVersion: FlowVersion
    webhookUrl: string
    triggerPayload?: TriggerPayload
    edition?: string
    appWebhookUrl?: string
    webhookSecret?: string
}

export type TriggerPayload<T = unknown> = {
    body: T
    headers: Record<string, string>
    queryParams: Record<string, string>
}

export type EventPayload<B = unknown> = {
    body: B
    rawBody?: unknown
    method: string
    headers: Record<string, string>
    queryParams: Record<string, string>
}

export type ParseEventResponse = {
    event?: string
    identifierValue?: string
    reply?: {
        headers: Record<string, string>
        body: unknown
    }
}

export type AppEventListener = {
    events: string[]
    identifierValue: string
}


type ExecuteTestOrRunTriggerResponse = {
    success: boolean
    message?: string
    output: unknown[]
}

type ExecuteHandshakeTriggerResponse = {
    success: boolean
    message?: string
    response?: {
        status: number
        body?: unknown
        headers?: Record<string, string>
    }
}

type ExecuteOnEnableTriggerResponse = {
    listeners: AppEventListener[]
    scheduleOptions?: ScheduleOptions
}

export type ExecuteTriggerResponse<H extends TriggerHookType> = H extends TriggerHookType.RUN ? ExecuteTestOrRunTriggerResponse :
    H extends TriggerHookType.HANDSHAKE ? ExecuteHandshakeTriggerResponse :
        H extends TriggerHookType.TEST ? ExecuteTestOrRunTriggerResponse :
            H extends TriggerHookType.ON_DISABLE ? Record<string, never> :
                ExecuteOnEnableTriggerResponse

export type ExecuteActionResponse = {
    success: boolean
    output: unknown
    message?: string
}

type BaseExecuteValidateAuthResponseOutput<Valid extends boolean> = {
    valid: Valid
}

type ValidExecuteValidateAuthResponseOutput = BaseExecuteValidateAuthResponseOutput<true>

type InvalidExecuteValidateAuthResponseOutput = BaseExecuteValidateAuthResponseOutput<false> & {
    error: string
}
export type ExecuteValidateAuthResponse =
    | ValidExecuteValidateAuthResponseOutput
    | InvalidExecuteValidateAuthResponseOutput

export type ScheduleOptions = {
    cronExpression: string
    timezone: string
}

export type EngineResponse<T> = {
    status: EngineResponseStatus
    response: T
}

export enum EngineResponseStatus {
    OK = 'OK',
    ERROR = 'ERROR',
    TIMEOUT = 'TIMEOUT',
}
