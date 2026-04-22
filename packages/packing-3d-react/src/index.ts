export const PACKAGE_NAME = '@cardinal-odp/packing-3d-react';

export { default, default as Packing3DCore, default as Packing3DScene } from './Packing3DCore';
export {
  DARK_SCENE_PALETTE,
  LIGHT_SCENE_PALETTE,
  getDefaultGroupColor,
  getDefaultScenePalette,
  resolveScenePalette,
} from './colors';
export {
  DARK_GROUP_COLORS,
  LIGHT_GROUP_COLORS,
  getDefaultGroupColors,
  getGroupColorByKey,
} from './groupColors';
export {
  DARK_SCENE_TOOLTIP_TOKENS,
  LIGHT_SCENE_TOOLTIP_TOKENS,
  getDefaultSceneTooltipTokens,
  resolveSceneTooltipTokens,
} from './tooltip';
export type {
  Packing3DCoreProps,
  SceneContainer,
  SceneItem,
  SceneItemMeta,
  ScenePalette,
  ScenePaletteTokens,
  SceneTheme,
  SceneTooltipTokens,
  SceneTooltipTokensInput,
} from './types';
