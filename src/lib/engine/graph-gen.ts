import type { GraphEdge, GraphNode, GraphSpec } from "./types";
import { CUSTOM_GRAPH_ID, nodeLabel } from "./graph-edit";

/**
 * Deterministic random-graph generation.
 *
 * Everything here is a pure function of (nodeCount, density, seed), which is
 * what lets a 100-node graph be persisted as a ~40-byte recipe rather than a
 * few kilobytes of nodes and edges.
 */

export const MIN_RANDOM_NODES = 5;
export const MAX_RANDOM_NODES = 100;

export const DENSITIES = [
  { id: "sparse", label: "Sparse", degree: 1.6 },
  { id: "medium", label: "Medium", degree: 2.4 },
  { id: "dense", label: "Dense", degree: 3.4 },
] as const;

export type DensityId = (typeof DENSITIES)[number]["id"];

export interface RandomGraphRecipe {
  nodeCount: number;
  density: DensityId;
  seed: number;
  /** Index of the source node, kept as a number so it survives relabelling. */
  startIndex: number;
}

export const DEFAULT_RECIPE: RandomGraphRecipe = {
  nodeCount: 24,
  density: "medium",
  seed: 1,
  startIndex: 0,
};

function rng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Jittered grid layout. A purely random scatter produces overlapping clumps at
 * 100 nodes; one node per grid cell with jitter stays readable while still
 * looking organic.
 */
function layout(count: number, rand: () => number): GraphNode[] {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * 1.64)));
  const rows = Math.max(1, Math.ceil(count / cols));

  const cells: number[] = Array.from({ length: cols * rows }, (_, i) => i);
  // Fisher–Yates so the used cells are spread over the whole canvas.
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  return cells.slice(0, count).map((cell, index) => {
    const col = cell % cols;
    const row = Math.floor(cell / cols);
    const jitterX = (rand() - 0.5) * 0.55;
    const jitterY = (rand() - 0.5) * 0.55;
    return {
      id: nodeLabel(index),
      x: Math.max(0.03, Math.min(0.97, (col + 0.5 + jitterX) / cols)),
      y: Math.max(0.04, Math.min(0.96, (row + 0.5 + jitterY) / rows)),
    };
  });
}

const dist = (a: GraphNode, b: GraphNode) => Math.hypot(a.x - b.x, a.y - b.y);

/** Geometric distance → an integer weight in 1..99. */
const weightFor = (a: GraphNode, b: GraphNode) => Math.max(1, Math.min(99, Math.round(dist(a, b) * 72)));

export function generateRandomGraph(recipe: RandomGraphRecipe): GraphSpec {
  const nodeCount = Math.max(MIN_RANDOM_NODES, Math.min(MAX_RANDOM_NODES, Math.round(recipe.nodeCount)));
  const rand = rng(recipe.seed * 2654435761);
  const nodes = layout(nodeCount, rand);

  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

  const push = (a: number, b: number) => {
    if (a === b || seen.has(key(a, b))) return false;
    seen.add(key(a, b));
    edges.push({ from: nodes[a].id, to: nodes[b].id, weight: weightFor(nodes[a], nodes[b]) });
    return true;
  };

  // 1. Prim's minimum spanning tree over the euclidean distances. This
  //    guarantees the generated graph is connected, so Dijkstra reaches
  //    everything and the visualization is never trivially short.
  const inTree = new Set<number>([0]);
  const best: { to: number; from: number; d: number }[] = [];
  for (let i = 1; i < nodeCount; i++) best.push({ to: i, from: 0, d: dist(nodes[0], nodes[i]) });

  while (inTree.size < nodeCount && best.length) {
    let pick = 0;
    for (let i = 1; i < best.length; i++) if (best[i].d < best[pick].d) pick = i;
    const chosen = best.splice(pick, 1)[0];
    push(chosen.from, chosen.to);
    inTree.add(chosen.to);
    for (const candidate of best) {
      const d = dist(nodes[chosen.to], nodes[candidate.to]);
      if (d < candidate.d) {
        candidate.d = d;
        candidate.from = chosen.to;
      }
    }
  }

  // 2. Top up to the requested average degree, preferring short edges so the
  //    result reads as a network rather than a hairball.
  const degree = DENSITIES.find((d) => d.id === recipe.density)?.degree ?? 2.4;
  const targetEdges = Math.min(
    Math.round((nodeCount * degree) / 2),
    (nodeCount * (nodeCount - 1)) / 2,
  );

  const candidates: { a: number; b: number; d: number }[] = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (seen.has(key(i, j))) continue;
      candidates.push({ a: i, b: j, d: dist(nodes[i], nodes[j]) });
    }
  }
  // Sort by length, then take a randomised slice of the shortest ones so two
  // graphs with the same layout but different seeds still differ.
  candidates.sort((p, q) => p.d - q.d);
  const pool = candidates.slice(0, Math.max(targetEdges * 3, 12));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  for (const candidate of pool) {
    if (edges.length >= targetEdges) break;
    push(candidate.a, candidate.b);
  }

  const startIndex = Math.max(0, Math.min(nodeCount - 1, recipe.startIndex));

  return {
    id: CUSTOM_GRAPH_ID,
    label: `Random graph · ${nodeCount} nodes`,
    directed: false,
    weighted: true,
    nodes,
    edges,
    start: nodes[startIndex].id,
  };
}

export function sanitizeRecipe(value: unknown): RandomGraphRecipe | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Partial<RandomGraphRecipe>;
  const nodeCount = Math.round(Number(r.nodeCount));
  if (!Number.isFinite(nodeCount)) return null;

  const clamped = Math.max(MIN_RANDOM_NODES, Math.min(MAX_RANDOM_NODES, nodeCount));
  return {
    nodeCount: clamped,
    density: DENSITIES.some((d) => d.id === r.density) ? (r.density as DensityId) : "medium",
    seed: Number.isFinite(Number(r.seed)) ? Math.abs(Math.round(Number(r.seed))) % 1_000_000 : 1,
    startIndex: Math.max(0, Math.min(clamped - 1, Math.round(Number(r.startIndex)) || 0)),
  };
}
