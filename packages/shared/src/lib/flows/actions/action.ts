import { Type, Static, } from '@sinclair/typebox';

import { VersionType } from '../../pieces';
import { SampleDataSettingsObject } from '../sample-data';
import { PieceTriggerSettings } from '../triggers/trigger';

export enum ActionType {
  CODE = 'CODE',
  PIECE = 'PIECE',
  LOOP_ON_ITEMS = 'LOOP_ON_ITEMS',
  BRANCH = 'BRANCH',
  // Missing action is used when the action is not found by AI
  MISSING = 'MISSING'
}

const commonActionProps = {
  name: Type.String({}),
  valid: Type.Boolean({}),
  displayName: Type.String({}),
}

// Code Action

export const CodeActionSettings = Type.Object({
  artifactSourceId: Type.Optional(Type.String({})),
  artifact: Type.Optional(Type.String({})),
  input: Type.Record(Type.String({}), Type.Any()),
  inputUiInfo: Type.Optional(SampleDataSettingsObject)
});


export type CodeActionSettings = Static<typeof CodeActionSettings>;

export const CodeActionSchema = Type.Object({
  ...commonActionProps,
  type: Type.Literal(ActionType.CODE),
  settings: CodeActionSettings
});


// Piece Action
export const PieceActionSettings = Type.Object({
  pieceName: Type.String({}),
  pieceVersion: VersionType,
  actionName: Type.Optional(Type.String({})),
  input: Type.Record(Type.String({}), Type.Any()),
  inputUiInfo: SampleDataSettingsObject,
});

export const MissingActionSchema = Type.Object({
  ...commonActionProps,
  type: Type.Literal(ActionType.MISSING),
  settings: Type.Object({}),
});

export type PieceActionSettings = Static<typeof PieceActionSettings>;

export const PieceActionSchema = Type.Object({
  ...commonActionProps,
  type: Type.Literal(ActionType.PIECE),
  settings: PieceActionSettings,
});

// Loop Items
export const LoopOnItemsActionSettingsWithValidation = Type.Object({
  items: Type.String({ minLength: 1 })
});
export type LoopOnItemsActionSettingsWithValidation = Static<typeof LoopOnItemsActionSettings>;


export const LoopOnItemsActionSettings = Type.Object({
  items: Type.String()
});

export type LoopOnItemsActionSettings = Static<typeof LoopOnItemsActionSettings>;

export const LoopOnItemsActionSchema = Type.Object({
  ...commonActionProps,
  type: Type.Literal(ActionType.LOOP_ON_ITEMS),
  settings: LoopOnItemsActionSettings,
});

export enum BranchOperator {
  TEXT_CONTAINS = 'TEXT_CONTAINS',
  TEXT_DOES_NOT_CONTAIN = 'TEXT_DOES_NOT_CONTAIN',
  TEXT_EXACTLY_MATCHES = 'TEXT_EXACTLY_MATCHES',
  TEXT_DOES_NOT_EXACTLY_MATCH = 'TEXT_DOES_NOT_EXACTLY_MATCH',
  TEXT_STARTS_WITH = 'TEXT_START_WITH',
  TEXT_DOES_NOT_START_WITH = 'TEXT_DOES_NOT_START_WITH',
  TEXT_ENDS_WITH = 'TEXT_ENDS_WITH',
  TEXT_DOES_NOT_END_WITH = 'TEXT_DOES_NOT_END_WITH',
  NUMBER_IS_GREATER_THAN = 'NUMBER_IS_GREATER_THAN',
  NUMBER_IS_LESS_THAN = 'NUMBER_IS_LESS_THAN',
  BOOLEAN_IS_TRUE = 'BOOLEAN_IS_TRUE',
  BOOLEAN_IS_FALSE = 'BOOLEAN_IS_FALSE',
  EXISTS = 'EXISTS',
  DOES_NOT_EXIST = 'DOES_NOT_EXIST',
}

export const singleValueConditions = [
  BranchOperator.EXISTS,
  BranchOperator.DOES_NOT_EXIST,
  BranchOperator.BOOLEAN_IS_TRUE,
  BranchOperator.BOOLEAN_IS_FALSE
]

export const textConditions =[
  BranchOperator.TEXT_CONTAINS,
  BranchOperator.TEXT_DOES_NOT_CONTAIN,
  BranchOperator.TEXT_EXACTLY_MATCHES,
  BranchOperator.TEXT_DOES_NOT_EXACTLY_MATCH,
  BranchOperator.TEXT_STARTS_WITH,
  BranchOperator.TEXT_DOES_NOT_START_WITH,
  BranchOperator.TEXT_ENDS_WITH,
  BranchOperator.TEXT_DOES_NOT_END_WITH,
]

const BranchConditionValid = (addMinLength: boolean) => Type.Union([
  Type.Object({
    firstValue: addMinLength ? Type.String({ minLength: 1 }) : Type.String(),
    secondValue: addMinLength ? Type.String({ minLength: 1 }) : Type.String(),
    caseSensitive: Type.Optional(Type.Boolean()),
    operator: Type.Optional(Type.Union([
      Type.Literal( BranchOperator.TEXT_CONTAINS),
      Type.Literal( BranchOperator.TEXT_DOES_NOT_CONTAIN),
      Type.Literal( BranchOperator.TEXT_EXACTLY_MATCHES),
      Type.Literal( BranchOperator.TEXT_DOES_NOT_EXACTLY_MATCH),
      Type.Literal( BranchOperator.TEXT_STARTS_WITH),
      Type.Literal( BranchOperator.TEXT_DOES_NOT_START_WITH),
      Type.Literal( BranchOperator.TEXT_ENDS_WITH),
      Type.Literal( BranchOperator.TEXT_DOES_NOT_END_WITH),
    ]))
  }),
  Type.Object({
    firstValue: addMinLength ? Type.String({ minLength: 1 }) : Type.String(),
    secondValue: addMinLength ? Type.String({ minLength: 1 }) : Type.String(),
    operator: Type.Optional(Type.Union([
      Type.Literal( BranchOperator.NUMBER_IS_GREATER_THAN),
      Type.Literal( BranchOperator.NUMBER_IS_LESS_THAN),
    ]))
  }),
  Type.Object({
    firstValue: addMinLength ? Type.String({ minLength: 1 }) : Type.String(),
    operator: Type.Optional(Type.Union([
      Type.Literal( BranchOperator.EXISTS),
      Type.Literal( BranchOperator.DOES_NOT_EXIST),
      Type.Literal( BranchOperator.BOOLEAN_IS_TRUE),
      Type.Literal( BranchOperator.BOOLEAN_IS_FALSE)
    ]))
  })
]);

export const BranchActionSettingsWithValidation = Type.Object({
  conditions: Type.Array(Type.Array(BranchConditionValid(true))),
  inputUiInfo: SampleDataSettingsObject,
})

export const BranchCondition = BranchConditionValid(false);
export type BranchCondition = Static<typeof BranchCondition>;

export const BranchActionSettings = Type.Object({
  conditions: Type.Array(Type.Array(BranchConditionValid(false))),
  inputUiInfo: SampleDataSettingsObject,
})
export type BranchActionSettings = Static<typeof BranchActionSettings>;

export const BranchActionSchema = Type.Object({
  ...commonActionProps,
  type: Type.Literal(ActionType.BRANCH),
  settings: BranchActionSettings
});

// Union of all actions

export const Action = Type.Recursive(action => Type.Union([
  Type.Intersect([MissingActionSchema, Type.Object({
    nextAction: Type.Optional(action),
  })]),
  Type.Intersect([CodeActionSchema, Type.Object({
    nextAction: Type.Optional(action),
  })]),
  Type.Intersect([PieceActionSchema, Type.Object({
    nextAction: Type.Optional(action),
  })]),
  Type.Intersect([LoopOnItemsActionSchema, Type.Object({
    nextAction: Type.Optional(action),
    firstLoopAction: Type.Optional(action)
  })]),
  Type.Intersect([BranchActionSchema, Type.Object({
    nextAction: Type.Optional(action),
    onSuccessAction: Type.Optional(action),
    onFailureAction: Type.Optional(action)
  })])
]));

export const SingleActionSchema = Type.Union([
  MissingActionSchema,
  CodeActionSchema,
  PieceActionSchema,
  LoopOnItemsActionSchema,
  BranchActionSchema
])
export type Action = Static<typeof Action>;

export type BranchAction = Static<typeof BranchActionSchema> & { nextAction?: Action, onFailureAction?: Action, onSuccessAction?: Action };

export type LoopOnItemsAction = Static<typeof LoopOnItemsActionSchema> & { nextAction?: Action, firstLoopAction?: Action };

export type PieceAction = Static<typeof PieceActionSchema> & { nextAction?: Action };

export type CodeAction = Static<typeof CodeActionSchema> & { nextAction?: Action };

export type MissingAction = Static<typeof MissingActionSchema> & { nextAction?: Action };

export type StepSettings =
  | CodeActionSettings
  | PieceActionSettings
  | PieceTriggerSettings
  | BranchActionSettings
  | LoopOnItemsActionSettings;
