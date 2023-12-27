import { StepLocationRelativeToParent } from '@activepieces/shared';

export type PositionButton = {
  x: number;
  y: number;
  type: ButtonType;
  stepName: string;
  stepLocationRelativeToParent: StepLocationRelativeToParent;
};
export type PositionLabel = {
  x: number;
  y: number;
  label: string;
};

export const FLOW_ITEM_WIDTH = 300;
export const FLOW_ITEM_HEIGHT = 92;
export const FLOW_ITEM_BOTTOM_PADDING = 16;
export const VERTICAL_SPACE_BETWEEN_LABEL_AND_FLOW_ITEM = 70;
export const FLOW_ITEM_HEIGHT_WITH_BOTTOM_PADDING =
  FLOW_ITEM_HEIGHT + FLOW_ITEM_BOTTOM_PADDING;
/**Sequential as in one step comes after the other, i.e (s1).next === (s2) */
export const VERTICAL_SPACE_BETWEEN_SEQUENTIAL_STEPS = 62;
export const VERTICAL_SPACE_BETWEEN_STEP_AND_CHILD = 120;
export const HORIZONTAL_SPACE_BETWEEN_BRANCHES = 90;
export const HORIZONTAL_SPACE_FOR_EMPTY_SIDE_OF_LOOP = 120;
export const ARC_LENGTH = 15;
export const EXTRA_VERTICAL_SPACE_FOR_LINE_WITH_LABEL = 25;
export const VERTICAL_SPACE_BETWEEN_LABEL_AND_BUTTON =
  EXTRA_VERTICAL_SPACE_FOR_LINE_WITH_LABEL * 1.25;
export const BIG_BUTTON_SIZE = 40;
export const BUTTON_SIZE = 18;
export const DROP_ZONE_WIDTH = 300;
export const DROP_ZONE_HEIGHT = 125;
export const HORIZONTAL_SPACE_BETWEEN_RETURNING_LOOP_ARROW_AND_STARTING_LOOP_ARC = 20;
export const VERTICAL_SPACE_BETWEEN_AFTERLOOP_LINE_AND_LOOP_BOTTOM = 67;
export type ButtonType = 'big' | 'small';
