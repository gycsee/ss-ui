import type { CSSProperties, ReactNode } from "react";

export interface SceneContainer {
  type?: string;
  innerLength: number;
  innerWidth: number;
  innerHeight: number;
}

export interface SceneItemMeta {
  title?: string;
  lines?: string[];
}

export interface SceneItem {
  id: string;
  groupKey: string;
  seq: number;
  posX: number;
  posY: number;
  posZ: number;
  xLength: number;
  yLength: number;
  zLength: number;
  meta?: SceneItemMeta;
}

export interface ScenePalette {
  backgroundFrom: string;
  backgroundVia: string;
  backgroundTo: string;
  containerEdge: string;
  containerFill: string;
  cargoEdge: string;
  cargoDimEdge: string;
  unloadedZoneFill: string;
  unloadedZoneLine: string;
  unloadedZoneText: string;
  axisText: string;
  gridPrimary: string;
  gridSecondary: string;
}

export type SceneTheme = "light" | "dark";

export type ScenePaletteTokens = Partial<ScenePalette>;

export interface SceneTooltipTokens {
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  separatorColor: string;
  shadow: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  lineHeight: number;
  titleFontWeight: number;
  titleSpacing: number;
  sectionSpacing: number;
  minWidth: number;
}

export type SceneTooltipTokensInput = Partial<SceneTooltipTokens>;

export interface Packing3DCoreProps {
  container: SceneContainer;
  items: SceneItem[];
  allItems?: SceneItem[];
  unloadedItems?: SceneItem[];
  opacity?: number;
  highlightedIds?: Set<string>;
  theme?: SceneTheme;
  paletteTokens?: ScenePaletteTokens;
  tooltipTokens?: SceneTooltipTokensInput;
  className?: string;
  style?: CSSProperties;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  minHeight?: CSSProperties["minHeight"];
  renderTooltip?: (item: SceneItem, unloaded: boolean) => ReactNode;
  getItemColor?: (item: SceneItem, groupKeys: string[], theme: SceneTheme) => string;
}
