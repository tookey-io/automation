import { ExecutionOutputStatus } from '@activepieces/shared'
import { ExecutionVerdict, FlowExecutorContext } from '../../src/lib/handler/context/flow-execution-context'
import { EXECUTE_CONSTANTS, buildPieceAction } from './test-helper'
import { flowExecutor } from '../../src/lib/handler/flow-executor'

describe('flow with response', () => {

    it('should execute return response successfully', async () => {
        const response = {
            status: 200,
            headers: {
                'random': 'header',
            },
            body: {
                'hello': 'world',
            },
        }
        const result = await flowExecutor.execute({
            action: buildPieceAction({
                name: 'http',
                pieceName: '@activepieces/piece-http',
                actionName: 'return_response',
                input: response,
            }), executionState: FlowExecutorContext.empty(), constants: EXECUTE_CONSTANTS,
        })
        expect(result.verdict).toBe(ExecutionVerdict.SUCCEEDED)
        expect(result.verdictResponse).toEqual({
            reason: ExecutionOutputStatus.STOPPED,
            stopResponse: response,
        })
        expect(result.steps.http.output).toEqual(response)
    })

})