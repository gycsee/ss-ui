import { getGroupColorByKey } from "./groupColors";

import type { SceneItem, ScenePalette, ScenePaletteTokens, SceneTheme } from "./types";

export const LIGHT_SCENE_PALETTE: ScenePalette = {
  backgroundFrom: "#ffffff",
  backgroundVia: "#ffffff",
  backgroundTo: "#f1f5f9",
  containerEdge: "#6b7280",
  containerFill: "#94a3b8",
  cargoEdge: "#1f2937",
  cargoDimEdge: "#6b7280",
  unloadedZoneFill: "#b91c1c",
  unloadedZoneLine: "#dc2626",
  unloadedZoneText: "#ef4444",
  axisText: "#6b7280",
  gridPrimary: "#94a3b8",
  gridSecondary: "#cbd5e1",
};

export const DARK_SCENE_PALETTE: ScenePalette = {
  backgroundFrom: "#020617",
  backgroundVia: "#0f172a",
  backgroundTo: "#111827",
  containerEdge: "#9ca3af",
  containerFill: "#cbd5e1",
  cargoEdge: "#e5e7eb",
  cargoDimEdge: "#6b7280",
  unloadedZoneFill: "#f87171",
  unloadedZoneLine: "#fca5a5",
  unloadedZoneText: "#fecaca",
  axisText: "#cbd5e1",
  gridPrimary: "#475569",
  gridSecondary: "#334155",
};

export function getDefaultScenePalette(theme: SceneTheme): ScenePalette {
  return theme === "dark" ? DARK_SCENE_PALETTE : LIGHT_SCENE_PALETTE;
}

export function resolveScenePalette(theme: SceneTheme, paletteTokens?: ScenePaletteTokens): ScenePalette {
  return {
    ...getDefaultScenePalette(theme),
    ...paletteTokens,
  };
}

export function getDefaultGroupColor(item: SceneItem, groupKeys: string[], theme: SceneTheme): string {
  return getGroupColorByKey(item.groupKey, groupKeys, theme);
}
