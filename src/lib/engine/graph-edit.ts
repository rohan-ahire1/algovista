import type { GraphSpec } from "./types";
import { getGraph } from "./helpers";

/**
 * Editing model for user-built graphs.
 *
 * Every operation returns a new GraphSpec and keeps the graph in a state the
 * algorithms can always run on: unique node ids, no self-loops, no duplicate
 * edges, non-negative weights (Dijkstra's precondition) and a start node that
 * still exists.
 */

/**
 * Spreadsheet-style labels: A…Z, AA, AB… — two characters covers 702 nodes,
 * which is well past the 100-node ceiling on generated graphs.
 */
export function nodeLabel(index: number): string {
  let n = index;
  let out = "";
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

export const LABEL_PATTERN = /^[A-Z]{1,3}$/;

/**
 * Hand-editing is capped well below the generated-graph ceiling: a hand-built
 * graph is stored in the cookie in full, and 26 nodes is what fits in 4KB.
 * Generated graphs are stored as a recipe instead, so they can be far larger.
 */
export const MAX_NODES = 26;
export const MAX_EDGES = 60;
export const MIN_WEIGHT = 0;
export const MAX_WEIGHT = 99;

export const CUSTOM_GRAPH_ID = "custom";

export function defaultCustomGraph(): GraphSpec {
  const preset = getGraph("weighted");
  return { ...preset, id: CUSTOM_GRAPH_ID, label: "Custom graph", nodes: [...preset.nodes], edges: [...preset.edges] };
}

export function nextNodeId(graph: GraphSpec): string | null {
  for (let i = 0; i < MAX_NODES; i++) {
    const id = nodeLabel(i);
    if (!graph.nodes.some((n) => n.id === id)) return id;
  }
  return null;
}

const clamp01 = (v: number) => Math.max(0.04, Math.min(0.96, v));

export function addNode(graph: GraphSpec, x: number, y: number): GraphSpec {
  const id = nextNodeId(graph);
  if (!id) return graph;
  const nodes = [...graph.nodes, { id, x: clamp01(x), y: clamp01(y) }];
  return { ...graph, nodes, start: graph.nodes.length ? graph.start : id };
}

export function moveNode(graph: GraphSpec, id: string, x: number, y: number): GraphSpec {
  return { ...graph, nodes: graph.nodes.map((n) => (n.id === id ? { ...n, x: clamp01(x), y: clamp01(y) } : n)) };
}

export function removeNode(graph: GraphSpec, id: string): GraphSpec {
  const nodes = graph.nodes.filter((n) => n.id !== id);
  if (!nodes.length) return graph;
  const edges = graph.edges.filter((e) => e.from !== id && e.to !== id);
  return { ...graph, nodes, edges, start: graph.start === id ? nodes[0].id : graph.start };
}

export function hasEdge(graph: GraphSpec, from: string, to: string) {
  return graph.edges.some(
    (e) => (e.from === from && e.to === to) || (!graph.directed && e.from === to && e.to === from),
  );
}

export function addEdge(graph: GraphSpec, from: string, to: string, weight: number): GraphSpec {
  if (from === to) return graph;
  if (hasEdge(graph, from, to)) return graph;
  if (graph.edges.length >= MAX_EDGES) return graph;
  return { ...graph, edges: [...graph.edges, { from, to, weight: clampWeight(weight) }] };
}

export function removeEdge(graph: GraphSpec, from: string, to: string): GraphSpec {
  return {
    ...graph,
    edges: graph.edges.filter(
      (e) => !((e.from === from && e.to === to) || (!graph.directed && e.from === to && e.to === from)),
    ),
  };
}

export function setEdgeWeight(graph: GraphSpec, from: string, to: string, weight: number): GraphSpec {
  return {
    ...graph,
    edges: graph.edges.map((e) =>
      (e.from === from && e.to === to) || (!graph.directed && e.from === to && e.to === from)
        ? { ...e, weight: clampWeight(weight) }
        : e,
    ),
  };
}

export function setStart(graph: GraphSpec, id: string): GraphSpec {
  return graph.nodes.some((n) => n.id === id) ? { ...graph, start: id } : graph;
}

export function clampWeight(weight: number) {
  if (!Number.isFinite(weight)) return 1;
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, Math.round(weight)));
}

/** Nodes with no path from the start — Dijkstra leaves these at ∞. */
export function unreachableNodes(graph: GraphSpec): string[] {
  const adj: Record<string, string[]> = {};
  graph.nodes.forEach((n) => (adj[n.id] = []));
  graph.edges.forEach((e) => {
    adj[e.from]?.push(e.to);
    if (!graph.directed) adj[e.to]?.push(e.from);
  });

  const seen = new Set<string>([graph.start]);
  const stack = [graph.start];
  while (stack.length) {
    const node = stack.pop()!;
    for (const next of adj[node] ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return graph.nodes.filter((n) => !seen.has(n.id)).map((n) => n.id);
}

/**
 * Repairs anything a stale or hand-edited cookie could contain, so a bad value
 * can never crash the visualizer.
 */
export function sanitizeGraph(graph: unknown): GraphSpec | null {
  if (!graph || typeof graph !== "object") return null;
  const g = graph as Partial<GraphSpec>;
  if (!Array.isArray(g.nodes) || !Array.isArray(g.edges) || !g.nodes.length) return null;

  const seen = new Set<string>();
  const nodes = g.nodes
    .filter((n) => n && typeof n.id === "string" && LABEL_PATTERN.test(n.id) && !seen.has(n.id) && seen.add(n.id))
    .slice(0, MAX_NODES)
    .map((n) => ({ id: n.id, x: clamp01(Number(n.x) || 0.5), y: clamp01(Number(n.y) || 0.5) }));

  if (!nodes.length) return null;
  const ids = new Set(nodes.map((n) => n.id));

  const edgeSeen = new Set<string>();
  const edges = g.edges
    .filter((e) => e && ids.has(e.from) && ids.has(e.to) && e.from !== e.to)
    .filter((e) => {
      const key = [e.from, e.to].sort().join("--");
      if (edgeSeen.has(key)) return false;
      edgeSeen.add(key);
      return true;
    })
    .slice(0, MAX_EDGES)
    .map((e) => ({ from: e.from, to: e.to, weight: clampWeight(Number(e.weight)) }));

  return {
    id: CUSTOM_GRAPH_ID,
    label: "Custom graph",
    directed: false,
    weighted: true,
    nodes,
    edges,
    start: typeof g.start === "string" && ids.has(g.start) ? g.start : nodes[0].id,
  };
}
