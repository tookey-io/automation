import {
    ActionType,
    GenricStepOutput,
    StepOutputStatus,
} from '@activepieces/shared'
import { loggingUtils } from '../../src/lib/helper/logging-utils'

describe('Logging Utils', () => {
    it('Should not truncate whole step if its log size exceeds limit', async () => {
        const steps = {
            mockStep: GenricStepOutput.create({
                type: ActionType.CODE,
                status: StepOutputStatus.SUCCEEDED,
                input: {
                    a: 'a'.repeat(2197100),
                },
            }),
        }

        // act
        const result = await loggingUtils.trimExecution(steps)

        // assert
        expect(result.mockStep.input).toHaveProperty<string>('a', '(truncated)')
    })
})
