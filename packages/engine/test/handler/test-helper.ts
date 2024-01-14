import { Action, ActionType, BranchAction, BranchCondition, CodeAction, ExecutionType, LoopOnItemsAction, PackageType, PieceAction, PieceType } from '@activepieces/shared'
import { VariableService } from '../../src/lib/services/variable-service'
import { EngineConstants } from '../../src/lib/handler/context/engine-constants'

export const generateMockEngineConstants = (params?: Partial<EngineConstants>): EngineConstants => {
    return new EngineConstants(
        params?.flowId ?? 'flowId',
        params?.flowRunId ?? 'flowRunId',
        params?.serverUrl ?? 'http://127.0.0.1:3000',
        params?.executionType ?? ExecutionType.BEGIN,
        params?.workerToken ?? 'workerToken',
        params?.projectId ?? 'projectId',
        params?.variableService ?? new VariableService({
            projectId: 'projectId',
            workerToken: 'workerToken',
        }),
        params?.testSingleStepMode ?? false,
        params?.filesServiceType ?? 'local',
        params?.resumePayload,
    )
}

export function buildSimpleLoopAction({
    name,
    loopItems,
    firstLoopAction,
}: {
    name: string
    loopItems: string
    firstLoopAction?: Action
}): LoopOnItemsAction {
    return {
        name,
        displayName: 'Loop',
        type: ActionType.LOOP_ON_ITEMS,
        settings: {
            items: loopItems,
            inputUiInfo: {},
        },
        firstLoopAction,
        valid: true,
    }
}



export function buildActionWithOneCondition({ condition, onSuccessAction, onFailureAction }: { condition: BranchCondition, onSuccessAction?: Action, onFailureAction?: Action }): BranchAction {
    return {
        name: 'branch',
        displayName: 'Your Branch Name',
        type: ActionType.BRANCH,
        settings: {
            inputUiInfo: {},
            conditions: [
                [condition],
            ],
        },
        onFailureAction,
        onSuccessAction,
        valid: true,
    }
}


export function buildCodeAction({ name, input, nextAction }: { name: 'echo_step' | 'runtime' | 'echo_step_1', input: Record<string, unknown>, nextAction?: Action }): CodeAction {
    return {
        name,
        displayName: 'Your Action Name',
        type: ActionType.CODE,
        settings: {
            input,
            sourceCode: {
                packageJson: '',
                code: '',
            },
        },
        nextAction,
        valid: true,
    }
}

export function buildPieceAction({ name, input, pieceName, actionName, nextAction }: { name: string, input: Record<string, unknown>, nextAction?: Action, pieceName: string, actionName: string }): PieceAction {
    return {
        name,
        displayName: 'Your Action Name',
        type: ActionType.PIECE,
        settings: {
            input,
            pieceName,
            packageType: PackageType.REGISTRY,
            pieceVersion: '1.0.0', // Not required since it's running in development mode
            pieceType: PieceType.OFFICIAL,
            actionName,
            inputUiInfo: {
                currentSelectedData: {},
            },
        },
        nextAction,
        valid: true,
    }
}
