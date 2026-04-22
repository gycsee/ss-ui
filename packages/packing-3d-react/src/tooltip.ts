import type { SceneTheme, SceneTooltipTokens, SceneTooltipTokensInput } from "./types";

export const LIGHT_SCENE_TOOLTIP_TOKENS: SceneTooltipTokens = {
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  textColor: "#0f172a",
  mutedTextColor: "#475569",
  borderColor: "rgba(148, 163, 184, 0.45)",
  separatorColor: "rgba(148, 163, 184, 0.32)",
  shadow: "0 12px 32px rgba(15, 23, 42, 0.14)",
  borderRadius: 10,
  paddingX: 12,
  paddingY: 10,
  fontSize: 12,
  lineHeight: 1.45,
  titleFontWeight: 600,
  titleSpacing: 4,
  sectionSpacing: 6,
  minWidth: 120,
};

export const DARK_SCENE_TOOLTIP_TOKENS: SceneTooltipTokens = {
  backgroundColor: "rgba(15, 23, 42, 0.96)",
  textColor: "#e5eefb",
  mutedTextColor: "#cbd5e1",
  borderColor: "rgba(148, 163, 184, 0.28)",
  separatorColor: "rgba(148, 163, 184, 0.22)",
  shadow: "0 16px 36px rgba(2, 6, 23, 0.42)",
  borderRadius: 10,
  paddingX: 12,
  paddingY: 10,
  fontSize: 12,
  lineHeight: 1.45,
  titleFontWeight: 600,
  titleSpacing: 4,
  sectionSpacing: 6,
  minWidth: 120,
};

export function getDefaultSceneTooltipTokens(theme: SceneTheme): SceneTooltipTokens {
  return theme === "dark" ? DARK_SCENE_TOOLTIP_TOKENS : LIGHT_SCENE_TOOLTIP_TOKENS;
}

export function resolveSceneTooltipTokens(theme: SceneTheme, tooltipTokens?: SceneTooltipTokensInput): SceneTooltipTokens {
  return {
    ...getDefaultSceneTooltipTokens(theme),
    ...tooltipTokens,
  };
}
