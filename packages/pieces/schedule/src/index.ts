
import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { cronExpressionTrigger } from './lib/triggers/cron-expression.trigger';
import { everyDayTrigger } from './lib/triggers/every-day.trigger';
import { everyHourTrigger } from './lib/triggers/every-hour.trigger';
import { everyMonthTrigger } from './lib/triggers/every-month.trigger';
import { everyWeekTrigger } from './lib/triggers/every-week.trigger';
import { everyXMinutesTrigger } from './lib/triggers/every-x-minutes.trigger';

export const schedule = createPiece({
  displayName: 'Schedule',
    logoUrl: 'https://cdn.activepieces.com/pieces/schedule.png',
  description:"Trigger flow with fixed schedule",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.5.0',
  authors: [
    "abuaboud", "AbdulTheActivePiecer"
  ],
  actions: [
  ],
  triggers: [
    everyXMinutesTrigger,
    everyHourTrigger,
    everyDayTrigger,
    everyWeekTrigger,
    everyMonthTrigger,
    cronExpressionTrigger
  ],
});
