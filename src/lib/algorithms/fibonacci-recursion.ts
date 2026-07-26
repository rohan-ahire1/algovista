import type { Algorithm } from "../engine/algorithm";
import type { Frame, MarkKind, TreeNode, TreeView } from "../engine/types";

const PSEUDOCODE = `procedure fib(n)
    if n <= 1 then
        return n
    end if
    left  ← fib(n - 1)
    right ← fib(n - 2)
    return left + right
end procedure`;

interface Call {
  id: string;
  n: number;
  depth: number;
  parent: string | null;
  children: string[];
  result?: number;
  x: number;
}

/** Builds the full call tree first so the layout is stable across every frame. */
function buildTree(n: number) {
  const calls: Record<string, Call> = {};
  const leafOrder: string[] = [];
  let counter = 0;

  function build(value: number, depth: number, parent: string | null): string {
    const id = `c${counter++}`;
    const call: Call = { id, n: value, depth, parent, children: [], x: 0 };
    calls[id] = call;

    if (value <= 1) {
      leafOrder.push(id);
      return id;
    }
    call.children.push(build(value - 1, depth + 1, id));
    call.children.push(build(value - 2, depth + 1, id));
    return id;
  }

  const root = build(n, 0, null);

  // Tidy layout: leaves are spread evenly, parents centre over their children.
  leafOrder.forEach((id, i) => {
    calls[id].x = (i + 0.5) / leafOrder.length;
  });
  function place(id: string): number {
    const call = calls[id];
    if (!call.children.length) return call.x;
    const xs = call.children.map(place);
    call.x = (Math.min(...xs) + Math.max(...xs)) / 2;
    return call.x;
  }
  place(root);

  return { calls, root, width: leafOrder.length };
}

function generate({ n }: { n?: number }): Frame[] {
  const target = Math.max(2, Math.min(8, n ?? 5));
  const { calls, root } = buildTree(target);
  const frames: Frame[] = [];

  const marks: Record<string, MarkKind> = {};
  Object.keys(calls).forEach((id) => (marks[id] = "idle"));

  const stack: string[] = [];
  let callCount = 0;
  let baseCases = 0;
  let maxDepth = 0;
  let additions = 0;

  const metrics = () => ({
    target: `fib(${target})`,
    calls: callCount,
    base: baseCases,
    depth: maxDepth,
    additions,
  });

  const nodes = (): TreeNode[] =>
    Object.values(calls).map((c) => ({
      id: c.id,
      label: `fib(${c.n})`,
      depth: c.depth,
      x: c.x,
      parent: c.parent,
      result: c.result !== undefined ? String(c.result) : undefined,
    }));

  const view = (): TreeView => ({
    kind: "tree",
    nodes: nodes(),
    marks: { ...marks },
    collections: [
      { label: "Call stack", items: stack.map((id) => `fib(${calls[id].n})`), tone: "violet" },
    ],
  });

  frames.push({
    title: `Compute fib(${target})`,
    detail:
      "Naive Fibonacci calls itself twice per level. Watch how quickly the same subproblems start repeating — that duplication is exactly what memoisation removes.",
    chips: [`n = ${target}`],
    codeLine: 1,
    phase: "Setup",
    metrics: metrics(),
    view: view(),
  });

  function evaluate(id: string): number {
    const call = calls[id];
    callCount++;
    stack.push(id);
    marks[id] = "active";
    maxDepth = Math.max(maxDepth, call.depth + 1);

    frames.push({
      title: `Call fib(${call.n})`,
      detail:
        call.n <= 1
          ? `fib(${call.n}) hits the base case and returns ${call.n} immediately without recursing.`
          : `fib(${call.n}) cannot be answered directly, so it will call fib(${call.n - 1}) and fib(${call.n - 2}).`,
      chips: [`Depth ${call.depth}`],
      codeLine: call.n <= 1 ? 2 : 5,
      phase: `Depth ${call.depth}`,
      metrics: metrics(),
      view: view(),
    });

    if (call.n <= 1) {
      call.result = call.n;
      baseCases++;
      marks[id] = "sorted";
      stack.pop();
      frames.push({
        title: `fib(${call.n}) = ${call.n}`,
        detail: "Base case reached — this leaf returns straight back to its caller.",
        chips: ["Base case"],
        codeLine: 3,
        phase: `Depth ${call.depth}`,
        metrics: metrics(),
        view: view(),
      });
      return call.n;
    }

    marks[id] = "frontier";
    const left = evaluate(call.children[0]);
    const right = evaluate(call.children[1]);

    additions++;
    call.result = left + right;
    marks[id] = "sorted";
    stack.pop();

    frames.push({
      title: `fib(${call.n}) = ${left} + ${right} = ${call.result}`,
      detail: `Both recursive calls have returned, so fib(${call.n}) adds them and hands the result back up the stack.`,
      chips: [`Depth ${call.depth}`],
      codeLine: 7,
      phase: `Depth ${call.depth}`,
      metrics: metrics(),
      view: view(),
    });

    return call.result;
  }

  const result = evaluate(root);

  frames.push({
    title: `fib(${target}) = ${result}`,
    detail: `The answer took ${callCount} function calls, ${baseCases} of which were base cases. A memoised version would need only ${target + 1}.`,
    codeLine: 7,
    phase: "Done",
    metrics: metrics(),
    view: view(),
  });

  return frames;
}

export const fibonacciRecursion: Algorithm = {
  slug: "fibonacci-recursion",
  name: "Fibonacci Recursion",
  category: "recursion",
  tagline: "Classic recursion example to find Fibonacci numbers.",
  summary:
    "The naive recursive Fibonacci is the clearest illustration of a recursion tree — and of why recursion alone is not enough. Each call spawns two more, so the work grows exponentially even though only n distinct values exist.",
  icon: "GitBranch",
  difficulty: "Beginner",
  popularity: 82,
  views: "5.9k",
  complexity: {
    best: "O(1)",
    average: "O(φⁿ)",
    worst: "O(2ⁿ)",
    space: "O(n)",
    stable: null,
    inPlace: null,
  },
  steps: [
    "If n ≤ 1, return n — the base case",
    "Otherwise call fib(n − 1)",
    "Then call fib(n − 2)",
    "Add the two results together",
    "Return the sum to the caller",
  ],
  bestUsedWhen: [
    "When teaching recursion and call stacks",
    "When demonstrating why memoisation matters",
    "When n is very small",
    "When clarity matters more than speed",
  ],
  keyInsight:
    "fib(n − 2) is recomputed from scratch inside fib(n − 1). Caching results turns O(2ⁿ) into O(n) without changing the shape of the code.",
  related: ["depth-first-search", "merge-sort", "binary-search"],
  inputKind: "number",
  defaultInput: { n: 5 },
  metrics: [
    { key: "target", label: "Computing", icon: "Crosshair" },
    { key: "calls", label: "Function Calls", icon: "PhoneCall" },
    { key: "base", label: "Base Cases", icon: "CircleDot" },
    { key: "depth", label: "Stack Depth", icon: "Layers" },
    { key: "additions", label: "Additions", icon: "Plus" },
  ],
  legend: [
    { mark: "active", label: "Entering call" },
    { mark: "frontier", label: "Waiting on children" },
    { mark: "sorted", label: "Returned" },
    { mark: "idle", label: "Not yet called" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)


# Memoised — O(n) instead of O(2^n)
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_memo(n):
    if n <= 1:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)`,
    javascript: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Memoised — O(n) instead of O(2^n)
function fibMemo(n, cache = new Map()) {
  if (n <= 1) return n;
  if (cache.has(n)) return cache.get(n);

  const value = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, value);
  return value;
}`,
    java: `static long fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// Memoised — O(n) instead of O(2^n)
static long fibMemo(int n, Map<Integer, Long> cache) {
    if (n <= 1) return n;
    return cache.computeIfAbsent(n,
        k -> fibMemo(k - 1, cache) + fibMemo(k - 2, cache));
}`,
    cpp: `long long fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// Memoised — O(n) instead of O(2^n)
long long fibMemo(int n, std::unordered_map<int, long long>& cache) {
    if (n <= 1) return n;
    auto it = cache.find(n);
    if (it != cache.end()) return it->second;
    return cache[n] = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Every recursive function needs two things: a base case that returns without recursing, and a recursive case that makes progress towards it. Fibonacci has both in three lines.",
      },
      {
        type: "pillars",
        items: [
          { title: "Base case", text: "fib(0) = 0 and fib(1) = 1 stop the recursion.", icon: "CircleDot" },
          { title: "Recursive case", text: "fib(n) delegates to two smaller problems.", icon: "GitBranch" },
          { title: "Combine", text: "Add the two returned values and pass the sum up.", icon: "Plus" },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Exponential by construction",
        text: "fib(30) makes over 2.6 million calls to compute a number that a loop finds in 30 steps.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Enter the call", text: "A new stack frame is pushed with its own copy of n." },
          { title: "Check the base case", text: "n ≤ 1 returns immediately — this is the only way recursion ends." },
          { title: "Recurse left", text: "fib(n − 1) runs completely before fib(n − 2) starts." },
          { title: "Recurse right", text: "Only after the left subtree returns does the right one begin." },
          { title: "Return upward", text: "The sum is handed back and the frame is popped." },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "The tree is the cost",
        text: "The number of leaves in the call tree equals fib(n + 1). The tree itself is the running time.",
      },
    ],
    walkthrough: [
      { type: "p", text: "Computing fib(5) — notice how fib(3) appears twice and fib(2) three times." },
      {
        type: "table",
        head: ["Call", "Times evaluated", "Result"],
        rows: [
          ["fib(5)", "1", "5"],
          ["fib(4)", "1", "3"],
          ["fib(3)", "2", "2"],
          ["fib(2)", "3", "1"],
          ["fib(1)", "5", "1"],
          ["fib(0)", "3", "0"],
        ],
      },
      {
        type: "callout",
        tone: "success",
        title: "Memoisation in one line",
        text: "Cache each result the first time it is computed and every duplicate subtree collapses to a lookup — 15 calls become 6.",
      },
    ],
    complexity: [
      {
        type: "table",
        head: ["Version", "Time", "Space"],
        rows: [
          ["Naive recursion", "O(2ⁿ)", "O(n) stack"],
          ["Memoised recursion", "O(n)", "O(n) cache + stack"],
          ["Bottom-up loop", "O(n)", "O(1)"],
        ],
      },
      {
        type: "p",
        text: "More precisely the naive version is Θ(φⁿ) where φ ≈ 1.618 is the golden ratio — the recursion tree branches slightly less than twice per level because base cases terminate early.",
      },
    ],
  },
  quiz: [
    {
      id: "fib-1",
      prompt: "How many calls does naive fib(5) make in total?",
      options: ["5", "9", "15", "25"],
      answer: 2,
      explanation: "The call tree for fib(5) contains 15 nodes — one per function invocation.",
    },
    {
      id: "fib-2",
      prompt: "What makes naive Fibonacci exponential?",
      options: [
        "Deep recursion",
        "The same subproblems are recomputed in different branches",
        "Integer overflow",
        "Function call overhead",
      ],
      answer: 1,
      explanation: "Overlapping subproblems duplicate entire subtrees of work.",
    },
    {
      id: "fib-3",
      prompt: "What does memoisation change about the complexity?",
      options: ["O(2ⁿ) → O(n)", "O(2ⁿ) → O(log n)", "O(n) → O(1)", "Nothing"],
      answer: 0,
      explanation: "Each distinct n is computed once, so the work becomes linear in n.",
    },
  ],
  generate,
};
