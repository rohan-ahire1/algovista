import type { Algorithm } from "../engine/algorithm";
import type { Frame, MarkKind } from "../engine/types";
import { filled } from "../engine/helpers";

const PSEUDOCODE = `procedure bubbleSort(A)
    n ← length(A)
    repeat
        swapped ← false
        for i ← 0 to n - 2 do
            if A[i] > A[i + 1] then
                swap A[i] and A[i + 1]
                swapped ← true
            end if
        end for
        n ← n - 1
    until not swapped
end procedure`;

function generate({ array }: { array: number[] }): Frame[] {
  const a = [...array];
  const n = a.length;
  const frames: Frame[] = [];
  let comparisons = 0;
  let swaps = 0;
  let sortedFrom = n;
  let pass = 0;

  const totalPasses = Math.max(1, n - 1);
  const metrics = () => ({
    size: n,
    comparisons,
    swaps,
    pass: `${Math.min(pass + 1, totalPasses)} / ${totalPasses}`,
  });

  const view = (marks: MarkKind[]) => ({ kind: "array" as const, values: [...a], marks });

  const baseMarks = () => {
    const m = filled(n);
    for (let i = sortedFrom; i < n; i++) m[i] = "sorted";
    return m;
  };

  frames.push({
    title: "Start: compare adjacent elements",
    detail:
      "Bubble Sort walks the array from left to right, comparing each element with its neighbour. Larger values drift towards the end one position at a time.",
    codeLine: 2,
    phase: "Setup",
    metrics: metrics(),
    view: view(baseMarks()),
  });

  for (pass = 0; pass < n - 1; pass++) {
    let swapped = false;

    for (let i = 0; i < n - 1 - pass; i++) {
      comparisons++;
      const m = baseMarks();
      m[i] = "compare";
      m[i + 1] = "compare-alt";
      const willSwap = a[i] > a[i + 1];

      frames.push({
        title: `Compare ${a[i]} and ${a[i + 1]}`,
        detail: willSwap
          ? `Since ${a[i]} > ${a[i + 1]}, swap them so the larger element moves to the right.`
          : `${a[i]} is not greater than ${a[i + 1]}, so they are already in order. No swap needed.`,
        chips: [`Index ${i}`, `Index ${i + 1}`],
        codeLine: 6,
        phase: `Pass ${pass + 1}`,
        metrics: metrics(),
        view: { ...view(m), pointers: [{ label: "i", index: i }] },
      });

      if (willSwap) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swaps++;
        swapped = true;
        const sm = baseMarks();
        sm[i] = "compare-alt";
        sm[i + 1] = "compare";
        frames.push({
          title: `Swap ${a[i + 1]} and ${a[i]}`,
          detail: `${a[i + 1]} bubbles one step closer to its final position at the end of the array.`,
          chips: [`Index ${i}`, `Index ${i + 1}`],
          codeLine: 7,
          phase: `Pass ${pass + 1}`,
          metrics: metrics(),
          view: { ...view(sm), pointers: [{ label: "i", index: i + 1 }] },
        });
      }
    }

    sortedFrom = n - 1 - pass;
    frames.push({
      title: `Pass ${pass + 1} complete`,
      detail: `${a[sortedFrom]} is now guaranteed to be in its final position. The next pass can ignore it and scan a shorter prefix.`,
      chips: [`${n - sortedFrom} locked`],
      codeLine: 11,
      phase: `Pass ${pass + 1}`,
      metrics: metrics(),
      view: view(baseMarks()),
    });

    if (!swapped) {
      sortedFrom = 0;
      frames.push({
        title: "No swaps in this pass — stop early",
        detail:
          "A full pass with zero swaps proves the array is already ordered, so Bubble Sort exits without doing the remaining passes.",
        codeLine: 12,
        phase: "Done",
        metrics: metrics(),
        view: view(filled(n, "sorted")),
      });
      break;
    }
  }

  sortedFrom = 0;
  frames.push({
    title: "Array is sorted",
    detail: `Every element is in ascending order after ${comparisons} comparisons and ${swaps} swaps.`,
    codeLine: 13,
    phase: "Done",
    metrics: metrics(),
    view: view(filled(n, "sorted")),
  });

  return frames;
}

export const bubbleSort: Algorithm = {
  slug: "bubble-sort",
  name: "Bubble Sort",
  category: "sorting",
  tagline: "Sort elements by repeatedly comparing adjacent elements.",
  summary:
    "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them when they are in the wrong order. After each pass the largest remaining element has 'bubbled up' to its final position.",
  icon: "BarChart3",
  difficulty: "Beginner",
  popularity: 96,
  views: "12.4k",
  complexity: {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
  },
  steps: [
    "Compare the first two adjacent elements",
    "Swap them if they are in the wrong order",
    "Move one position right and repeat to the end",
    "After each pass, the largest unsorted value is locked in",
    "Stop as soon as a pass makes no swaps",
  ],
  bestUsedWhen: [
    "When teaching how sorting fundamentally works",
    "When the input is tiny (a handful of elements)",
    "When the data is already almost sorted",
    "When a simple, stable, in-place sort is enough",
  ],
  keyInsight:
    "The early-exit check is what makes Bubble Sort O(n) on already-sorted input — without it, every pass runs even when nothing changes.",
  related: ["insertion-sort", "selection-sort", "quick-sort"],
  inputKind: "array",
  metrics: [
    { key: "size", label: "Array Size", icon: "Boxes" },
    { key: "comparisons", label: "Comparisons", icon: "Search" },
    { key: "swaps", label: "Swaps", icon: "Repeat" },
    { key: "pass", label: "Pass", icon: "Crosshair" },
  ],
  legend: [
    { mark: "compare", label: "Comparing" },
    { mark: "compare-alt", label: "Next to Compare" },
    { mark: "sorted", label: "Sorted" },
    { mark: "idle", label: "Unsorted" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def bubble_sort(arr):
    n = len(arr)
    while n > 1:
        swapped = False
        for i in range(n - 1):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        n -= 1
        if not swapped:
            break
    return arr`,
    javascript: `function bubbleSort(arr) {
  let n = arr.length;
  while (n > 1) {
    let swapped = false;
    for (let i = 0; i < n - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    n -= 1;
    if (!swapped) break;
  }
  return arr;
}`,
    java: `static void bubbleSort(int[] arr) {
    int n = arr.length;
    while (n > 1) {
        boolean swapped = false;
        for (int i = 0; i < n - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                int tmp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = tmp;
                swapped = true;
            }
        }
        n--;
        if (!swapped) break;
    }
}`,
    cpp: `void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    while (n > 1) {
        bool swapped = false;
        for (int i = 0; i < n - 1; ++i) {
            if (arr[i] > arr[i + 1]) {
                std::swap(arr[i], arr[i + 1]);
                swapped = true;
            }
        }
        --n;
        if (!swapped) break;
    }
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Bubble Sort is the simplest comparison sort there is. It makes repeated passes over the array, and on each pass it compares every neighbouring pair and swaps them if they are out of order.",
      },
      {
        type: "pillars",
        items: [
          { title: "Compare", text: "Look at two adjacent elements at a time.", icon: "Search" },
          { title: "Swap", text: "Exchange them when the left one is larger.", icon: "Repeat" },
          { title: "Repeat", text: "Pass again until a full pass makes no swaps.", icon: "RotateCw" },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "Where the name comes from",
        text: "On every pass the largest remaining value travels all the way to the right — it 'bubbles' to the surface of the array.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Start at index 0", text: "Compare A[0] with A[1]." },
          { title: "Swap if out of order", text: "If the left value is larger, exchange the pair." },
          { title: "Slide right", text: "Move to the next pair and repeat until the end of the unsorted region." },
          { title: "Shrink the region", text: "The last element is now final, so the next pass scans one element less." },
          { title: "Early exit", text: "If a pass performs no swaps, the array is sorted and the algorithm stops." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "The cost of simplicity",
        text: "Because each element can only move one position per pass, an element at the wrong end of the array needs n passes to reach its home. That is what makes Bubble Sort quadratic.",
      },
    ],
    walkthrough: [
      { type: "p", text: "Sorting [5, 3, 8, 1] — each row is one full pass over the array." },
      {
        type: "stages",
        rows: [
          { label: "Start", groups: [[5, 3, 8, 1]] },
          { label: "Pass 1", groups: [[3, 5, 1, 8]], tone: "violet" },
          { label: "Pass 2", groups: [[3, 1, 5, 8]], tone: "violet" },
          { label: "Pass 3", groups: [[1, 3, 5, 8]], tone: "mint" },
        ],
      },
      { type: "result", values: [1, 3, 5, 8], caption: "The array is now sorted in ascending order." },
    ],
    complexity: [
      {
        type: "table",
        head: ["Case", "Time", "Why"],
        rows: [
          ["Best", "O(n)", "Already sorted — one pass, zero swaps, early exit"],
          ["Average", "O(n²)", "Roughly n²/4 swaps across n passes"],
          ["Worst", "O(n²)", "Reverse-sorted input swaps on every comparison"],
        ],
      },
      {
        type: "p",
        text: "Space is O(1): all swaps happen inside the original array, so Bubble Sort needs no auxiliary storage.",
      },
      {
        type: "callout",
        tone: "success",
        title: "Stable sort",
        text: "Equal elements are never swapped past each other, so their original relative order survives — useful when sorting records by a secondary key.",
      },
    ],
  },
  quiz: [
    {
      id: "bubble-1",
      prompt: "After one complete pass of Bubble Sort, which element is guaranteed to be in its final position?",
      givenArray: [5, 3, 8, 1],
      options: ["The smallest element, at the front", "The largest element, at the end", "The median element", "None — one pass guarantees nothing"],
      answer: 1,
      explanation: "Each pass carries the largest remaining value all the way to the right end of the unsorted region.",
    },
    {
      id: "bubble-2",
      prompt: "What is the best-case time complexity of Bubble Sort with the early-exit optimisation?",
      options: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
      answer: 1,
      explanation: "On sorted input the first pass makes no swaps, so the algorithm stops after n − 1 comparisons.",
    },
    {
      id: "bubble-3",
      prompt: "How many swaps does Bubble Sort perform on the array below?",
      givenArray: [3, 2, 1],
      options: ["1", "2", "3", "4"],
      answer: 2,
      explanation: "Pass 1 swaps (3,2) and (3,1) giving [2,1,3]; pass 2 swaps (2,1) giving [1,2,3] — three swaps in total.",
    },
  ],
  generate,
};
