# AlgoVista

Interactive algorithm visualizer and learning platform. Twelve classic algorithms, each with a
step-by-step animated run, a written explanation, a worked example, a complexity breakdown,
implementations in four languages plus pseudocode, and a quiz.

## Running it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint
pnpm verify     # correctness harness for every algorithm (~56k assertions)
```

## How it works

The core idea is that **every algorithm compiles its input into a complete list of frames up
front** (`src/lib/engine/types.ts`). A frame holds the full visual state, an explanation of why
that step happened, the metrics at that moment, and the pseudocode line being executed. Because
the whole timeline exists before playback starts, scrubbing backwards is exact and jumping to any
step is O(1).

```
src/
  lib/
    engine/         Frame model, input builders, graph presets
    algorithms/     One file per algorithm: generator + all its content
    store/          Cookie-backed settings and progress
    practice.ts     Quiz, drill, exam and generated-challenge builders
    learning-path.ts, achievements.ts
  components/
    viz/            Array / graph / recursion-tree renderers, player, stage
    ui/             Buttons, cards, sliders, tabs — all built on the token layer
    learn/ practice/ dashboard/ library/ nav/ marketing/
  app/              Routes
```

### Algorithms

| Category | Algorithms |
|---|---|
| Sorting | Bubble, Insertion, Selection, Merge, Quick |
| Searching | Linear, Binary |
| Graphs | BFS, DFS, Dijkstra, Topological Sort |
| Recursion | Fibonacci (call tree) |

Merge and Quick Sort also appear under Divide & Conquer; Dijkstra also appears under Greedy.

Three renderers cover all twelve: an array/bar view (with pointers, range brackets and merge
buffers), an SVG graph view (directed and weighted variants, plus queue/stack chip strips), and an
SVG recursion-tree view.

### Adding an algorithm

Create `src/lib/algorithms/<slug>.ts` exporting an `Algorithm`, then register it in
`src/lib/algorithms/index.ts`. The record holds everything the UI needs — metadata, complexity,
steps, article blocks, code for all five languages, quiz questions, and the `generate` function
that turns an input into frames. Every page picks its content up from there automatically.

Run `pnpm verify` afterwards: the harness runs each generator across sizes and input presets and
asserts the final frame actually holds the right answer (sorted array, correct shortest-path
distances, valid topological order, correct Fibonacci value, and so on).

### Editing the graph

Dijkstra's visualizer has an **Edit graph** mode (`src/components/viz/graph-editor.tsx`). You can add
nodes by clicking the canvas, drag them to reposition, connect pairs, edit or delete edge weights,
and pick which node is the source. Every edit re-runs the algorithm immediately.

There is also a **Generate random** mode: a node-count slider up to 100, three density settings, and
a source-node picker (click any node). Generated graphs are built from a minimum spanning tree over
the node positions and then topped up to the requested average degree, so they are always connected
and read as networks rather than hairballs. Weights come from the geometric distance between nodes.

All hand edits go through `src/lib/engine/graph-edit.ts`, which keeps the graph in a state the
algorithm can always run on: unique ids, no self-loops or duplicate edges, non-negative weights
(Dijkstra's precondition), and a source that still exists. `sanitizeGraph` repairs anything a stale
or hand-edited cookie could contain.

**Storage is the reason the two modes differ.** A hand-built graph is stored in the cookie in full,
so it is capped at 26 nodes / 60 edges. A generated graph is stored as the *recipe* that produced it
(`{nodeCount, density, seed, startIndex}`, ~60 bytes) and rebuilt deterministically by
`src/lib/engine/graph-gen.ts` — which is what lets it reach 100 nodes inside a 4KB cookie. Drawing
tools therefore switch off above 26 nodes; picking the source still works, because that is part of
the recipe.

The renderer scales node radius, label size and per-edge weight chips to the node count
(`graphScale` in `graph-view.tsx`), so 100 nodes stay legible in the same canvas. Worst case
(100 nodes, dense) is 272 frames generated in ~11ms.

Disconnected nodes are allowed and flagged, not blocked: Dijkstra correctly leaves them at ∞, and
the editor explains that rather than preventing it.

`AlgoInput` carries an optional `graph`, so any graph algorithm can accept a custom graph — only
Dijkstra exposes the editor today (gated by `isEditableGraph` in `src/lib/engine/input.ts`).

### State

There are no accounts. Settings and progress live in two cookies (`av_settings`, `av_progress`)
which the root layout reads server-side, so the correct theme and stats are present on first paint
with no hydration flash. Clearing cookies resets everything.

### Theming

All colour, elevation and radius decisions live as CSS custom properties in
`src/app/globals.css`, defined once for light and once for dark. Components reference the tokens,
never raw colours, so the dark theme needs no per-component work.
