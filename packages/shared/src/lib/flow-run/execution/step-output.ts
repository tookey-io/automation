import { TriggerType } from '../../flows/triggers/trigger'
import { ActionType } from '../../flows/actions/action'

export enum StepOutputStatus {
    FAILED = 'FAILED',
    PAUSED = 'PAUSED',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED',
    SUCCEEDED = 'SUCCEEDED',
}

type BaseStepOutputParams<T extends ActionType | TriggerType, OUTPUT> = {
    type: T
    status: StepOutputStatus
    input: unknown
    output?: OUTPUT
    duration?: number
    errorMessage?: unknown
}

export class GenricStepOutput<T extends ActionType | TriggerType, OUTPUT> {
    type: T
    status: StepOutputStatus
    input: unknown
    output?: OUTPUT
    duration?: number
    errorMessage?: unknown

    constructor(step: BaseStepOutputParams<T, OUTPUT>) {
        this.type = step.type
        this.status = step.status
        this.input = step.input
        this.output = step.output
        this.duration = step.duration
        this.errorMessage = step.errorMessage
    }

    setOutput(output: OUTPUT): GenricStepOutput<T, OUTPUT> {
        return new GenricStepOutput<T, OUTPUT>({
            ...this,
            output,
        })
    }

    setStatus(status: StepOutputStatus): GenricStepOutput<T, OUTPUT> {
        return new GenricStepOutput<T, OUTPUT>({
            ...this,
            status,
        })
    }

    setErrorMessage(errorMessage: unknown): GenricStepOutput<T, OUTPUT> {
        return new GenricStepOutput<T, OUTPUT>({
            ...this,
            errorMessage,
        })
    }

    setDuration(duration: number): GenricStepOutput<T, OUTPUT> {
        return new GenricStepOutput<T, OUTPUT>({
            ...this,
            duration,
        })
    }

    static create<T extends ActionType | TriggerType, OUTPUT>({ input, type, status, output }: { input: unknown, type: T, status: StepOutputStatus, output?: OUTPUT }): GenricStepOutput<T, OUTPUT> {
        return new GenricStepOutput<T, OUTPUT>({
            input,
            type,
            status,
            output,
        })
    }

}

export type StepOutput = GenricStepOutput<ActionType.LOOP_ON_ITEMS, LoopStepResult> | GenricStepOutput<ActionType.BRANCH, BranchStepResult> | GenricStepOutput<Exclude<ActionType, ActionType.LOOP_ON_ITEMS | ActionType.BRANCH> | TriggerType, unknown>

type BranchStepResult = {
    condition: boolean
}

export class BranchStepOutput extends GenricStepOutput<ActionType.BRANCH, BranchStepResult> {
    constructor(step: BaseStepOutputParams<ActionType.BRANCH, BranchStepResult>) {
        super(step)
    }

    static init({ input }: { input: unknown }): BranchStepOutput {
        return new BranchStepOutput({
            type: ActionType.BRANCH,
            input,
            status: StepOutputStatus.SUCCEEDED,
        })
    }

}


type LoopStepResult = {
    item: unknown
    index: number
    iterations: Record<string, StepOutput>[]
}

export class LoopStepOutput extends GenricStepOutput<ActionType.LOOP_ON_ITEMS, LoopStepResult> {
    constructor(step: BaseStepOutputParams<ActionType.LOOP_ON_ITEMS, LoopStepResult>) {
        super(step)
        this.output = step.output ?? {
            item: undefined,
            index: 0,
            iterations: [],
        }
    }

    static init({ input }: { input: unknown }): LoopStepOutput {
        return new LoopStepOutput({
            type: ActionType.LOOP_ON_ITEMS,
            input,
            status: StepOutputStatus.SUCCEEDED,
        })
    }

    addIteration({ item, index }: { item: unknown, index: number }): LoopStepOutput {
        return new LoopStepOutput({
            ...this,
            output: {
                item,
                index,
                iterations: [...(this.output?.iterations ?? []), {}],
            },
        })
    }

}
