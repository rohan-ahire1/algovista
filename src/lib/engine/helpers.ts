import type { GraphEdge, GraphNode, MarkKind } from "./types";

export function filled(n: number, kind: MarkKind = "idle"): MarkKind[] {
  return Array.from({ length: n }, () => kind);
}

export function edgeKey(from: string, to: string, directed: boolean) {
  return directed ? `${from}->${to}` : [from, to].sort().join("--");
}

/* ------------------------- Array input generation ----------------------- */

export type ArrayPreset = "random" | "sorted" | "reversed" | "nearly-sorted" | "few-unique";

/** Deterministic PRNG so a given seed always rebuilds the same array. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function buildArray(size: number, preset: ArrayPreset, seed = 42, max = 60): number[] {
  const rand = rng(seed);
  const base = Array.from({ length: size }, () => 3 + Math.floor(rand() * (max - 3)));

  switch (preset) {
    case "sorted":
      return base.sort((a, b) => a - b);
    case "reversed":
      return base.sort((a, b) => b - a);
    case "nearly-sorted": {
      const s = base.sort((a, b) => a - b);
      const swaps = Math.max(1, Math.floor(size / 6));
      for (let k = 0; k < swaps; k++) {
        const i = Math.floor(rand() * (size - 1));
        [s[i], s[i + 1]] = [s[i + 1], s[i]];
      }
      return s;
    }
    case "few-unique": {
      const pool = [8, 21, 34, 47];
      return Array.from({ length: size }, () => pool[Math.floor(rand() * pool.length)]);
    }
    default:
      return base;
  }
}

/* ------------------------------ Graph presets --------------------------- */

export interface GraphPreset {
  id: string;
  label: string;
  directed: boolean;
  weighted: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
  start: string;
}

export const GRAPH_PRESETS: GraphPreset[] = [
  {
    id: "traversal",
    label: "Traversal graph",
    directed: false,
    weighted: false,
    start: "A",
    nodes: [
      { id: "A", x: 0.5, y: 0.12 },
      { id: "B", x: 0.24, y: 0.38 },
      { id: "C", x: 0.76, y: 0.38 },
      { id: "D", x: 0.1, y: 0.68 },
      { id: "E", x: 0.38, y: 0.68 },
      { id: "F", x: 0.63, y: 0.68 },
      { id: "G", x: 0.9, y: 0.68 },
      { id: "H", x: 0.5, y: 0.93 },
    ],
    edges: [
      { from: "A", to: "B" },
      { from: "A", to: "C" },
      { from: "B", to: "D" },
      { from: "B", to: "E" },
      { from: "C", to: "F" },
      { from: "C", to: "G" },
      { from: "E", to: "H" },
      { from: "F", to: "H" },
    ],
  },
  {
    id: "weighted",
    label: "Weighted network",
    directed: false,
    weighted: true,
    start: "A",
    nodes: [
      { id: "A", x: 0.1, y: 0.5 },
      { id: "B", x: 0.34, y: 0.18 },
      { id: "C", x: 0.34, y: 0.82 },
      { id: "D", x: 0.62, y: 0.15 },
      { id: "E", x: 0.62, y: 0.62 },
      { id: "F", x: 0.9, y: 0.4 },
    ],
    edges: [
      { from: "A", to: "B", weight: 4 },
      { from: "A", to: "C", weight: 2 },
      { from: "B", to: "C", weight: 1 },
      { from: "B", to: "D", weight: 5 },
      { from: "C", to: "E", weight: 8 },
      { from: "C", to: "D", weight: 10 },
      { from: "D", to: "E", weight: 2 },
      { from: "D", to: "F", weight: 6 },
      { from: "E", to: "F", weight: 3 },
    ],
  },
  {
    id: "dag",
    label: "Course prerequisites (DAG)",
    directed: true,
    weighted: false,
    start: "A",
    nodes: [
      { id: "A", x: 0.12, y: 0.22 },
      { id: "B", x: 0.12, y: 0.72 },
      { id: "C", x: 0.38, y: 0.47 },
      { id: "D", x: 0.62, y: 0.18 },
      { id: "E", x: 0.62, y: 0.76 },
      { id: "F", x: 0.88, y: 0.47 },
    ],
    edges: [
      { from: "A", to: "C" },
      { from: "B", to: "C" },
      { from: "A", to: "D" },
      { from: "C", to: "D" },
      { from: "C", to: "E" },
      { from: "D", to: "F" },
      { from: "E", to: "F" },
    ],
  },
];

export function getGraph(id?: string): GraphPreset {
  return GRAPH_PRESETS.find((g) => g.id === id) ?? GRAPH_PRESETS[0];
}

export function adjacency(preset: GraphPreset): Record<string, { to: string; weight: number }[]> {
  const adj: Record<string, { to: string; weight: number }[]> = {};
  preset.nodes.forEach((n) => (adj[n.id] = []));
  preset.edges.forEach((e) => {
    adj[e.from].push({ to: e.to, weight: e.weight ?? 1 });
    if (!preset.directed) adj[e.to].push({ to: e.from, weight: e.weight ?? 1 });
  });
  Object.values(adj).forEach((list) => list.sort((a, b) => a.to.localeCompare(b.to)));
  return adj;
}
