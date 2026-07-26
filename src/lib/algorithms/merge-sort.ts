import type { Algorithm } from "../engine/algorithm";
import type { ArrayView, Frame, MarkKind } from "../engine/types";
import { filled } from "../engine/helpers";

const PSEUDOCODE = `procedure mergeSort(A, lo, hi)
    if lo >= hi then return
    mid ← (lo + hi) / 2
    mergeSort(A, lo, mid)
    mergeSort(A, mid + 1, hi)
    merge(A, lo, mid, hi)
end procedure

procedure merge(A, lo, mid, hi)
    L ← A[lo..mid]; R ← A[mid+1..hi]
    i ← 0; j ← 0; k ← lo
    while i < len(L) and j < len(R) do
        if L[i] <= R[j] then A[k] ← L[i]; i ← i + 1
        else A[k] ← R[j]; j ← j + 1
        k ← k + 1
    end while
    copy any remaining elements of L and R into A
end procedure`;

function generate({ array }: { array: number[] }): Frame[] {
  const a = [...array];
  const n = a.length;
  const frames: Frame[] = [];
  let comparisons = 0;
  let merges = 0;
  let writes = 0;
  let maxDepth = 0;

  const metrics = () => ({ size: n, comparisons, merges, writes, depth: maxDepth });

  const push = (
    f: Omit<Frame, "metrics" | "view"> & { view: ArrayView },
  ) => frames.push({ ...f, metrics: metrics() });

  const settled = filled(n, "idle");

  const baseView = (lo: number, hi: number, extra?: Partial<ArrayView>): ArrayView => ({
    kind: "array",
    values: [...a],
    marks: settled.map((m, idx) => (idx < lo || idx > hi ? (m === "sorted" ? "sorted" : "idle") : m)) as MarkKind[],
    ranges: [{ from: lo, to: hi, tone: "brand" }],
    ...extra,
  });

  push({
    title: "Start with the whole array",
    detail:
      "Merge Sort is divide-and-conquer: split the array down to single elements, then merge the pieces back together in sorted order.",
    codeLine: 1,
    phase: "Setup",
    view: { kind: "array", values: [...a], marks: filled(n) },
  });

  function sort(lo: number, hi: number, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    if (lo >= hi) {
      const m = filled(n);
      m[lo] = "sorted";
      settled[lo] = "sorted";
      push({
        title: `[${lo}] is a single element`,
        detail: "A subarray of one element is sorted by definition — this is the base case of the recursion.",
        chips: [`Depth ${depth}`],
        codeLine: 2,
        phase: "Divide",
        view: baseView(lo, hi, { marks: settled.map((x, i) => (i === lo ? "sorted" : x)) as MarkKind[] }),
      });
      return;
    }

    const mid = Math.floor((lo + hi) / 2);
    push({
      title: `Divide [${lo}..${hi}] at ${mid}`,
      detail: `Split into a left half [${lo}..${mid}] and a right half [${mid + 1}..${hi}], then sort each half independently.`,
      chips: [`Depth ${depth}`, `${hi - lo + 1} elements`],
      codeLine: 3,
      phase: "Divide",
      view: baseView(lo, hi, {
        ranges: [
          { from: lo, to: mid, tone: "brand", label: "left" },
          { from: mid + 1, to: hi, tone: "violet", label: "right" },
        ],
      }),
    });

    sort(lo, mid, depth + 1);
    sort(mid + 1, hi, depth + 1);

    /* -------------------------------- merge ------------------------------ */
    merges++;
    const L = a.slice(lo, mid + 1);
    const R = a.slice(mid + 1, hi + 1);
    const buffer = [...L, ...R];
    const bufMarks = (i: number, j: number, consumedL: number, consumedR: number): MarkKind[] =>
      buffer.map((_, idx) => {
        if (idx < L.length) {
          if (idx < consumedL) return "discarded";
          return idx === i ? "compare" : "idle";
        }
        const rIdx = idx - L.length;
        if (rIdx < consumedR) return "discarded";
        return rIdx === j ? "compare-alt" : "idle";
      });

    push({
      title: `Merge [${lo}..${mid}] with [${mid + 1}..${hi}]`,
      detail:
        "Both halves are sorted, so the smallest remaining value is always at the front of one of them. Compare the two fronts and take the smaller.",
      chips: [`${L.length} + ${R.length}`],
      codeLine: 9,
      phase: "Merge",
      view: baseView(lo, hi, {
        auxiliary: { label: "Left buffer · Right buffer", values: buffer, marks: bufMarks(0, 0, 0, 0) },
      }),
    });

    let i = 0;
    let j = 0;
    let k = lo;

    while (i < L.length && j < R.length) {
      comparisons++;
      const takeLeft = L[i] <= R[j];
      push({
        title: `Compare ${L[i]} and ${R[j]}`,
        detail: takeLeft
          ? `${L[i]} ≤ ${R[j]}, so ${L[i]} is written to position ${k}. Taking from the left half on ties is what keeps Merge Sort stable.`
          : `${R[j]} < ${L[i]}, so ${R[j]} is written to position ${k}.`,
        chips: [`Slot ${k}`],
        codeLine: 12,
        phase: "Merge",
        view: baseView(lo, hi, {
          marks: settled.map((m, idx) => (idx === k ? "active" : m)) as MarkKind[],
          auxiliary: { label: "Left buffer · Right buffer", values: buffer, marks: bufMarks(i, j, i, j) },
        }),
      });

      a[k] = takeLeft ? L[i++] : R[j++];
      settled[k] = "sorted";
      writes++;
      k++;
    }

    while (i < L.length) {
      a[k] = L[i++];
      settled[k] = "sorted";
      writes++;
      k++;
    }
    while (j < R.length) {
      a[k] = R[j++];
      settled[k] = "sorted";
      writes++;
      k++;
    }

    push({
      title: `[${lo}..${hi}] is merged`,
      detail: `The two halves are now a single sorted run of ${hi - lo + 1} elements. Any leftovers were appended directly, since they were already the largest.`,
      chips: [`Depth ${depth}`],
      codeLine: 17,
      phase: "Merge",
      view: baseView(lo, hi, { marks: [...settled] }),
    });
  }

  sort(0, n - 1, 0);

  push({
    title: "Array is sorted",
    detail: `Merge Sort finished with ${comparisons} comparisons across ${merges} merge operations — always Θ(n log n), whatever the input looked like.`,
    codeLine: 6,
    phase: "Done",
    view: { kind: "array", values: [...a], marks: filled(n, "sorted") },
  });

  return frames;
}

export const mergeSort: Algorithm = {
  slug: "merge-sort",
  name: "Merge Sort",
  category: "sorting",
  alsoIn: ["divide-conquer"],
  tagline: "Divide array into halves, sort, then merge them.",
  summary:
    "Merge Sort is a divide-and-conquer algorithm that divides the array into two halves, sorts them recursively, and then merges the sorted halves to produce the final sorted array.",
  icon: "GitMerge",
  difficulty: "Intermediate",
  popularity: 98,
  views: "8.7k",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: true,
    inPlace: false,
  },
  steps: [
    "Divide the array into two halves",
    "Recursively sort both halves",
    "Merge the two sorted halves",
    "Repeat until the entire array is sorted",
    "Return the sorted array",
  ],
  bestUsedWhen: [
    "When stable sorting is required",
    "When working with large datasets",
    "When consistent performance is needed",
    "When external sorting (on disk) is needed",
  ],
  keyInsight:
    "The merge step is efficient because both halves are already sorted, allowing us to compare and combine elements in linear time.",
  related: ["quick-sort", "insertion-sort", "bubble-sort"],
  inputKind: "array",
  metrics: [
    { key: "size", label: "Array Size", icon: "Boxes" },
    { key: "comparisons", label: "Comparisons", icon: "Search" },
    { key: "merges", label: "Merges", icon: "GitMerge" },
    { key: "writes", label: "Writes", icon: "PenLine" },
    { key: "depth", label: "Max Depth", icon: "Layers" },
  ],
  legend: [
    { mark: "compare", label: "Left candidate" },
    { mark: "compare-alt", label: "Right candidate" },
    { mark: "active", label: "Writing" },
    { mark: "sorted", label: "Merged" },
    { mark: "idle", label: "Pending" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
    javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
    java: `static int[] mergeSort(int[] arr) {
    if (arr.length <= 1) return arr;

    int mid = arr.length / 2;
    int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
    int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));

    return merge(left, right);
}

static int[] merge(int[] left, int[] right) {
    int[] result = new int[left.length + right.length];
    int i = 0, j = 0, k = 0;

    while (i < left.length && j < right.length) {
        result[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    }
    while (i < left.length) result[k++] = left[i++];
    while (j < right.length) result[k++] = right[j++];

    return result;
}`,
    cpp: `void merge(std::vector<int>& a, int lo, int mid, int hi) {
    std::vector<int> tmp;
    tmp.reserve(hi - lo + 1);
    int i = lo, j = mid + 1;

    while (i <= mid && j <= hi) {
        if (a[i] <= a[j]) tmp.push_back(a[i++]);
        else tmp.push_back(a[j++]);
    }
    while (i <= mid) tmp.push_back(a[i++]);
    while (j <= hi) tmp.push_back(a[j++]);

    std::copy(tmp.begin(), tmp.end(), a.begin() + lo);
}

void mergeSort(std::vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    merge(a, lo, mid, hi);
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Merge Sort is a divide-and-conquer algorithm. It works by dividing the array into smaller subarrays, sorting them, and then merging them back together in sorted order.",
      },
      {
        type: "pillars",
        items: [
          { title: "Divide", text: "Split the array into two halves until each subarray contains only one element.", icon: "Split" },
          { title: "Conquer", text: "Recursively sort each half.", icon: "GitFork" },
          { title: "Combine", text: "Merge the sorted halves to produce a fully sorted array.", icon: "GitMerge" },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "Key Insight",
        text: "Instead of swapping elements like other sorts, Merge Sort uses extra space to merge sorted parts efficiently. It guarantees O(n log n) time complexity in the best, average, and worst cases.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Split in half", text: "Compute the midpoint and cut the range in two." },
          { title: "Recurse left", text: "Sort the left half using the same procedure." },
          { title: "Recurse right", text: "Sort the right half the same way." },
          { title: "Merge", text: "Walk both sorted halves with two pointers, always taking the smaller front value." },
          { title: "Drain", text: "Append whatever remains in one half — it is already sorted and larger." },
        ],
      },
      {
        type: "callout",
        tone: "success",
        title: "Why the merge is linear",
        text: "Each comparison consumes exactly one element from one of the halves, so merging two runs of total length m costs at most m − 1 comparisons.",
      },
    ],
    walkthrough: [
      { type: "p", text: "Sorting [8, 4, 7, 3, 1, 6, 2, 5] — divide down to singletons, then combine upward." },
      {
        type: "stages",
        caption: "Divide → Conquer → Combine",
        rows: [
          { label: "Original", groups: [[8, 4, 7, 3, 1, 6, 2, 5]] },
          { label: "Divide", groups: [[8, 4, 7, 3], [1, 6, 2, 5]] },
          { label: "Divide", groups: [[8, 4], [7, 3], [1, 6], [2, 5]] },
          { label: "Conquer", groups: [[8], [4], [7], [3], [1], [6], [2], [5]], tone: "mint" },
          { label: "Combine", groups: [[4, 8], [3, 7], [1, 6], [2, 5]], tone: "violet" },
          { label: "Combine", groups: [[3, 4, 7, 8], [1, 2, 5, 6]], tone: "violet" },
        ],
      },
      { type: "result", values: [1, 2, 3, 4, 5, 6, 7, 8], caption: "The array is now sorted in ascending order." },
    ],
    complexity: [
      {
        type: "table",
        head: ["Case", "Time", "Why"],
        rows: [
          ["Best", "O(n log n)", "The recursion tree always has log n levels"],
          ["Average", "O(n log n)", "Every level does Θ(n) merging work"],
          ["Worst", "O(n log n)", "Input order does not change the split structure"],
        ],
      },
      {
        type: "p",
        text: "Space is O(n) because the merge step needs a buffer the size of the range being merged. This is the price paid for the guaranteed n log n bound and for stability.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Not in-place",
        text: "In-place merge variants exist, but they trade the simple linear merge for far more complex rotations and are slower in practice.",
      },
    ],
  },
  quiz: [
    {
      id: "merge-1",
      prompt: "What will be the final sorted array after applying Merge Sort?",
      givenArray: [8, 4, 7, 3, 1, 6, 2, 5],
      givenLabel: "Given Array",
      options: ["[ 1 2 3 4 5 6 7 8 ]", "[ 1 2 4 3 5 6 7 8 ]", "[ 1 2 3 4 5 6 7 8 ]", "[ 8 7 6 5 4 3 2 1 ]"],
      answer: 0,
      explanation: "Merge Sort divides the array, sorts the halves, and merges them back in order.",
    },
    {
      id: "merge-2",
      prompt: "Why is Merge Sort O(n log n) even in the worst case?",
      options: [
        "It picks a good pivot",
        "The split is always down the middle, giving log n levels of Θ(n) work",
        "It uses extra memory",
        "It sorts in place",
      ],
      answer: 1,
      explanation: "The midpoint split does not depend on the data, so the recursion depth is always log n.",
    },
    {
      id: "merge-3",
      prompt: "What makes Merge Sort stable?",
      options: [
        "It compares with <= and takes from the left half on ties",
        "It never uses recursion",
        "It sorts descending internally",
        "It swaps adjacent elements only",
      ],
      answer: 0,
      explanation: "Taking the left element when values are equal preserves the original relative order.",
    },
  ],
  generate,
};
