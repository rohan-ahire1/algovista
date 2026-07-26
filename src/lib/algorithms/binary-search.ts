import type { Algorithm } from "../engine/algorithm";
import type { Frame, MarkKind } from "../engine/types";
import { filled } from "../engine/helpers";

const PSEUDOCODE = `procedure binarySearch(A, target)
    lo ← 0
    hi ← length(A) - 1
    while lo <= hi do
        mid ← lo + (hi - lo) / 2
        if A[mid] = target then
            return mid
        else if A[mid] < target then
            lo ← mid + 1
        else
            hi ← mid - 1
        end if
    end while
    return NOT_FOUND
end procedure`;

function generate({ array, target }: { array: number[]; target?: number }): Frame[] {
  const a = [...array].sort((x, y) => x - y);
  const n = a.length;
  const goal = target ?? a[Math.floor(n / 2)];
  const frames: Frame[] = [];
  let steps = 0;
  let comparisons = 0;

  const metrics = () => ({
    size: n,
    target: goal,
    comparisons,
    steps,
    remaining: 0 as number | string,
  });

  const build = (lo: number, hi: number, mid?: number, foundAt?: number): MarkKind[] => {
    const m = filled(n, "discarded");
    for (let i = lo; i <= hi; i++) m[i] = "idle";
    if (mid !== undefined && mid >= 0) m[mid] = "compare";
    if (foundAt !== undefined) m[foundAt] = "found";
    return m;
  };

  let lo = 0;
  let hi = n - 1;

  frames.push({
    title: `Search for ${goal}`,
    detail:
      "Binary Search requires a sorted array. It repeatedly halves the search range by comparing the middle element to the target.",
    chips: [`Target ${goal}`],
    codeLine: 2,
    phase: "Setup",
    metrics: { ...metrics(), remaining: n },
    view: { kind: "array", values: a, marks: build(lo, hi), ranges: [{ from: lo, to: hi, tone: "brand", label: "search range" }] },
  });

  let found = -1;

  while (lo <= hi) {
    steps++;
    const mid = lo + Math.floor((hi - lo) / 2);
    comparisons++;
    const remaining = hi - lo + 1;

    if (a[mid] === goal) {
      found = mid;
      frames.push({
        title: `A[${mid}] = ${a[mid]} — found it`,
        detail: `The middle element equals the target, so the search returns index ${mid} after only ${steps} step${steps === 1 ? "" : "s"}.`,
        chips: [`Index ${mid}`],
        codeLine: 7,
        phase: "Search",
        metrics: { ...metrics(), remaining },
        view: { kind: "array", values: a, marks: build(lo, hi, undefined, mid), pointers: [{ label: "mid", index: mid, tone: "mint" }] },
      });
      break;
    }

    const goRight = a[mid] < goal;
    frames.push({
      title: `Check middle: A[${mid}] = ${a[mid]}`,
      detail: goRight
        ? `${a[mid]} < ${goal}, so the target must be in the right half. Everything from index ${lo} to ${mid} can be discarded.`
        : `${a[mid]} > ${goal}, so the target must be in the left half. Everything from index ${mid} to ${hi} can be discarded.`,
      chips: [`Index ${mid}`, `${remaining} candidates`],
      codeLine: goRight ? 9 : 11,
      phase: "Search",
      metrics: { ...metrics(), remaining },
      view: {
        kind: "array",
        values: a,
        marks: build(lo, hi, mid),
        ranges: [{ from: lo, to: hi, tone: "brand", label: "search range" }],
        pointers: [
          { label: "lo", index: lo },
          { label: "mid", index: mid, tone: "violet" },
          { label: "hi", index: hi },
        ],
      },
    });

    if (goRight) lo = mid + 1;
    else hi = mid - 1;

    if (lo <= hi) {
      frames.push({
        title: `Narrow to [${lo}..${hi}]`,
        detail: `The search range just halved to ${hi - lo + 1} candidate${hi - lo === 0 ? "" : "s"}. This halving is what makes Binary Search logarithmic.`,
        chips: [`${hi - lo + 1} left`],
        codeLine: 4,
        phase: "Search",
        metrics: { ...metrics(), remaining: hi - lo + 1 },
        view: {
          kind: "array",
          values: a,
          marks: build(lo, hi),
          ranges: [{ from: lo, to: hi, tone: "brand", label: "search range" }],
        },
      });
    }
  }

  if (found === -1) {
    frames.push({
      title: `${goal} is not in the array`,
      detail: "The range collapsed to nothing, which proves the target does not exist anywhere in the array.",
      codeLine: 14,
      phase: "Done",
      metrics: { ...metrics(), remaining: 0 },
      view: { kind: "array", values: a, marks: filled(n, "discarded") },
    });
  }

  return frames;
}

export const binarySearch: Algorithm = {
  slug: "binary-search",
  name: "Binary Search",
  category: "searching",
  alsoIn: ["divide-conquer"],
  tagline: "Find an element in a sorted array by repeatedly dividing.",
  summary:
    "Binary Search locates a value in a sorted array by comparing it to the middle element and discarding the half that cannot contain it. Each comparison halves the remaining work, so a million elements need only about twenty steps.",
  icon: "Search",
  difficulty: "Beginner",
  popularity: 92,
  views: "5.1k",
  complexity: {
    best: "O(1)",
    average: "O(log n)",
    worst: "O(log n)",
    space: "O(1)",
    stable: null,
    inPlace: null,
  },
  steps: [
    "Set lo to the first index and hi to the last",
    "Compute the middle index of the current range",
    "If the middle value equals the target, stop",
    "If it is smaller, discard the left half; otherwise discard the right",
    "Repeat until the range is empty",
  ],
  bestUsedWhen: [
    "When the data is already sorted",
    "When the collection supports random access",
    "When lookups happen far more often than insertions",
    "When you need a guaranteed logarithmic bound",
  ],
  keyInsight:
    "Binary Search is really a decision tree of depth log₂ n — every comparison answers one bit of the question 'where is the target?'.",
  related: ["linear-search", "merge-sort", "quick-sort"],
  inputKind: "array-target",
  metrics: [
    { key: "size", label: "Array Size", icon: "Boxes" },
    { key: "target", label: "Target", icon: "Crosshair" },
    { key: "comparisons", label: "Comparisons", icon: "Search" },
    { key: "remaining", label: "Candidates", icon: "Filter" },
    { key: "steps", label: "Steps", icon: "Footprints" },
  ],
  legend: [
    { mark: "compare", label: "Middle element" },
    { mark: "idle", label: "Search range" },
    { mark: "discarded", label: "Eliminated" },
    { mark: "found", label: "Found" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1

    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1

    return -1`,
    javascript: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1;
}`,
    java: `static int binarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }

    return -1;
}`,
    cpp: `int binarySearch(const std::vector<int>& a, int target) {
    int lo = 0, hi = static_cast<int>(a.size()) - 1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }

    return -1;
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Binary Search exploits one fact: in a sorted array, looking at any element tells you which side the target must be on. That single comparison eliminates half of everything you have not looked at.",
      },
      {
        type: "pillars",
        items: [
          { title: "Probe", text: "Look at the middle of the current range.", icon: "Crosshair" },
          { title: "Compare", text: "Decide whether the target is left or right.", icon: "Scale" },
          { title: "Discard", text: "Throw away the half that cannot contain it.", icon: "Filter" },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Sorted input is mandatory",
        text: "On unsorted data the comparison tells you nothing about which side to keep, and the algorithm silently returns wrong answers.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Bracket the array", text: "lo = 0, hi = n − 1 describes the range still in play." },
          { title: "Find the middle", text: "mid = lo + (hi − lo)/2 avoids integer overflow on large ranges." },
          { title: "Three-way compare", text: "Equal → done. Smaller → search right. Larger → search left." },
          { title: "Shrink", text: "Move lo or hi past mid so the range strictly shrinks each iteration." },
          { title: "Terminate", text: "When lo > hi the range is empty and the target is absent." },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "Why mid is computed that way",
        text: "(lo + hi) / 2 can overflow when both indices are large. lo + (hi − lo)/2 is mathematically identical but always safe.",
      },
    ],
    walkthrough: [
      { type: "p", text: "Searching for 7 in [1, 3, 5, 7, 9, 11, 13] — each row shows the surviving range." },
      {
        type: "stages",
        rows: [
          { label: "Step 1", groups: [[1, 3, 5, 7, 9, 11, 13]], tone: "brand" },
          { label: "mid = 7", groups: [[7]], tone: "mint" },
        ],
      },
      { type: "result", values: [7], caption: "Found at index 3 in a single comparison — the target sat exactly at the midpoint." },
    ],
    complexity: [
      {
        type: "table",
        head: ["Case", "Time", "Why"],
        rows: [
          ["Best", "O(1)", "The target is the first midpoint probed"],
          ["Average", "O(log n)", "Each probe halves the candidate set"],
          ["Worst", "O(log n)", "At most ⌊log₂ n⌋ + 1 probes before the range empties"],
        ],
      },
      {
        type: "p",
        text: "The iterative version uses O(1) space. A recursive version costs O(log n) stack frames unless the compiler applies tail-call elimination.",
      },
    ],
  },
  quiz: [
    {
      id: "binary-1",
      prompt: "What is the prerequisite for Binary Search to work correctly?",
      options: ["The array must be sorted", "The array must be small", "All elements must be unique", "The array must be a power of two in length"],
      answer: 0,
      explanation: "Without sorted order, a comparison against the midpoint says nothing about which half to keep.",
    },
    {
      id: "binary-2",
      prompt: "At most how many comparisons does Binary Search need on 1,000,000 sorted elements?",
      options: ["About 20", "About 1,000", "About 500,000", "1,000,000"],
      answer: 0,
      explanation: "log₂(1,000,000) ≈ 19.9, so twenty probes are enough.",
    },
    {
      id: "binary-3",
      prompt: "Why is mid computed as lo + (hi − lo) / 2 rather than (lo + hi) / 2?",
      options: ["It is faster", "It avoids integer overflow for large indices", "It rounds differently", "It handles empty arrays"],
      answer: 1,
      explanation: "lo + hi can exceed the integer range; the subtraction form never does.",
    },
  ],
  generate,
};
