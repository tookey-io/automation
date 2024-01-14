import { ActionType, ExecutionOutput, ExecutionOutputStatus, PauseMetadata, StepOutput, StepOutputStatus, StopResponse, isNil } from '@activepieces/shared'
import { StepExecutionPath } from './step-execution-path'
import { loggingUtils } from '../../helper/logging-utils'

export enum ExecutionVerdict {
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED',
}

type VerdictResponse = {
    reason: ExecutionOutputStatus.PAUSED
    pauseMetadata: PauseMetadata
} | {
    reason: ExecutionOutputStatus.STOPPED
    stopResponse: StopResponse
}

export class FlowExecutorContext {
    tasks: number
    tags: readonly string[]
    steps: Readonly<Record<string, StepOutput>>
    currentState: Record<string, unknown>
    duration: number
    verdict: ExecutionVerdict
    verdictResponse: VerdictResponse | undefined
    currentPath: StepExecutionPath

    constructor(copyFrom?: FlowExecutorContext) {
        this.tasks = copyFrom?.tasks ?? 0
        this.tags = copyFrom?.tags ?? []
        this.steps = copyFrom?.steps ?? {}
        this.duration = copyFrom?.duration ?? -1
        this.currentState = copyFrom?.currentState ?? {}
        this.verdict = copyFrom?.verdict ?? ExecutionVerdict.RUNNING
        this.verdictResponse = copyFrom?.verdictResponse ?? undefined
        this.currentPath = copyFrom?.currentPath ?? StepExecutionPath.empty()
    }


    static empty(): FlowExecutorContext {
        return new FlowExecutorContext()
    }

    public isCompleted({ stepName }: { stepName: string }): boolean {
        const stateAtPath = getStateAtPath({ currentPath: this.currentPath, steps: this.steps })
        const stepOutput = stateAtPath[stepName]
        if (isNil(stepOutput)) {
            return false
        }
        return stepOutput.status !== StepOutputStatus.PAUSED
    }

    public setDuration(duration: number): FlowExecutorContext {
        return new FlowExecutorContext({
            ...this,
            duration,
        })
    }

    public addTags(tags: string[]): FlowExecutorContext {
        return new FlowExecutorContext({
            ...this,
            tags: [...this.tags, ...tags].filter((value, index, self) => {
                return self.indexOf(value) === index
            }),
        })
    }

    public increaseTask(tasks = 1): FlowExecutorContext {
        return new FlowExecutorContext({
            ...this,
            tasks: this.tasks + tasks,
        })
    }

    public upsertStep(stepName: string, stepOutput: StepOutput): FlowExecutorContext {
        const steps = {
            ...this.steps,
        }
        const targetMap = getStateAtPath({ currentPath: this.currentPath, steps })
        targetMap[stepName] = stepOutput

        return new FlowExecutorContext({
            ...this,
            tasks: this.tasks,
            currentState: {
                ...this.currentState,
                [stepName]: stepOutput.output,
            },
            steps,
        })
    }

    public setCurrentPath(currentStatePath: StepExecutionPath): FlowExecutorContext {
        return new FlowExecutorContext({
            ...this,
            currentPath: currentStatePath,
        })
    }

    public setVerdict(verdict: ExecutionVerdict, response: VerdictResponse | undefined): FlowExecutorContext {
        return new FlowExecutorContext({
            ...this,
            verdict,
            verdictResponse: response,
        })
    }

    public async toExecutionOutput(): Promise<ExecutionOutput> {
        const baseExecutionOutput = {
            duration: this.duration,
            tasks: this.tasks,
            tags: [...this.tags],
            executionState: {
                steps: await loggingUtils.trimExecution(this.steps),
            },
        }
        switch (this.verdict) {
            case ExecutionVerdict.FAILED:
                return {
                    ...baseExecutionOutput,
                    status: ExecutionOutputStatus.FAILED,
                }
            case ExecutionVerdict.PAUSED: {
                const verdictResponse = this.verdictResponse
                if (verdictResponse?.reason !== ExecutionOutputStatus.PAUSED) {
                    throw new Error('Veridct Response should have pause metadata response')
                }
                return {
                    ...baseExecutionOutput,
                    status: ExecutionOutputStatus.PAUSED,
                    pauseMetadata: verdictResponse.pauseMetadata,
                }
            }
            case ExecutionVerdict.RUNNING:
            case ExecutionVerdict.SUCCEEDED: {
                const verdictResponse = this.verdictResponse
                if (verdictResponse?.reason === ExecutionOutputStatus.STOPPED) {
                    return {
                        ...baseExecutionOutput,
                        status: ExecutionOutputStatus.STOPPED,
                        stopResponse: verdictResponse.stopResponse,
                    }
                }
                return {
                    ...baseExecutionOutput,
                    status: ExecutionOutputStatus.SUCCEEDED,
                }
            }
        }
    }
}


function getStateAtPath({ currentPath, steps }: { currentPath: StepExecutionPath, steps: Record<string, StepOutput> }): Record<string, StepOutput> {
    let targetMap = steps
    currentPath.path.forEach(([stepName, iteration]) => {
        const stepOutput = targetMap[stepName]
        if (!stepOutput.output || stepOutput.type !== ActionType.LOOP_ON_ITEMS) {
            throw new Error('[ExecutionState#getTargetMap] Not instance of Loop On Items step output')
        }
        targetMap = stepOutput.output.iterations[iteration]
    })
    return targetMap
}
