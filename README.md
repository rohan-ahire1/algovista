# AlgoVista

An interactive algorithm visualizer and learning platform: watch classic algorithms run step by step, read why each
step happens, then test yourself.

Thirteen algorithms, each with an animated run you can scrub forwards and backwards, a written explanation, a worked
example, a complexity breakdown, code in Python, JavaScript, Java and C++ plus pseudocode with the current line
highlighted, and a quiz.

## Features

- **Step-by-step visualizer** with play, pause, step and scrub controls, a live explanation of each step, running
  metrics (such as comparisons, swaps or visited nodes) and the matching pseudocode line.
- **Three renderers cover every algorithm**: an array/bar view (pointers, range brackets, merge buffers), an SVG
  graph view (directed and weighted, with queue/stack strips) and an SVG recursion-tree view, plus a table view for
  dynamic programming.
- **Graph editor for Dijkstra**: add and drag nodes, connect and weight edges, pick the source, and watch the algorithm
  re-run on every edit. A generator builds random connected graphs of up to 100 nodes.
- **Learn and practice**: articles per algorithm, a learning path, quizzes, drills, mock exams, generated
  challenges and achievements.
- **No accounts**: settings and progress live in two cookies that the server reads, so the right theme and stats are
  there on first paint.
- **Light and dark themes** from one set of CSS design tokens.
- **Correctness harness**: `pnpm verify` runs every algorithm across input sizes and presets and checks the final
  frame holds the right answer (about 104,000 assertions).

### Algorithms

| Category | Algorithms |
|---|---|
| Sorting | Bubble, Insertion, Selection, Merge, Quick |
| Searching | Linear, Binary |
| Graphs | BFS, DFS, Dijkstra, Topological Sort |
| Recursion | Fibonacci (call tree) |
| Dynamic Programming | 0/1 Knapsack |

Merge and Quick Sort also appear under Divide & Conquer; Dijkstra also appears under Greedy. Data Structures is
listed as coming soon.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Radix UI / shadcn components · Shiki (code
highlighting) · lucide-react · tsx (verification script)

## How it works

**Every algorithm compiles its input into a complete list of frames up front** (`src/lib/engine/types.ts`). A frame
holds the full visual state, an explanation of why that step happened, the metrics at that moment and the pseudocode
line being executed. Because the whole timeline exists before playback starts, scrubbing backwards is exact and
jumping to any step is O(1).

```
src/
  lib/
    engine/         Frame model, input builders, graph presets, graph editing and generation
    algorithms/     One file per algorithm: generator + all its content
    store/          Cookie-backed settings and progress
    practice.ts     Quiz, drill, exam and generated-challenge builders
    learning-path.ts, achievements.ts
  components/
    viz/            Array / graph / tree / table renderers, player, stage, graph editor
    ui/             Buttons, cards, sliders, tabs, all built on the token layer
    learn/ practice/ dashboard/ library/ nav/ marketing/ settings/ code/
  app/              Routes
scripts/
  verify-algorithms.ts   Correctness harness
```

### Adding an algorithm

Create `src/lib/algorithms/<slug>.ts` exporting an `Algorithm`, then register it in `src/lib/algorithms/index.ts`.
The record holds everything the UI needs: metadata, complexity, steps, article blocks, code for every language, quiz
questions, and the `generate` function that turns an input into frames. Every page picks its content up from there.
Run `pnpm verify` afterwards.

### Graph editing and cookie-sized graphs

All hand edits go through `src/lib/engine/graph-edit.ts`, which keeps the graph runnable: unique ids, no self-loops
or duplicate edges, non-negative weights (Dijkstra's precondition) and a source that still exists. `sanitizeGraph`
repairs anything a stale or hand-edited cookie could contain.

Storage is why the two editor modes differ. A hand-built graph is stored in the cookie in full, so it is capped at 26
nodes / 60 edges. A generated graph is stored as the recipe that produced it (`{nodeCount, density, seed,
startIndex}`, about 60 bytes) and rebuilt deterministically by `src/lib/engine/graph-gen.ts`, which is what lets it
reach 100 nodes inside a 4 KB cookie. Generated graphs start from a minimum spanning tree over the node positions and
are topped up to the requested density, so they are always connected; weights come from the distance between nodes.
The renderer scales node size, labels and weight chips to the node count so 100 nodes stay readable.

## Run locally

Requires Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint
pnpm verify     # correctness harness for every algorithm
```

No environment variables are needed.
