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

### State

There are no accounts. Settings and progress live in two cookies (`av_settings`, `av_progress`)
which the root layout reads server-side, so the correct theme and stats are present on first paint
with no hydration flash. Clearing cookies resets everything.

### Theming

All colour, elevation and radius decisions live as CSS custom properties in
`src/app/globals.css`, defined once for light and once for dark. Components reference the tokens,
never raw colours, so the dark theme needs no per-component work.
