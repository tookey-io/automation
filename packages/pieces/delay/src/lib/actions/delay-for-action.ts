import { createAction, Property, Validators } from "@activepieces/pieces-framework";
import { ExecutionType, PauseType } from "@activepieces/shared";

enum TimeUnit {
    SECONDS = 'seconds',
    MINUTES = 'minutes',
    HOURS = 'hours',
    DAYS = 'days',
}
export const delayForAction = createAction({
        name: 'delayFor',
        displayName: 'Delay For',
        description: 'Delays the execution of the next action for a given duration',
        props: {
            unit: Property.StaticDropdown({
                displayName: 'Unit',
                description: 'The unit of time to delay the execution of the next action',
                required: true,
                options: {
                    options: [
                        { value: TimeUnit.SECONDS, label: 'Seconds' },
                        { value: TimeUnit.MINUTES, label: 'Minutes' },
                        { value: TimeUnit.HOURS, label: 'Hours' },
                        { value: TimeUnit.DAYS, label: 'Days' },
                    ]
                },
                defaultValue: TimeUnit.SECONDS,
            }),
            delayFor: Property.Number({
                displayName: 'Amount',
                description: 'The number of units to delay the execution of the next action',
                required: true,
                validators: [ Validators.minValue(0)]
            }),
        },
        async run(ctx) {
            const unit = ctx.propsValue.unit ?? TimeUnit.SECONDS
            let delayInMs: number;
            switch(unit){
                case TimeUnit.SECONDS:
                    delayInMs = ctx.propsValue.delayFor * 1000;
                    break;
                case TimeUnit.MINUTES:
                    delayInMs = ctx.propsValue.delayFor * 60 * 1000;
                    break;
                case TimeUnit.HOURS:
                    delayInMs = ctx.propsValue.delayFor * 60 * 60 * 1000;
                    break;
                case TimeUnit.DAYS:
                    delayInMs = ctx.propsValue.delayFor * 24 * 60 * 60 * 1000;
                    break;
            }
            if (ctx.executionType == ExecutionType.RESUME) {
                return {
                    delayForInMs: delayInMs,
                    success: true
                }
            } else if (delayInMs > 1 * 60 * 1000) {
                // use flow pause
                const currentTime = new Date();
                const futureTime = new Date(currentTime.getTime() + delayInMs);
                ctx.run.pause({
                    pauseMetadata: {
                        type: PauseType.DELAY,
                        resumeDateTime: futureTime.toUTCString()
                    }
                });
                return {}; // irrelevant as the flow is being paused, not completed
            } else {
                // use setTimeout
                await new Promise((resolve) => setTimeout(resolve, delayInMs));
                return {
                    delayForInMs: delayInMs,
                    success: true,
                };
            }
        },
});
