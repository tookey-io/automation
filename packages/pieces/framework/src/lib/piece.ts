import type { Trigger } from './trigger/trigger';
import { Action } from './action/action';
import { EventPayload, ParseEventResponse } from '@activepieces/shared';
import { PieceBase, PieceMetadata } from './piece-metadata';

export class Piece implements Omit<PieceBase, "version" | "name"> {
  private readonly _actions: Record<string, Action>;
  private readonly _triggers: Record<string, Trigger>;

  constructor(
    public readonly displayName: string,
    public readonly tags: string[],
    public readonly logoUrl: string,
    public readonly authors: string[],
    public readonly events: {
      parseAndReply: (ctx: {payload: EventPayload}) => ParseEventResponse;
      verify: (ctx: { webhookSecret: string, payload: EventPayload, appWebhookUrl: string }) => boolean;
    } | undefined,
    actions: Action[],
    triggers: Trigger[],
    public readonly minimumSupportedRelease?: string,
    public readonly maximumSupportedRelease?: string,
    public readonly description: string = ''
  ) {
    this._actions = Object.fromEntries(
      actions.map((action) => [action.name, action])
    );

    this._triggers = Object.fromEntries(
      triggers.map((trigger) => [trigger.name, trigger])
    );
  }

  getAction(actionName: string): Action | undefined {
    if (!(actionName in this._actions)) {
      return undefined;
    }
    return this._actions[actionName];
  }

  getTrigger(triggerName: string): Trigger | undefined {
    if (!(triggerName in this._triggers)) {
      return undefined;
    }
    return this._triggers[triggerName];
  }

  metadata(): Omit<PieceMetadata, "name" | "version"> {
    return {
      displayName: this.displayName,
      tags: this.tags,
      logoUrl: this.logoUrl,
      actions: this._actions,
      triggers: this._triggers,
      description: this.description,
      minimumSupportedRelease: this.minimumSupportedRelease,
      maximumSupportedRelease: this.maximumSupportedRelease,
    };
  }

  actions(){
    return this._actions;
  }

  triggers(){
    return this._triggers;
  }
}

export const createPiece = (request: {
  displayName: string;
  tags?: string[];
  logoUrl: string;
  authors?: string[],
  actions: Action[];
  triggers: Trigger[];
  description?: string;
  events?: {
    parseAndReply: (ctx: {payload: EventPayload}) => ParseEventResponse;
    verify: (ctx: { webhookSecret: string, payload: EventPayload, appWebhookUrl: string }) => boolean;
  }
  minimumSupportedRelease?: string;
  maximumSupportedRelease?: string;
}): Piece =>
  new Piece(
    request.displayName,
    request.tags || [],
    request.logoUrl,
    request.authors ?? [],
    request.events,
    request.actions,
    request.triggers,
    request.minimumSupportedRelease,
    request.maximumSupportedRelease,
    request.description
  );
