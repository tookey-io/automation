import { createAction } from '@activepieces/pieces-framework';
import { slackSendMessage } from '../common/utils';
import { slackAuth } from '../..';
import {
  assertNotNullOrUndefined,
  ExecutionType,
  PauseType
} from '@activepieces/shared';
import { profilePicture, slackChannel, text, username } from '../common/props';

export const requestSendApprovalMessageAction = createAction({
  auth: slackAuth,
  name: 'request_approval_message',
  displayName: 'Request Approval in a Channel',
  description:
    'Send approval message to a channel and then wait until the message is approved or disapproved',
  props: {
    channel: slackChannel,
    text,
    username,
    profilePicture
  },
  async run(context) {
    if (context.executionType === ExecutionType.BEGIN) {
      context.run.pause({
        pauseMetadata: {
          type: PauseType.WEBHOOK,
          actions: ['approve', 'disapprove']
        }
      });
      const token = context.auth.access_token;
      const { channel, username, profilePicture } = context.propsValue;

      assertNotNullOrUndefined(token, 'token');
      assertNotNullOrUndefined(text, 'text');
      assertNotNullOrUndefined(channel, 'channel');
      const approvalLink = `${context.serverUrl}v1/flow-runs/${context.run.id}/resume?action=approve`;
      const disapprovalLink = `${context.serverUrl}v1/flow-runs/${context.run.id}/resume?action=disapprove`;

      return await slackSendMessage({
        token,
        text: `${context.propsValue.text}\n\nApprove: ${approvalLink}\n\nDisapprove: ${disapprovalLink}`,
        username,
        profilePicture,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${context.propsValue.text}`
            }
          },
          {
            type: 'actions',
            block_id: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Approve'
                },
                style: 'primary',
                url: approvalLink
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Disapprove'
                },
                style: 'danger',
                url: disapprovalLink
              }
            ]
          }
        ],
        conversationId: channel
      });
    } else {
      const payload = context.resumePayload as { action: string };

      return {
        approved: payload.action === 'approve'
      };
    }
  }
});
