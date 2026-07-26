import type { Algorithm } from "../engine/algorithm";
import type { ArrayView, Frame, MarkKind } from "../engine/types";
import { filled } from "../engine/helpers";

const PSEUDOCODE = `procedure quickSort(A, lo, hi)
    if lo >= hi then return
    p ← partition(A, lo, hi)
    quickSort(A, lo, p - 1)
    quickSort(A, p + 1, hi)
end procedure

procedure partition(A, lo, hi)
    pivot ← A[hi]
    i ← lo - 1
    for j ← lo to hi - 1 do
        if A[j] <= pivot then
            i ← i + 1
            swap A[i] and A[j]
        end if
    end for
    swap A[i + 1] and A[hi]
    return i + 1
end procedure`;

function generate({ array }: { array: number[] }): Frame[] {
  const a = [...array];
  const n = a.length;
  const frames: Frame[] = [];
  let comparisons = 0;
  let swaps = 0;
  let partitions = 0;
  let maxDepth = 0;

  const placed = filled(n, "idle");
  const metrics = () => ({ size: n, comparisons, swaps, partitions, depth: maxDepth });

  const view = (lo: number, hi: number, extra?: Partial<ArrayView>): ArrayView => ({
    kind: "array",
    values: [...a],
    marks: [...placed],
    ranges: lo <= hi ? [{ from: lo, to: hi, tone: "brand" }] : undefined,
    ...extra,
  });

  const push = (f: Omit<Frame, "metrics">) => frames.push({ ...f, metrics: metrics() });

  push({
    title: "Start with the whole array",
    detail:
      "Quick Sort picks a pivot, moves every smaller value to its left and every larger value to its right, then sorts the two sides recursively.",
    codeLine: 1,
    phase: "Setup",
    view: { kind: "array", values: [...a], marks: filled(n) },
  });

  function sort(lo: number, hi: number, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    if (lo > hi) return;
    if (lo === hi) {
      placed[lo] = "sorted";
      push({
        title: `${a[lo]} is a single element`,
        detail: "A range of one element is already sorted — recursion stops here.",
        chips: [`Index ${lo}`],
        codeLine: 2,
        phase: "Partition",
        view: view(lo, hi),
      });
      return;
    }

    partitions++;
    const pivot = a[hi];
    const marks = [...placed];
    marks[hi] = "pivot";
    push({
      title: `Choose pivot ${pivot}`,
      detail: `The last element of the range [${lo}..${hi}] becomes the pivot. Everything ≤ ${pivot} will end up on its left.`,
      chips: [`Index ${hi}`, `Depth ${depth}`],
      codeLine: 9,
      phase: "Partition",
      view: view(lo, hi, { marks, pointers: [{ label: "pivot", index: hi, tone: "violet" }] }),
    });

    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      const small = a[j] <= pivot;
      const m = [...placed];
      m[hi] = "pivot";
      m[j] = "compare";
      for (let t = lo; t <= i; t++) if (m[t] === "idle") m[t] = "compare-alt";
      push({
        title: `${a[j]} ${small ? "≤" : ">"} pivot ${pivot}`,
        detail: small
          ? `${a[j]} belongs on the left side, so grow the "smaller" region and swap it into place.`
          : `${a[j]} belongs on the right side — leave it where it is and move on.`,
        chips: [`Index ${j}`],
        codeLine: 12,
        phase: "Partition",
        view: view(lo, hi, {
          marks: m,
          pointers: [
            { label: "j", index: j },
            { label: "pivot", index: hi, tone: "violet" },
          ],
        }),
      });

      if (small) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
        }
      }
    }

    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    swaps++;
    const p = i + 1;
    placed[p] = "sorted";

    push({
      title: `Pivot ${pivot} lands at index ${p}`,
      detail: `Everything left of index ${p} is ≤ ${pivot} and everything right is > ${pivot}, so the pivot is in its final position forever.`,
      chips: [`Index ${p}`],
      codeLine: 16,
      phase: "Partition",
      view: view(lo, hi, {
        marks: placed.map((m, idx) => (idx === p ? "sorted" : m)) as MarkKind[],
      }),
    });

    sort(lo, p - 1, depth + 1);
    sort(p + 1, hi, depth + 1);
  }

  sort(0, n - 1, 0);

  push({
    title: "Array is sorted",
    detail: `${partitions} partition steps, ${comparisons} comparisons and ${swaps} swaps — all done in place.`,
    codeLine: 5,
    phase: "Done",
    view: { kind: "array", values: [...a], marks: filled(n, "sorted") },
  });

  return frames;
}

export const quickSort: Algorithm = {
  slug: "quick-sort",
  name: "Quick Sort",
  category: "sorting",
  alsoIn: ["divide-conquer"],
  tagline: "Pick a pivot and sort elements into smaller partitions.",
  summary:
    "Quick Sort chooses a pivot element and partitions the array so that smaller values sit to its left and larger values to its right. The pivot is then final, and the two sides are sorted recursively — all without any auxiliary array.",
  icon: "SlidersHorizontal",
  difficulty: "Intermediate",
  popularity: 94,
  views: "6.2k",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: false,
    inPlace: true,
  },
  steps: [
    "Choose a pivot element from the range",
    "Partition: move smaller values left, larger values right",
    "The pivot is now in its final position",
    "Recursively sort the left partition",
    "Recursively sort the right partition",
  ],
  bestUsedWhen: [
    "When average-case speed matters more than worst-case",
    "When sorting in place with minimal extra memory",
    "When cache locality is important",
    "When stability is not required",
  ],
  keyInsight:
    "Quick Sort's speed comes from doing its work during the split rather than the combine — once a pivot is placed, no later step ever moves it again.",
  related: ["merge-sort", "selection-sort", "binary-search"],
  inputKind: "array",
  metrics: [
    { key: "size", label: "Array Size", icon: "Boxes" },
    { key: "comparisons", label: "Comparisons", icon: "Search" },
    { key: "swaps", label: "Swaps", icon: "Repeat" },
    { key: "partitions", label: "Partitions", icon: "Split" },
    { key: "depth", label: "Max Depth", icon: "Layers" },
  ],
  legend: [
    { mark: "pivot", label: "Pivot" },
    { mark: "compare", label: "Scanning" },
    { mark: "compare-alt", label: "≤ pivot region" },
    { mark: "sorted", label: "Final position" },
    { mark: "idle", label: "Unsorted" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def quick_sort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo >= hi:
        return arr

    p = partition(arr, lo, hi)
    quick_sort(arr, lo, p - 1)
    quick_sort(arr, p + 1, hi)
    return arr

def partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo - 1
    for j in range(lo, hi):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[hi] = arr[hi], arr[i + 1]
    return i + 1`,
    javascript: `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const p = partition(arr, lo, hi);
  quickSort(arr, lo, p - 1);
  quickSort(arr, p + 1, hi);
  return arr;
}

function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
  return i + 1;
}`,
    java: `static void quickSort(int[] arr, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(arr, lo, hi);
    quickSort(arr, lo, p - 1);
    quickSort(arr, p + 1, hi);
}

static int partition(int[] arr, int lo, int hi) {
    int pivot = arr[hi], i = lo - 1;
    for (int j = lo; j < hi; j++) {
        if (arr[j] <= pivot) {
            i++;
            int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
    }
    int t = arr[i + 1]; arr[i + 1] = arr[hi]; arr[hi] = t;
    return i + 1;
}`,
    cpp: `int partition(std::vector<int>& a, int lo, int hi) {
    int pivot = a[hi], i = lo - 1;
    for (int j = lo; j < hi; ++j) {
        if (a[j] <= pivot) std::swap(a[++i], a[j]);
    }
    std::swap(a[i + 1], a[hi]);
    return i + 1;
}

void quickSort(std::vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Quick Sort is divide-and-conquer with the work moved to the front. Where Merge Sort splits blindly and works hard to combine, Quick Sort works hard to split and then has nothing left to combine.",
      },
      {
        type: "pillars",
        items: [
          { title: "Pivot", text: "Choose one element to compare everything against.", icon: "Crosshair" },
          { title: "Partition", text: "Rearrange so smaller values sit left, larger right.", icon: "Split" },
          { title: "Recurse", text: "Sort the two sides — the pivot is already final.", icon: "GitFork" },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "No combine step",
        text: "After partitioning, the left side, the pivot and the right side are already in the right order relative to each other — there is nothing to merge.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Pick the pivot", text: "This implementation uses the last element of the range." },
          { title: "Sweep with j", text: "Compare every element in the range against the pivot." },
          { title: "Grow the small region", text: "When A[j] ≤ pivot, advance i and swap A[i] with A[j]." },
          { title: "Seat the pivot", text: "Swap the pivot into slot i + 1, the boundary between the regions." },
          { title: "Recurse", text: "Sort [lo..p−1] and [p+1..hi] the same way." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "The quadratic trap",
        text: "If the pivot is always the smallest or largest element — for example a last-element pivot on already-sorted input — each partition removes only one element and the recursion becomes n deep.",
      },
    ],
    walkthrough: [
      { type: "p", text: "Partitioning [5, 3, 8, 1] with pivot 1, then recursing on the right side." },
      {
        type: "stages",
        rows: [
          { label: "Start", groups: [[5, 3, 8, 1]] },
          { label: "Pivot 1", groups: [[1], [3, 8, 5]], tone: "violet" },
          { label: "Pivot 5", groups: [[1], [3], [5], [8]], tone: "violet" },
          { label: "Done", groups: [[1, 3, 5, 8]], tone: "mint" },
        ],
      },
      { type: "result", values: [1, 3, 5, 8], caption: "Each pivot was placed once and never moved again." },
    ],
    complexity: [
      {
        type: "table",
        head: ["Case", "Time", "Why"],
        rows: [
          ["Best", "O(n log n)", "Pivot splits the range roughly in half every time"],
          ["Average", "O(n log n)", "Random pivots split well with high probability"],
          ["Worst", "O(n²)", "Pivot is always the extreme value — n levels of recursion"],
        ],
      },
      {
        type: "p",
        text: "Space is O(log n) for the recursion stack in the balanced case. Randomising the pivot, or using median-of-three, makes the worst case vanishingly unlikely in practice.",
      },
    ],
  },
  quiz: [
    {
      id: "quick-1",
      prompt: "After a single partition step, what is guaranteed?",
      options: [
        "The whole array is sorted",
        "The pivot is in its final sorted position",
        "The left half is sorted",
        "Nothing is guaranteed",
      ],
      answer: 1,
      explanation: "Everything left of the pivot is ≤ it and everything right is > it, so its index is final.",
    },
    {
      id: "quick-2",
      prompt: "Which input triggers Quick Sort's O(n²) worst case with a last-element pivot?",
      options: ["Randomly shuffled", "Already sorted ascending", "All elements distinct", "Very large arrays"],
      answer: 1,
      explanation: "On sorted input the pivot is always the maximum, so each partition peels off just one element.",
    },
    {
      id: "quick-3",
      prompt: "Why is Quick Sort usually faster than Merge Sort in practice despite the same average complexity?",
      options: [
        "It does fewer comparisons",
        "It sorts in place with excellent cache locality and no allocation",
        "It is not recursive",
        "It never compares equal elements",
      ],
      answer: 1,
      explanation: "Partitioning is a tight in-place scan; Merge Sort pays for buffer allocation and copying.",
    },
  ],
  generate,
};
