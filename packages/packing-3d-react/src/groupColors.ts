import type { SceneTheme } from "./types";

export const LIGHT_GROUP_COLORS = [
  "#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#14b8a6",
  "#f43f5e",
  "#f59e0b", "#0ea5e9", "#ec4899", "#84cc16",
  "#6366f1", "#06b6d4", "#10b981", "#a855f7", "#ef4444",
  "#eab308", "#d946ef", "#60a5fa", "#4ade80", "#fb923c",
  "#2dd4bf", "#f472b6", "#818cf8", "#facc15", "#38bdf8",
  "#34d399", "#c084fc", "#f87171", "#22c55e", "#06b6d4",
  "#f59e0b", "#a78bfa", "#f43f5e", "#0ea5e9", "#4ade80",
  "#fb7185", "#67e8f9", "#c4b5fd", "#fbbf24", "#5eead4",
];

export const DARK_GROUP_COLORS = [
  "#60a5fa", "#4ade80", "#fb923c", "#a78bfa", "#2dd4bf",
  "#fb7185",
  "#fbbf24", "#38bdf8", "#f472b6", "#a3e635",
  "#818cf8", "#22d3ee", "#f97316", "#14b8a6", "#f43f5e",
  "#84cc16", "#c084fc", "#f59e0b", "#5b7fff", "#34d399",
  "#e879f9", "#0ea5e9", "#10b981", "#8b5cf6", "#ff6b6b",
  "#22c7c7", "#d4a72c", "#9f7aea", "#2bb6d6", "#6ee7b7",
  "#ff8fab", "#b4f55b", "#7aa2ff", "#4ade80", "#fca5a5",
  "#5eead4", "#fcd34d", "#b794f4", "#67e8f9", "#fda4af",
];

export function getDefaultGroupColors(theme: SceneTheme): string[] {
  return theme === "dark" ? DARK_GROUP_COLORS : LIGHT_GROUP_COLORS;
}

export function getGroupColorByKey(groupKey: string, groupKeys: string[], theme: SceneTheme = "light"): string {
  const colors = getDefaultGroupColors(theme);
  const idx = groupKeys.indexOf(groupKey);
  if (idx < 0) {
    return colors[0];
  }

  return colors[idx % colors.length];
}
