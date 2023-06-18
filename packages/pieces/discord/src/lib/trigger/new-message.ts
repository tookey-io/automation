import { DedupeStrategy, HttpMethod, HttpRequest, Polling, httpClient, pollingHelper } from '@activepieces/pieces-common';
import { createTrigger, Property, TriggerStrategy } from '@activepieces/pieces-framework';
import dayjs from 'dayjs'


interface Message {
    id: string;
    type: number;
    content: string;
    channel_id: string;
    author: {
        id: string;
        username: string;
    };
    attachments: any;
    embeds: any;
    mentions: any;
    mention_roles: any;
    pinned: boolean;
    mention_everyone: boolean;
    tts: boolean;
    timestamp: string;
    edited_timestamp: string | null;
    flags: number;
    components: any;
}

interface Guild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
}

interface Channel {
    id: string;
    name: string;
}

const polling: Polling<{ channel: string | undefined; token: string; limit: number }> = {
    strategy: DedupeStrategy.TIMEBASED,
    items: async ({ propsValue: { channel, token, limit } }) => {
        if (channel === undefined) return [];

        const request: HttpRequest = {
            method: HttpMethod.GET,
            url: "https://discord.com/api/v9/channels/" + channel + "/messages?limit=" + limit,
            headers: {
                "Authorization": "Bot " + token,
            }
        };

        const res = await httpClient.sendRequest<Message[]>(request);

        const items = res.body;
        return items.map((item) => ({
            epochMilliSeconds: dayjs(item.timestamp).valueOf(),
            data: item,
        }));
    }
};

const markdown = `
To obtain a token, follow these steps:
1. Go to https://discord.com/developers/applications
2. Click on Application (or create one if you don't have one)
3. Click on Bot
4. Copy the token
`

export const newMessage = createTrigger({
    name: 'new_message',
    displayName: 'New message',
    description: 'Triggers when a message is sent in a channel',
    type: TriggerStrategy.POLLING,
    props: {
        token: Property.SecretText({
            displayName: 'Token',
            description: markdown,
            required: true,
        }),
        limit: Property.Number({
            displayName: 'Limit',
            description: "The number of messages to fetch",
            required: false,
            defaultValue: 50
        }),
        channel: Property.Dropdown<string>({
            displayName: 'Channel',
            description: 'List of channels',
            required: true,
            refreshers: ['token'],
            options: async (propsValue) => {
                const request = {
                    method: HttpMethod.GET,
                    url: "https://discord.com/api/v9/users/@me/guilds",
                    headers: {
                        "Authorization": "Bot " + propsValue.token,
                    }
                };

                const res = await httpClient.sendRequest<Guild[]>(request);
                const options: { options: { value: string, label: string }[] } = { options: [] };

                await Promise.all(res.body.map(async (guild) => {
                    const requestChannels = {
                        method: HttpMethod.GET,
                        url: "https://discord.com/api/v9/guilds/" + guild.id + "/channels",
                        headers: {
                            "Authorization": "Bot " + propsValue.token,
                        }
                    };

                    const resChannels = await httpClient.sendRequest<Channel[]>(requestChannels);
                    resChannels.body.forEach((channel) => {
                        options.options.push({
                            value: channel.id,
                            label: channel.name
                        });
                    });
                }));

                return options;
            },
        }),
    },
    sampleData: {},
    onEnable: async (context) => {

        await pollingHelper.onEnable(polling, {
            store: context.store,
            propsValue: {
                channel: context.propsValue.channel,
                token: context.propsValue.token,
                limit: context.propsValue.limit ?? 50
            },
        })
    },
    onDisable: async (context) => {
        await pollingHelper.onDisable(polling, {
            store: context.store,
            propsValue: {
                channel: context.propsValue.channel,
                token: context.propsValue.token,
                limit: context.propsValue.limit ?? 50
            },
        })
    },
    run: async (context) => {
        return await pollingHelper.poll(polling, {
            store: context.store,
            propsValue: {
                channel: context.propsValue.channel,
                token: context.propsValue.token,
                limit: context.propsValue.limit ?? 50
            },
        });
    },
    test: async (context) => {
        return await pollingHelper.test(polling, {
            store: context.store,
            propsValue: {
                channel: context.propsValue.channel,
                token: context.propsValue.token,
                limit: context.propsValue.limit ?? 50
            },
        });
    }
});