import { createPiece } from '@activepieces/pieces-framework';
import { dripAddSubscriberToCampaign } from './lib/actions/add-subscriber-to-campaign.action';
import { dripApplyTagToSubscriber } from './lib/actions/apply-tag-to-subscriber.action';
import { dripUpsertSubscriberAction } from './lib/actions/upsert-subscriber.action';
import { dripNewSubscriberEvent } from './lib/trigger/new-subscriber.trigger';
import { dripTagAppliedEvent } from './lib/trigger/new-tag.trigger';


export const drip = createPiece({
	displayName: 'Drip',
	logoUrl: 'https://cdn.activepieces.com/pieces/drip.png',
	authors: ['AbdulTheActivePiecer'],
	actions: [dripApplyTagToSubscriber, dripAddSubscriberToCampaign, dripUpsertSubscriberAction],
	triggers: [dripNewSubscriberEvent, dripTagAppliedEvent],
});
