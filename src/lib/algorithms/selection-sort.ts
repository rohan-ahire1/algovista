import type { Algorithm } from "../engine/algorithm";
import type { Frame, MarkKind } from "../engine/types";
import { filled } from "../engine/helpers";

const PSEUDOCODE = `procedure selectionSort(A)
    for i ← 0 to length(A) - 2 do
        min ← i
        for j ← i + 1 to length(A) - 1 do
            if A[j] < A[min] then
                min ← j
            end if
        end for
        swap A[i] and A[min]
    end for
end procedure`;

function generate({ array }: { array: number[] }): Frame[] {
  const a = [...array];
  const n = a.length;
  const frames: Frame[] = [];
  let comparisons = 0;
  let swaps = 0;
  let sortedTo = 0;

  const metrics = () => ({ size: n, comparisons, swaps, round: `${Math.min(sortedTo + 1, n)} / ${n}` });
  const baseMarks = () => {
    const m = filled(n);
    for (let i = 0; i < sortedTo; i++) m[i] = "sorted";
    return m;
  };
  const view = (marks: MarkKind[], pointers?: { label: string; index: number; tone?: "brand" | "violet" | "mint" }[]) => ({
    kind: "array" as const,
    values: [...a],
    marks,
    pointers,
  });

  frames.push({
    title: "Find the smallest element",
    detail:
      "Selection Sort divides the array into a sorted prefix and an unsorted rest. Each round scans the unsorted rest for its minimum and moves it to the front.",
    codeLine: 2,
    phase: "Setup",
    metrics: metrics(),
    view: view(baseMarks()),
  });

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    const startMarks = baseMarks();
    startMarks[i] = "active";
    frames.push({
      title: `Round ${i + 1}: assume ${a[i]} is smallest`,
      detail: `The scan starts by treating the first unsorted element as the current minimum candidate.`,
      chips: [`Index ${i}`],
      codeLine: 3,
      phase: `Round ${i + 1}`,
      metrics: metrics(),
      view: view(startMarks, [{ label: "min", index: i, tone: "violet" }]),
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const isNew = a[j] < a[min];
      const m = baseMarks();
      m[min] = "active";
      m[j] = "compare";
      frames.push({
        title: `Compare ${a[j]} with current min ${a[min]}`,
        detail: isNew
          ? `${a[j]} is smaller, so it becomes the new minimum candidate for this round.`
          : `${a[j]} is not smaller than ${a[min]}, so the minimum candidate stays where it is.`,
        chips: [`Index ${j}`],
        codeLine: 5,
        phase: `Round ${i + 1}`,
        metrics: metrics(),
        view: view(m, [
          { label: "min", index: min, tone: "violet" },
          { label: "j", index: j },
        ]),
      });
      if (isNew) min = j;
    }

    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      swaps++;
    }
    sortedTo = i + 1;
    const done = baseMarks();
    frames.push({
      title: min === i ? `${a[i]} was already in place` : `Swap ${a[min]} and ${a[i]}`,
      detail: `${a[i]} is the smallest remaining value, so it takes position ${i} and is now locked in.`,
      chips: [`Index ${i}`],
      codeLine: 9,
      phase: `Round ${i + 1}`,
      metrics: metrics(),
      view: view(done),
    });
  }

  sortedTo = n;
  frames.push({
    title: "Array is sorted",
    detail: `Selection Sort always performs exactly ${comparisons} comparisons for this size — but only ${swaps} swaps.`,
    codeLine: 10,
    phase: "Done",
    metrics: metrics(),
    view: view(filled(n, "sorted")),
  });

  return frames;
}

export const selectionSort: Algorithm = {
  slug: "selection-sort",
  name: "Selection Sort",
  category: "sorting",
  tagline: "Repeatedly select the smallest remaining element.",
  summary:
    "Selection Sort scans the unsorted portion of the array to find its minimum, then swaps that minimum into the next sorted position. It always performs the same number of comparisons, but never more than n − 1 swaps.",
  icon: "ArrowDownWideNarrow",
  difficulty: "Beginner",
  popularity: 71,
  views: "5.2k",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: false, inPlace: true },
  steps: [
    "Point at the first unsorted position",
    "Scan the rest of the array for the smallest value",
    "Swap that value into the current position",
    "Move the boundary one step right",
    "Repeat until one element remains",
  ],
  bestUsedWhen: [
    "When writes are far more expensive than reads",
    "When memory writes must be minimised (e.g. flash storage)",
    "When a predictable, input-independent runtime is desirable",
    "When the array is small and simplicity matters",
  ],
  keyInsight:
    "Selection Sort is the sort of choice when swapping is expensive: it does at most n − 1 swaps regardless of input, versus O(n²) for Bubble Sort.",
  related: ["bubble-sort", "insertion-sort", "quick-sort"],
  inputKind: "array",
  metrics: [
    { key: "size", label: "Array Size", icon: "Boxes" },
    { key: "comparisons", label: "Comparisons", icon: "Search" },
    { key: "swaps", label: "Swaps", icon: "Repeat" },
    { key: "round", label: "Round", icon: "Crosshair" },
  ],
  legend: [
    { mark: "active", label: "Current minimum" },
    { mark: "compare", label: "Scanning" },
    { mark: "sorted", label: "Sorted" },
    { mark: "idle", label: "Unsorted" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if arr[j] < arr[m]:
                m = j
        arr[i], arr[m] = arr[m], arr[i]
    return arr`,
    javascript: `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[m]) m = j;
    }
    [arr[i], arr[m]] = [arr[m], arr[i]];
  }
  return arr;
}`,
    java: `static void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int m = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[m]) m = j;
        }
        int tmp = arr[i];
        arr[i] = arr[m];
        arr[m] = tmp;
    }
}`,
    cpp: `void selectionSort(std::vector<int>& arr) {
    for (size_t i = 0; i + 1 < arr.size(); ++i) {
        size_t m = i;
        for (size_t j = i + 1; j < arr.size(); ++j) {
            if (arr[j] < arr[m]) m = j;
        }
        std::swap(arr[i], arr[m]);
    }
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Selection Sort is the mirror image of Insertion Sort: instead of finding where the next element belongs, it finds which element belongs in the next slot.",
      },
      {
        type: "pillars",
        items: [
          { title: "Scan", text: "Sweep the unsorted region for its minimum.", icon: "Search" },
          { title: "Select", text: "Remember the index of the smallest value found.", icon: "Crosshair" },
          { title: "Place", text: "Swap it into the boundary position.", icon: "Repeat" },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "Minimal writes",
        text: "Every round ends with at most one swap, so the total number of writes is bounded by n − 1 no matter how scrambled the input is.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Set the boundary", text: "Position i marks where the sorted prefix ends." },
          { title: "Assume a minimum", text: "Treat A[i] as the smallest value seen so far." },
          { title: "Scan right", text: "Compare every later element; remember any smaller one." },
          { title: "Swap once", text: "Exchange A[i] with the true minimum." },
          { title: "Advance", text: "Move the boundary right and repeat." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Not stable",
        text: "The long-distance swap can jump one element past an equal one. Sorting [4a, 4b, 2] moves 2 to the front and pushes 4a behind 4b.",
      },
    ],
    walkthrough: [
      { type: "p", text: "Sorting [5, 3, 8, 1] — the left group is the sorted prefix after each round." },
      {
        type: "stages",
        rows: [
          { label: "Start", groups: [[5, 3, 8, 1]] },
          { label: "Round 1", groups: [[1], [3, 8, 5]], tone: "violet" },
          { label: "Round 2", groups: [[1, 3], [8, 5]], tone: "violet" },
          { label: "Round 3", groups: [[1, 3, 5, 8]], tone: "mint" },
        ],
      },
      { type: "result", values: [1, 3, 5, 8], caption: "Three rounds, three swaps, array sorted." },
    ],
    complexity: [
      {
        type: "table",
        head: ["Case", "Time", "Swaps"],
        rows: [
          ["Best", "O(n²)", "O(n)"],
          ["Average", "O(n²)", "O(n)"],
          ["Worst", "O(n²)", "O(n)"],
        ],
      },
      {
        type: "p",
        text: "The comparison count is exactly n(n − 1)/2 in every case, because the inner scan cannot stop early — it must see every remaining element to be sure it has the minimum.",
      },
    ],
  },
  quiz: [
    {
      id: "selection-1",
      prompt: "How many swaps does Selection Sort perform on an array of n elements, in the worst case?",
      options: ["n²", "n log n", "n − 1", "n²/2"],
      answer: 2,
      explanation: "Exactly one swap per round, and there are n − 1 rounds.",
    },
    {
      id: "selection-2",
      prompt: "Why does Selection Sort take O(n²) time even on already-sorted input?",
      options: [
        "It always swaps every pair",
        "The inner scan must examine every remaining element",
        "It copies the array each round",
        "It sorts descending first",
      ],
      answer: 1,
      explanation: "Finding a minimum requires looking at all candidates, so the inner loop cannot exit early.",
    },
    {
      id: "selection-3",
      prompt: "Which property does Selection Sort NOT have?",
      options: ["In-place", "Stable", "Comparison-based", "Deterministic"],
      answer: 1,
      explanation: "The long-range swap can reorder equal elements, so Selection Sort is not stable.",
    },
  ],
  generate,
};
