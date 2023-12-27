import { ExecutionVerdict, FlowExecutorContext } from '../../src/lib/handler/context/flow-execution-context'
import { EXECUTE_CONSTANTS, buildActionWithOneCondition, buildCodeAction } from './test-helper'
import { flowExecutor } from '../../src/lib/handler/flow-executor'
import { BranchAction, BranchCondition, BranchOperator } from '@activepieces/shared'



function buildSimpleBranchingWithOneCondition(condition: BranchCondition): BranchAction {
    return {
        ...buildActionWithOneCondition({
            condition,
            onSuccessAction: buildCodeAction({
                name: 'echo_step',
                input: {
                    'success': 'true',
                },
            }),
            onFailureAction: buildCodeAction({
                name: 'echo_step_1',
                input: {
                    'failure': 'true',
                },
            }),
        }),
    }
}

describe('flow with branching', () => {

    it('should execute on success branch', async () => {
        const result = await flowExecutor.execute({
            action: buildSimpleBranchingWithOneCondition({
                operator: BranchOperator.TEXT_EXACTLY_MATCHES,
                firstValue: 'test',
                secondValue: 'test',
                caseSensitive: false,

            }),
            executionState: FlowExecutorContext.empty(),
            constants: EXECUTE_CONSTANTS,
        })

        expect(result.verdict).toBe(ExecutionVerdict.RUNNING)
        expect(result.steps.echo_step.output).toEqual({
            'success': 'true',
        })
        expect(result.steps.echo_step_1).toBeUndefined()
    })

    it('should execute on failure branch', async () => {
        const result = await flowExecutor.execute({
            action: buildSimpleBranchingWithOneCondition({
                operator: BranchOperator.TEXT_EXACTLY_MATCHES,
                firstValue: 'test',
                secondValue: 'anything',
                caseSensitive: false,

            }),
            executionState: FlowExecutorContext.empty(),
            constants: EXECUTE_CONSTANTS,
        })

        expect(result.verdict).toBe(ExecutionVerdict.RUNNING)
        expect(result.steps.echo_step).toBeUndefined()
        expect(result.steps.echo_step_1.output).toEqual({
            'failure': 'true',
        })
    })
})