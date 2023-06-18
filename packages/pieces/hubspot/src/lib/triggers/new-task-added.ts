import { OAuth2PropertyValue, createTrigger } from '@activepieces/pieces-framework';
import { TriggerStrategy } from "@activepieces/pieces-framework";
import { DedupeStrategy, Polling, pollingHelper } from '@activepieces/pieces-common';

import { hubSpotAuthentication } from '../common/props'
import { hubSpotClient } from '../common/client';
import dayjs from 'dayjs';

const polling: Polling<{ authentication: OAuth2PropertyValue }> = {
	strategy: DedupeStrategy.TIMEBASED,
	items: async ({ propsValue, lastFetchEpochMS }) => {
		const currentValues = (await hubSpotClient.tasks.getTasksAfterLastSearch(propsValue.authentication.access_token, lastFetchEpochMS)).results ?? []
		const items = currentValues.map((item: {createdAt: string}) => ({
			epochMilliSeconds: dayjs(item.createdAt).valueOf(),
			data: item
		}));
		return items;
	}
};

export const newTaskAdded = createTrigger({
	name: 'new_task',
	displayName: 'New Task',
	description: 'Trigger when a new task is added.',
	props: {
		authentication: hubSpotAuthentication
	},
	type: TriggerStrategy.POLLING,
	onEnable: async (context) => {
		await pollingHelper.onEnable(polling, {
			store: context.store,
			propsValue: context.propsValue,
		})
	},
	onDisable: async (context) => {
		await pollingHelper.onDisable(polling, {
			store: context.store,
			propsValue: context.propsValue,
		})
	},
	run: async (context) => {
		return await pollingHelper.poll(polling, {
			store: context.store,
			propsValue: context.propsValue,
		});
	},
	test: async (context) => {
		return await pollingHelper.test(polling, {
			store: context.store,
			propsValue: context.propsValue,
		});
	},

	sampleData: {
		results: [
			{
				"id": "18156543966",
				"properties": {
					"hs_created_by": "5605286",
					"hs_created_by_user_id": "5605286",
					"hs_createdate": "2023-06-13T09:42:37.557Z",
					"hs_engagement_source": "CRM_UI",
					"hs_engagement_source_id": null,
					"hs_follow_up_action": null,
					"hs_lastmodifieddate": "2023-06-13T10:03:41.073Z",
					"hs_marketing_task_category": null,
					"hs_marketing_task_category_id": null,
					"hs_modified_by": "5605286",
					"hs_num_associated_companies": "0",
					"hs_num_associated_contacts": "1",
					"hs_num_associated_deals": "0",
					"hs_num_associated_tickets": "0",
					"hs_object_id": "18156543966",
					"hs_product_name": null,
					"hs_read_only": null,
					"hs_repeat_status": null,
					"hs_scheduled_tasks": "{\"scheduledTasks\":[]}",
					"hs_task_body": null,
					"hs_task_completion_count": "0",
					"hs_task_completion_date": null,
					"hs_task_for_object_type": "OWNER",
					"hs_task_is_all_day": "false",
					"hs_task_is_completed": "0",
					"hs_task_is_completed_call": "0",
					"hs_task_is_completed_email": "0",
					"hs_task_is_completed_linked_in": "0",
					"hs_task_is_completed_sequence": "0",
					"hs_task_last_contact_outreach": null,
					"hs_task_last_sales_activity_timestamp": null,
					"hs_task_priority": "NONE",
					"hs_task_repeat_interval": null,
					"hs_task_status": "NOT_STARTED",
					"hs_task_subject": "My Test Task",
					"hs_task_type": "TODO",
					"hs_updated_by_user_id": "5605286",
					"hubspot_owner_id": "1041576162"
				},
				"createdAt": "2023-06-13T09:42:37.557Z",
				"updatedAt": "2023-06-13T10:03:41.073Z",
				"archived": false
			}
		]
	},
});