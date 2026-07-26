import type { Algorithm } from "../engine/algorithm";
import type { Frame, MarkKind } from "../engine/types";
import { filled } from "../engine/helpers";

const PSEUDOCODE = `procedure linearSearch(A, target)
    for i ← 0 to length(A) - 1 do
        if A[i] = target then
            return i
        end if
    end for
    return NOT_FOUND
end procedure`;

function generate({ array, target }: { array: number[]; target?: number }): Frame[] {
  const a = [...array];
  const n = a.length;
  const goal = target ?? a[Math.max(0, n - 2)];
  const frames: Frame[] = [];
  let comparisons = 0;

  const metrics = () => ({ size: n, target: goal, comparisons, checked: comparisons });

  const marks = (i: number, found = false): MarkKind[] => {
    const m = filled(n);
    for (let k = 0; k < i; k++) m[k] = "discarded";
    if (i < n) m[i] = found ? "found" : "compare";
    return m;
  };

  frames.push({
    title: `Search for ${goal}`,
    detail:
      "Linear Search makes no assumptions about the data. It simply inspects every element from left to right until it finds the target or runs out of elements.",
    chips: [`Target ${goal}`],
    codeLine: 2,
    phase: "Setup",
    metrics: metrics(),
    view: { kind: "array", values: a, marks: filled(n) },
  });

  let found = -1;
  for (let i = 0; i < n; i++) {
    comparisons++;
    const hit = a[i] === goal;
    frames.push({
      title: `Check A[${i}] = ${a[i]}`,
      detail: hit
        ? `${a[i]} matches the target, so the search stops immediately and returns index ${i}.`
        : `${a[i]} is not ${goal}. Rule this position out and move one step right.`,
      chips: [`Index ${i}`],
      codeLine: 3,
      phase: "Scan",
      metrics: metrics(),
      view: { kind: "array", values: a, marks: marks(i, hit), pointers: [{ label: "i", index: i, tone: hit ? "mint" : "brand" }] },
    });
    if (hit) {
      found = i;
      break;
    }
  }

  if (found === -1) {
    frames.push({
      title: `${goal} is not in the array`,
      detail: `All ${n} elements were checked without a match, which is the worst case for Linear Search.`,
      codeLine: 6,
      phase: "Done",
      metrics: metrics(),
      view: { kind: "array", values: a, marks: filled(n, "discarded") },
    });
  }

  return frames;
}

export const linearSearch: Algorithm = {
  slug: "linear-search",
  name: "Linear Search",
  category: "searching",
  tagline: "Scan every element from start to finish until a match.",
  summary:
    "Linear Search walks the collection one element at a time and compares each against the target. It is the only search that works on unsorted data and on structures without random access, such as linked lists and streams.",
  icon: "ScanLine",
  difficulty: "Beginner",
  popularity: 68,
  views: "3.4k",
  complexity: {
    best: "O(1)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(1)",
    stable: null,
    inPlace: null,
  },
  steps: [
    "Start at the first element",
    "Compare it with the target",
    "Return the index if they match",
    "Otherwise advance one position",
    "Report not-found when the array is exhausted",
  ],
  bestUsedWhen: [
    "When the data is unsorted",
    "When the collection is small",
    "When the structure has no random access (linked lists, streams)",
    "When the cost of sorting first cannot be amortised",
  ],
  keyInsight:
    "Linear Search is the baseline every other search is measured against — sorting first only pays off when you search the same data many times.",
  related: ["binary-search", "breadth-first-search", "bubble-sort"],
  inputKind: "array-target",
  metrics: [
    { key: "size", label: "Array Size", icon: "Boxes" },
    { key: "target", label: "Target", icon: "Crosshair" },
    { key: "comparisons", label: "Comparisons", icon: "Search" },
    { key: "checked", label: "Positions Checked", icon: "Footprints" },
  ],
  legend: [
    { mark: "compare", label: "Checking" },
    { mark: "discarded", label: "Ruled out" },
    { mark: "found", label: "Found" },
    { mark: "idle", label: "Not yet checked" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def linear_search(arr, target):
    for i, value in enumerate(arr):
        if value == target:
            return i
    return -1`,
    javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
    java: `static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
    cpp: `int linearSearch(const std::vector<int>& a, int target) {
    for (size_t i = 0; i < a.size(); ++i) {
        if (a[i] == target) return static_cast<int>(i);
    }
    return -1;
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Linear Search is the simplest possible search: look at everything until you find what you want. Its value is not speed but universality — it has no preconditions at all.",
      },
      {
        type: "pillars",
        items: [
          { title: "Visit", text: "Move to the next element in order.", icon: "Footprints" },
          { title: "Compare", text: "Test it against the target value.", icon: "Scale" },
          { title: "Return", text: "Stop at the first match, or report absence.", icon: "CornerDownLeft" },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "When linear beats logarithmic",
        text: "For a single lookup on unsorted data, Linear Search at O(n) is cheaper than sorting at O(n log n) just to enable Binary Search.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Begin at index 0", text: "No setup or preprocessing is required." },
          { title: "Compare", text: "Test A[i] against the target." },
          { title: "Early return", text: "A match ends the search immediately." },
          { title: "Advance", text: "Otherwise increment i and repeat." },
          { title: "Exhaust", text: "Falling off the end means the value is absent." },
        ],
      },
    ],
    walkthrough: [
      { type: "p", text: "Searching for 6 in [5, 3, 8, 1, 6] — positions are ruled out one at a time." },
      {
        type: "stages",
        rows: [
          { label: "i = 0", groups: [[5]], tone: "brand" },
          { label: "i = 1", groups: [[3]], tone: "brand" },
          { label: "i = 2", groups: [[8]], tone: "brand" },
          { label: "i = 3", groups: [[1]], tone: "brand" },
          { label: "i = 4", groups: [[6]], tone: "mint" },
        ],
      },
      { type: "result", values: [6], caption: "Found at index 4 after five comparisons." },
    ],
    complexity: [
      {
        type: "table",
        head: ["Case", "Time", "Why"],
        rows: [
          ["Best", "O(1)", "The target is the first element"],
          ["Average", "O(n)", "On average half the array is scanned"],
          ["Worst", "O(n)", "The target is last, or absent entirely"],
        ],
      },
      {
        type: "p",
        text: "Space is O(1) — a single index variable. There is no preprocessing cost, which is exactly why it remains the right choice for one-off searches.",
      },
    ],
  },
  quiz: [
    {
      id: "linear-1",
      prompt: "What is the worst-case number of comparisons for Linear Search on n elements?",
      options: ["log n", "n / 2", "n", "n²"],
      answer: 2,
      explanation: "If the target is last or missing, every element must be examined.",
    },
    {
      id: "linear-2",
      prompt: "When is Linear Search preferable to Binary Search?",
      options: [
        "When the array is sorted",
        "When the data is unsorted or has no random access",
        "When the array is very large",
        "Never",
      ],
      answer: 1,
      explanation: "Binary Search requires sorted, randomly-accessible data; Linear Search requires neither.",
    },
    {
      id: "linear-3",
      prompt: "How many comparisons does Linear Search need to find 6 in [5, 3, 8, 1, 6]?",
      givenArray: [5, 3, 8, 1, 6],
      options: ["1", "3", "4", "5"],
      answer: 3,
      explanation: "It checks 5, 3, 8, 1 and finally 6 — five comparisons in total.",
    },
  ],
  generate,
};
