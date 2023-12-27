import { createAction, Property, Validators } from "@activepieces/pieces-framework";
import { unsubscribe } from "../api";
import { buildListDropdown } from "../props";
import { sendyAuth, SendyAuthType } from "../auth";

export const unsubscribeMultipleAction = createAction({
	name        : 'unsubscribe_multiple',
	auth        : sendyAuth,
	displayName : 'Unsubscribe Multiple Lists',
	description : 'Unsubscribe a subscriber from mulitple lists',
	props       : {
		lists: Property.MultiSelectDropdown({
			displayName : 'Lists',
			description : 'Select the lists to subscribe to',
			required    : true,
			refreshers  : ['auth'],
			options     : async ({auth}) => await buildListDropdown(auth as SendyAuthType),
		}),
		email: Property.ShortText({
			displayName : 'Email',
			description : "The user's email",
			required    : true,
			validators: [Validators.email],
		}),
	},
	async run(context) {
		const returnValues: any[] = [];

		for (const list of context.propsValue.lists) {
			const rc = await unsubscribe(context.auth, {
				list  : list,
				email : context.propsValue.email,
			});
			returnValues.push(rc);
		}
		return returnValues;
	},
});


