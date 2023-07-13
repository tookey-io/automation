import { createAction, Property} from "@activepieces/pieces-framework"
import { HttpRequest, HttpMethod, httpClient } from "@activepieces/pieces-common"
import { dripCommon } from "../common";
import { dripAuth } from "../../"

export const dripAddSubscriberToCampaign = createAction({
    auth: dripAuth,
        name: 'add_subscriber_to_campaign',
        description: 'Add a subscriber to a campaign (Email series)',
        displayName: 'Add a subscriber to a campaign',
        props: {
            account_id: dripCommon.account_id,
            campaign_id: Property.Dropdown({
                displayName: "Email Series Campaign",
                refreshers: ["account_id"],
                required: true,
                options: async ({ auth, account_id }) => {
                    if (!auth) {
                        return {
                            disabled: true,
                            options: [],
                            placeholder: "Please fill in API key first"
                        }
                    }
                    if (!account_id) {
                        return {
                            disabled: true,
                            options: [],
                            placeholder: "Please select an account first"
                        }
                    }
                    const request: HttpRequest = {
                        method: HttpMethod.GET,
                        url: `${dripCommon.baseUrl(account_id as string)}/campaigns`,
                        headers: {
                            Authorization: `Basic ${Buffer.from(auth as string).toString("base64")}`,
                        },
                    };
                    const response = await httpClient.sendRequest<{ campaigns: { name: string, id: string }[] }>(request);
                    const opts = response.body.campaigns.map((campaign) => {
                        return { value: campaign.id, label: campaign.name };
                    });
                    if (opts.length === 0) {
                        return {
                            disabled: false,
                            options: [],
                            placeholder: "Please create an email series campaign"
                        }
                    }
                    return {
                        disabled: false,
                        options: opts,
                    }
                }
            }),
            subscriber: dripCommon.subscriber,
            tags: dripCommon.tags,
            custom_fields: dripCommon.custom_fields,
        },
        sampleData: {
            "links": {
                "subscribers.account": "https://api.getdrip.com/v2/accounts/{subscribers.account}"
            },
            "subscribers": [
                {
                    "id": "1e0ukqg4yzqo1bxyy18f",
                    "href": "https://api.getdrip.com/v2/AAAAAAA/subscribers/AAAAAAA",
                    "status": "active",
                    "email": "yrdd@ggg.com",
                    "first_name": "joe",
                    "last_name": "doe",
                    "address1": "Iraq,Baghdad",
                    "address2": "Amman,Jordan",
                    "city": "Baghdad",
                    "state": "Baghdad",
                    "zip": "10011",
                    "phone": "079123123123",
                    "country": "Iraq",
                    "time_zone": "Baghdad GMT+3",
                    "utc_offset": 3,
                    "visitor_uuid": null,
                    "custom_fields": {},
                    "tags": [],
                    "created_at": "2023-01-30T07:42:12Z",
                    "ip_address": "000.000.00",
                    "user_agent": "Mozilla Firefox",
                    "lifetime_value": null,
                    "original_referrer": null,
                    "landing_url": null,
                    "prospect": false,
                    "base_lead_score": null,
                    "eu_consent": "unknown",
                    "sms_number": "079123123123",
                    "sms_consent": false,
                    "lead_score": null,
                    "user_id": null,
                    "links": {
                        "account": "00000000"
                    }
                }
            ]
        }
        ,
        async run({ auth, propsValue }) {
            const request: HttpRequest = {
                method: HttpMethod.POST,
                url: `${dripCommon.baseUrl(propsValue.account_id)}/campaigns/${propsValue.campaign_id}/subscribers`,
                body: {
                    subscribers: [{
                        email: propsValue.subscriber,
                        tags: propsValue.tags,
                        custom_fields: propsValue.custom_fields
                    }]
                },
                headers: {
                    'Authorization': dripCommon.authorizationHeader(auth)
                },
                queryParams: {},
            };
            return await httpClient.sendRequest<Record<string, never>>(request);
        }
    
});
