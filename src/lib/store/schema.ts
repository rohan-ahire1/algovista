import type { ArrayPreset } from "../engine/helpers";
import type { GraphSpec } from "../engine/types";
import type { RandomGraphRecipe } from "../engine/graph-gen";

export const SETTINGS_COOKIE = "av_settings";
export const PROGRESS_COOKIE = "av_progress";

export type ThemeName = "light" | "dark";
export type AnimationStyle = "smooth" | "instant" | "bouncy";

export interface Settings {
  theme: ThemeName;
  arraySize: number;
  speed: number; // 0–100, mapped to a frame delay
  animation: AnimationStyle;
  preset: ArrayPreset;
  seed: number;
  /** Where the weighted-graph visualizer gets its graph. null = the built-in preset. */
  graphSource: GraphSource;
}

/**
 * Hand-built graphs are stored in full; generated ones are stored as the recipe
 * that produced them. A 100-node graph is ~6KB of nodes and edges but only ~60
 * bytes of recipe, which is the difference between fitting in a cookie and not.
 */
export type GraphSource =
  | { kind: "custom"; graph: GraphSpec }
  | { kind: "random"; recipe: RandomGraphRecipe }
  | null;

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  arraySize: 10,
  speed: 60,
  animation: "smooth",
  preset: "random",
  seed: 42,
  graphSource: null,
};

export interface ActivityEntry {
  slug: string;
  title: string;
  detail: string;
  at: number;
}

export interface Progress {
  name: string;
  /** Algorithms opened in the visualizer. */
  explored: string[];
  /** Algorithms whose visualization was played to the final frame. */
  completed: string[];
  /** Quiz results keyed by algorithm slug. */
  quiz: Record<string, { correct: number; total: number }>;
  /** Learning-path module id → lessons completed. */
  modules: Record<string, number>;
  activity: ActivityEntry[];
  streak: number;
  lastActive: string;
  minutes: number;
  achievements: string[];
}

export const DEFAULT_PROGRESS: Progress = {
  name: "Explorer",
  explored: [],
  completed: [],
  quiz: {},
  modules: {},
  activity: [],
  streak: 0,
  lastActive: "",
  minutes: 0,
  achievements: [],
};

/** Cookies cap at ~4KB, so the activity feed is deliberately short-lived. */
export const MAX_ACTIVITY = 10;

export function speedToDelay(speed: number) {
  // 0 → 1400ms per frame, 100 → 90ms per frame (roughly exponential feel)
  const t = Math.max(0, Math.min(100, speed)) / 100;
  return Math.round(1400 * Math.pow(0.065, t));
}

export function parseCookieValue<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (parsed && typeof parsed === "object") return { ...fallback, ...parsed };
  } catch {
    /* corrupted cookie — fall back to defaults */
  }
  return fallback;
}
