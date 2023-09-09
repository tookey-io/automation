import { createAction, Property } from '@activepieces/pieces-framework';
import { linearAuth } from '../../..';
import { props } from '../../common/props';
import { makeClient } from '../../common/client';
import { LinearDocument } from '@linear/sdk';

export const linearCreateIssue = createAction({
  auth: linearAuth,
  name: 'linear_create_issue',
  displayName: 'Create Issue',
  description: 'Create a new issue in Linear workspace',
  props: {
    team_id: props.team_id(),
    title: Property.ShortText({
      displayName: 'Title',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      required: false,
    }),
    state_id: props.status_id(),
    labels: props.labels(),
    assignee_id: props.assignee_id(),
    priority_id: props.priority_id(),
  },
  async run({ auth, propsValue }) {
    const issue: LinearDocument.IssueCreateInput = {
      teamId: propsValue.team_id!,
      title: propsValue.title,
      assigneeId: propsValue.assignee_id,
      stateId: propsValue.state_id,
      priority: propsValue.priority_id,
      labelIds: propsValue.labels,
    };
    const client = makeClient(auth as string);
    const result = await client.createIssue(issue);
    return result;
  },
});
