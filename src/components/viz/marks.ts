import type { MarkKind } from "@/lib/engine/types";

interface MarkStyle {
  fill: string;
  text: string;
  ring?: string;
  label: string;
}

export const MARK_STYLES: Record<MarkKind, MarkStyle> = {
  idle: { fill: "var(--viz-idle)", text: "var(--text)", label: "Unsorted" },
  compare: {
    fill: "var(--viz-compare)",
    text: "var(--ink)",
    ring: "color-mix(in srgb, var(--viz-compare) 35%, transparent)",
    label: "Comparing",
  },
  "compare-alt": {
    fill: "var(--viz-compare-soft)",
    text: "var(--text)",
    ring: "color-mix(in srgb, var(--viz-compare-soft) 40%, transparent)",
    label: "Next to compare",
  },
  sorted: { fill: "var(--viz-sorted)", text: "var(--text)", label: "Sorted" },
  pivot: {
    fill: "var(--viz-pivot)",
    text: "var(--text)",
    ring: "color-mix(in srgb, var(--viz-pivot) 35%, transparent)",
    label: "Pivot",
  },
  active: {
    fill: "var(--viz-active)",
    text: "var(--ink)",
    ring: "color-mix(in srgb, var(--viz-active) 35%, transparent)",
    label: "Active",
  },
  discarded: { fill: "var(--viz-discarded)", text: "var(--text-subtle)", label: "Eliminated" },
  found: {
    fill: "var(--success)",
    text: "var(--ink)",
    ring: "color-mix(in srgb, var(--success) 35%, transparent)",
    label: "Found",
  },
  visited: { fill: "var(--viz-sorted)", text: "var(--text)", label: "Visited" },
  frontier: {
    fill: "var(--viz-compare-soft)",
    text: "var(--text)",
    ring: "color-mix(in srgb, var(--viz-compare-soft) 40%, transparent)",
    label: "Frontier",
  },
  path: { fill: "var(--viz-compare)", text: "var(--ink)", label: "On path" },
};

export const POINTER_TONES = {
  brand: "var(--primary)",
  violet: "var(--violet)",
  mint: "var(--success)",
  amber: "var(--warning)",
} as const;
