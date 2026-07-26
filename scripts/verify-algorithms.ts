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
import type { ArrayView, GraphView, TreeView } from "../src/lib/engine/types";

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

console.log(`\n${checks} assertions, ${failures} failure${failures === 1 ? "" : "s"}`);
process.exit(failures ? 1 : 0);
