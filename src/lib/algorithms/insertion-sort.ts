import type { Algorithm } from "../engine/algorithm";
import type { Frame, MarkKind, Pointer } from "../engine/types";
import { filled } from "../engine/helpers";

const PSEUDOCODE = `procedure insertionSort(A)
    for j ← 1 to length(A) - 1 do
        key ← A[j]
        i ← j - 1
        while i >= 0 and A[i] > key do
            A[i + 1] ← A[i]
            i ← i - 1
        end while
        A[i + 1] ← key
    end for
end procedure`;

function generate({ array }: { array: number[] }): Frame[] {
  const a = [...array];
  const n = a.length;
  const frames: Frame[] = [];
  let comparisons = 0;
  let shifts = 0;
  let sortedTo = 1;

  const metrics = () => ({ size: n, comparisons, shifts, sorted: `${sortedTo} / ${n}` });
  const baseMarks = () => {
    const m = filled(n);
    for (let i = 0; i < sortedTo; i++) m[i] = "sorted";
    return m;
  };
  const view = (marks: MarkKind[], pointers?: Pointer[]) => ({
    kind: "array" as const,
    values: [...a],
    marks,
    pointers,
  });

  frames.push({
    title: "Treat the first element as sorted",
    detail:
      "A single element is trivially sorted. Insertion Sort grows this sorted prefix one element at a time by inserting the next value into its correct place.",
    codeLine: 2,
    phase: "Setup",
    metrics: metrics(),
    view: view(baseMarks()),
  });

  for (let j = 1; j < n; j++) {
    const key = a[j];
    const pick = baseMarks();
    pick[j] = "active";
    frames.push({
      title: `Pick up ${key}`,
      detail: `${key} is the next unsorted value. Hold it aside and find where it belongs inside the sorted prefix on its left.`,
      chips: [`Index ${j}`, "key"],
      codeLine: 3,
      phase: `Insert ${key}`,
      metrics: metrics(),
      view: view(pick, [{ label: "key", index: j, tone: "violet" }]),
    });

    let i = j - 1;
    while (i >= 0 && a[i] > key) {
      comparisons++;
      const cm = baseMarks();
      cm[i] = "compare";
      cm[i + 1] = "compare-alt";
      frames.push({
        title: `${a[i]} > ${key} — shift right`,
        detail: `${a[i]} is larger than the key, so it slides one slot to the right to open up space.`,
        chips: [`Index ${i}`],
        codeLine: 6,
        phase: `Insert ${key}`,
        metrics: metrics(),
        view: view(cm, [{ label: "key", index: j, tone: "violet" }]),
      });
      a[i + 1] = a[i];
      shifts++;
      i--;
    }

    if (i >= 0) comparisons++;
    a[i + 1] = key;
    sortedTo = j + 1;

    const place = baseMarks();
    place[i + 1] = "active";
    frames.push({
      title: `Insert ${key} at index ${i + 1}`,
      detail:
        i < 0
          ? `${key} is smaller than everything in the sorted prefix, so it goes at the very front.`
          : `${a[i]} is not greater than ${key}, so the correct slot has been found.`,
      chips: [`Index ${i + 1}`],
      codeLine: 9,
      phase: `Insert ${key}`,
      metrics: metrics(),
      view: view(place),
    });
  }

  frames.push({
    title: "Array is sorted",
    detail: `The sorted prefix now covers the whole array — ${comparisons} comparisons and ${shifts} shifts.`,
    codeLine: 11,
    phase: "Done",
    metrics: metrics(),
    view: view(filled(n, "sorted")),
  });

  return frames;
}

export const insertionSort: Algorithm = {
  slug: "insertion-sort",
  name: "Insertion Sort",
  category: "sorting",
  tagline: "Build a sorted prefix by inserting each new element into place.",
  summary:
    "Insertion Sort keeps a sorted region at the front of the array and repeatedly takes the next unsorted value, shifting larger elements right until it finds the slot where the value belongs — exactly how most people sort a hand of playing cards.",
  icon: "AlignLeft",
  difficulty: "Beginner",
  popularity: 84,
  views: "7.9k",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true, inPlace: true },
  steps: [
    "Treat the first element as a sorted prefix",
    "Take the next unsorted element as the key",
    "Shift every larger element in the prefix one slot right",
    "Drop the key into the gap that opens up",
    "Repeat until the prefix covers the array",
  ],
  bestUsedWhen: [
    "When the array is small or nearly sorted",
    "When data arrives incrementally (online sorting)",
    "As the base case inside a hybrid sort like Timsort",
    "When a stable, in-place sort with low overhead is needed",
  ],
  keyInsight:
    "Insertion Sort only pays for the disorder that actually exists — its running time is proportional to the number of inversions in the input, which is why nearly-sorted data is almost free.",
  related: ["bubble-sort", "selection-sort", "merge-sort"],
  inputKind: "array",
  metrics: [
    { key: "size", label: "Array Size", icon: "Boxes" },
    { key: "comparisons", label: "Comparisons", icon: "Search" },
    { key: "shifts", label: "Shifts", icon: "MoveRight" },
    { key: "sorted", label: "Sorted Prefix", icon: "CheckCheck" },
  ],
  legend: [
    { mark: "active", label: "Key" },
    { mark: "compare", label: "Shifting" },
    { mark: "sorted", label: "Sorted prefix" },
    { mark: "idle", label: "Unsorted" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def insertion_sort(arr):
    for j in range(1, len(arr)):
        key = arr[j]
        i = j - 1
        while i >= 0 and arr[i] > key:
            arr[i + 1] = arr[i]
            i -= 1
        arr[i + 1] = key
    return arr`,
    javascript: `function insertionSort(arr) {
  for (let j = 1; j < arr.length; j++) {
    const key = arr[j];
    let i = j - 1;
    while (i >= 0 && arr[i] > key) {
      arr[i + 1] = arr[i];
      i--;
    }
    arr[i + 1] = key;
  }
  return arr;
}`,
    java: `static void insertionSort(int[] arr) {
    for (int j = 1; j < arr.length; j++) {
        int key = arr[j];
        int i = j - 1;
        while (i >= 0 && arr[i] > key) {
            arr[i + 1] = arr[i];
            i--;
        }
        arr[i + 1] = key;
    }
}`,
    cpp: `void insertionSort(std::vector<int>& arr) {
    for (size_t j = 1; j < arr.size(); ++j) {
        int key = arr[j];
        int i = static_cast<int>(j) - 1;
        while (i >= 0 && arr[i] > key) {
            arr[i + 1] = arr[i];
            --i;
        }
        arr[i + 1] = key;
    }
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Insertion Sort maintains an invariant: everything to the left of the current position is already sorted. Each step extends that sorted region by exactly one element.",
      },
      {
        type: "pillars",
        items: [
          { title: "Pick", text: "Take the first unsorted element as the key.", icon: "Hand" },
          { title: "Shift", text: "Move larger elements one slot to the right.", icon: "MoveRight" },
          { title: "Insert", text: "Drop the key into the gap that opens.", icon: "CornerDownLeft" },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "The card player's sort",
        text: "It is the algorithm almost everyone invents naturally when sorting a hand of cards — hold the sorted cards, slide the new one into place.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Sorted prefix of one", text: "A[0] alone is already sorted." },
          { title: "Take the key", text: "Store A[j] so its slot can be overwritten safely." },
          { title: "Scan left", text: "While the element on the left is larger, copy it one slot right." },
          { title: "Insert", text: "The loop stops at the first element ≤ key — write the key just after it." },
          { title: "Grow", text: "The sorted prefix is now one element longer. Repeat." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Shifts, not swaps",
        text: "Insertion Sort copies elements rather than swapping them. One shift is a single write; a swap costs three — this is why it beats Bubble Sort in practice.",
      },
    ],
    walkthrough: [
      { type: "p", text: "Sorting [8, 4, 7, 3] — the highlighted group is the sorted prefix after each insertion." },
      {
        type: "stages",
        rows: [
          { label: "Start", groups: [[8], [4, 7, 3]] },
          { label: "Insert 4", groups: [[4, 8], [7, 3]], tone: "violet" },
          { label: "Insert 7", groups: [[4, 7, 8], [3]], tone: "violet" },
          { label: "Insert 3", groups: [[3, 4, 7, 8]], tone: "mint" },
        ],
      },
      { type: "result", values: [3, 4, 7, 8], caption: "The sorted prefix has absorbed the entire array." },
    ],
    complexity: [
      {
        type: "table",
        head: ["Case", "Time", "Why"],
        rows: [
          ["Best", "O(n)", "Sorted input — the inner while loop never runs"],
          ["Average", "O(n²)", "Each key travels about half the prefix"],
          ["Worst", "O(n²)", "Reverse-sorted input shifts the whole prefix each time"],
        ],
      },
      {
        type: "p",
        text: "More precisely, the running time is Θ(n + inversions). For data that is 'almost sorted' this is close to linear, which is why real-world hybrid sorts fall back to Insertion Sort on small or nearly-ordered runs.",
      },
    ],
  },
  quiz: [
    {
      id: "insertion-1",
      prompt: "Insertion Sort is fastest on which kind of input?",
      options: ["Reverse-sorted", "Randomly shuffled", "Already (or nearly) sorted", "All inputs cost the same"],
      answer: 2,
      explanation: "With no inversions the inner loop exits immediately, giving a single linear pass.",
    },
    {
      id: "insertion-2",
      prompt: "How many shifts happen when inserting the key 3 into the sorted prefix below?",
      givenArray: [4, 7, 8],
      givenLabel: "Sorted prefix",
      options: ["0", "1", "2", "3"],
      answer: 3,
      explanation: "8, 7 and 4 are all greater than 3, so all three shift right before 3 lands at index 0.",
    },
    {
      id: "insertion-3",
      prompt: "Why is Insertion Sort considered stable?",
      options: [
        "It never moves elements",
        "It shifts only elements strictly greater than the key",
        "It sorts descending first",
        "It uses extra memory to preserve order",
      ],
      answer: 1,
      explanation: "Because the condition is A[i] > key (not ≥), equal elements are never moved past each other.",
    },
  ],
  generate,
};
