/**
 * Correctness harness for the frame generators.
 *
 * Every algorithm is run over several array sizes and presets; we assert that
 * the final frame really does hold the right answer, that metrics stay
 * non-negative, and that no frame is malformed. Run with: pnpm verify
 */
import { ALGORITHMS } from "../src/lib/algorithms/index";
import { buildInput } from "../src/lib/engine/input";
import { DEFAULT_SETTINGS } from "../src/lib/store/schema";
import { adjacency, getGraph, type ArrayPreset } from "../src/lib/engine/helpers";
import type { ArrayView, GraphSpec, GraphView, TreeView } from "../src/lib/engine/types";
import { addEdge, addNode, defaultCustomGraph, unreachableNodes } from "../src/lib/engine/graph-edit";
import { DENSITIES, MAX_RANDOM_NODES, MIN_RANDOM_NODES, generateRandomGraph } from "../src/lib/engine/graph-gen";

const PRESETS: ArrayPreset[] = ["random", "sorted", "reversed", "nearly-sorted", "few-unique"];
const SIZES = [5, 8, 13, 20];

let failures = 0;
let checks = 0;

function assert(condition: boolean, message: string) {
  checks++;
  if (!condition) {
    failures++;
    console.error(`  ✗ ${message}`);
  }
}

function fib(n: number): number {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}

for (const algorithm of ALGORITHMS) {
  const combos =
    algorithm.inputKind === "array" || algorithm.inputKind === "array-target"
      ? SIZES.flatMap((size) => PRESETS.map((preset) => ({ size, preset })))
      : [{ size: 10, preset: "random" as ArrayPreset }];

  let cases = 0;

  for (const { size, preset } of combos) {
    const settings = { ...DEFAULT_SETTINGS, arraySize: size, preset, seed: size * 7 + preset.length };
    const input = buildInput(algorithm, settings);
    const frames = algorithm.generate(input);
    cases++;

    assert(frames.length > 1, `${algorithm.slug}: produced ${frames.length} frames (size ${size}, ${preset})`);

    for (const [i, frame] of frames.entries()) {
      assert(Boolean(frame.title && frame.detail), `${algorithm.slug}: frame ${i} missing title/detail`);
      assert(Boolean(frame.view), `${algorithm.slug}: frame ${i} missing view`);
      for (const [key, value] of Object.entries(frame.metrics)) {
        if (typeof value === "number") {
          assert(value >= 0 && Number.isFinite(value), `${algorithm.slug}: metric ${key} = ${value} at frame ${i}`);
        }
      }
      if (frame.view.kind === "array") {
        const v = frame.view as ArrayView;
        assert(v.marks.length === v.values.length, `${algorithm.slug}: marks/values length mismatch at frame ${i}`);
      }
    }

    const finalView = frames.at(-1)!.view;

    /* ------------------------------ sorting ----------------------------- */
    if (algorithm.category === "sorting") {
      const values = (finalView as ArrayView).values;
      const expected = [...input.array].sort((a, b) => a - b);
      assert(
        JSON.stringify(values) === JSON.stringify(expected),
        `${algorithm.slug}: not sorted (size ${size}, ${preset})\n     got ${values}\n     want ${expected}`,
      );
      assert(values.length === input.array.length, `${algorithm.slug}: lost elements (size ${size})`);
    }

    /* ----------------------------- searching ---------------------------- */
    if (algorithm.category === "searching") {
      const target = input.target!;
      const found = frames.some((f) => (f.view as ArrayView).marks?.includes("found"));
      const present = input.array.includes(target);
      assert(found === present, `${algorithm.slug}: target ${target} present=${present} but found=${found}`);
    }

    /* ------------------------------ graphs ------------------------------ */
    if (algorithm.category === "graphs") {
      const graph = getGraph(algorithm.defaultInput?.graphId);
      const view = finalView as GraphView;

      if (algorithm.slug === "topological-sort") {
        const order = view.collections?.find((c) => c.label === "Topological order")?.items ?? [];
        assert(order.length === graph.nodes.length, `${algorithm.slug}: ordered ${order.length}/${graph.nodes.length}`);
        for (const edge of graph.edges) {
          assert(
            order.indexOf(edge.from) < order.indexOf(edge.to),
            `${algorithm.slug}: edge ${edge.from}→${edge.to} violates order ${order.join(",")}`,
          );
        }
      } else if (algorithm.slug === "dijkstra") {
        // Independent Dijkstra to compare against.
        const adj = adjacency(graph);
        const dist: Record<string, number> = {};
        graph.nodes.forEach((n) => (dist[n.id] = Infinity));
        dist[graph.start] = 0;
        const done = new Set<string>();
        while (done.size < graph.nodes.length) {
          let u: string | null = null;
          for (const n of graph.nodes) if (!done.has(n.id) && (!u || dist[n.id] < dist[u])) u = n.id;
          if (!u || dist[u] === Infinity) break;
          done.add(u);
          for (const { to, weight } of adj[u]) dist[to] = Math.min(dist[to], dist[u] + weight);
        }
        for (const node of graph.nodes) {
          const shown = view.nodeLabels?.[node.id];
          const want = dist[node.id] === Infinity ? "∞" : String(dist[node.id]);
          assert(shown === want, `${algorithm.slug}: dist(${node.id}) shown ${shown}, expected ${want}`);
        }
      } else {
        const visited = view.collections?.find((c) => c.label === "Visit order")?.items ?? [];
        assert(
          new Set(visited).size === visited.length,
          `${algorithm.slug}: visited a node twice (${visited.join(",")})`,
        );
        assert(
          visited.length === graph.nodes.length,
          `${algorithm.slug}: visited ${visited.length}/${graph.nodes.length} nodes`,
        );
      }
    }

    /* ---------------------------- recursion ----------------------------- */
    if (algorithm.slug === "fibonacci-recursion") {
      const n = input.n!;
      const root = (finalView as TreeView).nodes.find((node) => node.depth === 0)!;
      assert(root.result === String(fib(n)), `fibonacci: fib(${n}) rendered ${root.result}, expected ${fib(n)}`);
    }
  }

  console.log(`✓ ${algorithm.name.padEnd(22)} ${cases} case${cases === 1 ? "" : "s"}`);
}

/* ------------------------------------------------------------------ *
 * User-edited graphs: Dijkstra must stay correct on graphs the editor
 * can produce, including disconnected ones.
 * ------------------------------------------------------------------ */

function referenceDijkstra(graph: GraphSpec) {
  const adj = adjacency(graph);
  const dist: Record<string, number> = {};
  graph.nodes.forEach((n) => (dist[n.id] = Infinity));
  dist[graph.start] = 0;
  const done = new Set<string>();
  while (done.size < graph.nodes.length) {
    let u: string | null = null;
    for (const n of graph.nodes) if (!done.has(n.id) && (!u || dist[n.id] < dist[u])) u = n.id;
    if (!u || dist[u] === Infinity) break;
    done.add(u);
    for (const { to, weight } of adj[u]) dist[to] = Math.min(dist[to], dist[u] + weight);
  }
  return dist;
}

function randomGraph(seed: number): GraphSpec {
  let s = seed >>> 0 || 1;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };

  let graph = defaultCustomGraph();
  graph = { ...graph, nodes: [graph.nodes[0]], edges: [], start: graph.nodes[0].id };

  const count = 2 + Math.floor(rand() * 10);
  for (let i = 1; i < count; i++) graph = addNode(graph, rand(), rand());
  const ids = graph.nodes.map((n) => n.id);
  const attempts = Math.floor(rand() * 20);
  for (let i = 0; i < attempts; i++) {
    const a = ids[Math.floor(rand() * ids.length)];
    const b = ids[Math.floor(rand() * ids.length)];
    graph = addEdge(graph, a, b, Math.floor(rand() * 30));
  }
  return graph;
}

const dijkstraAlgorithm = ALGORITHMS.find((a) => a.slug === "dijkstra")!;
let orphanCases = 0;

for (let seed = 1; seed <= 300; seed++) {
  const graph = randomGraph(seed * 977);
  const frames = dijkstraAlgorithm.generate({ array: [], graph, start: graph.start });
  const expected = referenceDijkstra(graph);
  const view = frames.at(-1)!.view as GraphView;

  assert(frames.length > 1, `custom graph ${seed}: only ${frames.length} frames`);
  if (unreachableNodes(graph).length) orphanCases++;

  for (const node of graph.nodes) {
    const shown = view.nodeLabels?.[node.id];
    const want = expected[node.id] === Infinity ? "∞" : String(expected[node.id]);
    assert(shown === want, `custom graph ${seed}: dist(${node.id}) shown ${shown}, expected ${want}`);
  }
  // Sanity: no edge weight the editor produced can be negative.
  for (const e of graph.edges) {
    assert((e.weight ?? 1) >= 0, `custom graph ${seed}: negative weight on ${e.from}-${e.to}`);
  }
}

console.log(`✓ ${"Custom graphs".padEnd(22)} 300 cases (${orphanCases} with unreachable nodes)`);

/* ------------------------------------------------------------------ *
 * Generated graphs: every size and density must stay connected,
 * correct, and cheap enough to render.
 * ------------------------------------------------------------------ */

let worstFrames = 0;
let worstMs = 0;
let generatedCases = 0;

for (const density of DENSITIES) {
  for (let nodeCount = MIN_RANDOM_NODES; nodeCount <= MAX_RANDOM_NODES; nodeCount += 5) {
    for (const seed of [1, 7, 4242]) {
      const graph = generateRandomGraph({ nodeCount, density: density.id, seed, startIndex: 0 });
      generatedCases++;

      assert(graph.nodes.length === nodeCount, `random ${nodeCount}/${density.id}: got ${graph.nodes.length} nodes`);
      assert(
        new Set(graph.nodes.map((n) => n.id)).size === nodeCount,
        `random ${nodeCount}/${density.id}: duplicate node ids`,
      );
      // The spanning tree means a generated graph is never disconnected.
      assert(
        unreachableNodes(graph).length === 0,
        `random ${nodeCount}/${density.id} seed ${seed}: ${unreachableNodes(graph).length} unreachable nodes`,
      );
      for (const n of graph.nodes) {
        assert(n.x >= 0 && n.x <= 1 && n.y >= 0 && n.y <= 1, `random ${nodeCount}: node ${n.id} outside canvas`);
      }
      for (const e of graph.edges) {
        assert((e.weight ?? 0) >= 1 && (e.weight ?? 0) <= 99, `random ${nodeCount}: weight ${e.weight} out of range`);
        assert(e.from !== e.to, `random ${nodeCount}: self-loop on ${e.from}`);
      }

      // Same recipe must rebuild the identical graph — that is what makes
      // storing a recipe instead of the graph safe.
      const again = generateRandomGraph({ nodeCount, density: density.id, seed, startIndex: 0 });
      assert(
        JSON.stringify(again) === JSON.stringify(graph),
        `random ${nodeCount}/${density.id} seed ${seed}: generation is not deterministic`,
      );

      const t0 = performance.now();
      const frames = dijkstraAlgorithm.generate({ array: [], graph, start: graph.start });
      worstMs = Math.max(worstMs, performance.now() - t0);
      worstFrames = Math.max(worstFrames, frames.length);

      const expected = referenceDijkstra(graph);
      const view = frames.at(-1)!.view as GraphView;
      for (const node of graph.nodes) {
        const want = String(expected[node.id]);
        assert(
          view.nodeLabels?.[node.id] === want,
          `random ${nodeCount}/${density.id}: dist(${node.id}) = ${view.nodeLabels?.[node.id]}, expected ${want}`,
        );
      }
    }
  }
}

// A recipe must always fit the cookie, even at the maximum size.
const biggestCookie = encodeURIComponent(
  JSON.stringify({
    ...DEFAULT_SETTINGS,
    graphSource: {
      kind: "random",
      recipe: { nodeCount: MAX_RANDOM_NODES, density: "dense", seed: 999999, startIndex: 99 },
    },
  }),
).length;
assert(biggestCookie < 4096, `settings cookie is ${biggestCookie} bytes, over the 4096 limit`);

console.log(
  `✓ ${"Generated graphs".padEnd(22)} ${generatedCases} cases (max ${worstFrames} frames, ${worstMs.toFixed(0)}ms, cookie ${biggestCookie}B)`,
);

console.log(`\n${checks} assertions, ${failures} failure${failures === 1 ? "" : "s"}`);
process.exit(failures ? 1 : 0);
