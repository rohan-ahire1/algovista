import type { Algorithm } from "../engine/algorithm";
import { filled } from "../engine/helpers";
import type { Frame, KnapsackItem, MarkKind, TableView } from "../engine/types";

const PSEUDOCODE = `procedure knapsack01(items, capacity)
    dp[0..n][0..capacity] ← 0
    for i ← 1 to n do
        item ← items[i - 1]
        for c ← 0 to capacity do
            skip ← dp[i - 1][c]
            if item.weight > c then
                dp[i][c] ← skip
            else
                take ← dp[i - 1][c - item.weight] + item.value
                dp[i][c] ← max(skip, take)
            end if
        end for
    end for
    return dp[n][capacity]
end procedure`;

const DEFAULT_CAPACITY = 12;

const DEFAULT_ITEMS: KnapsackItem[] = [
  { id: "camera", name: "Camera", weight: 4, value: 8 },
  { id: "tent", name: "Tent", weight: 5, value: 10 },
  { id: "laptop", name: "Laptop", weight: 3, value: 6 },
  { id: "guitar", name: "Guitar", weight: 7, value: 14 },
  { id: "jacket", name: "Jacket", weight: 2, value: 5 },
  { id: "book", name: "Book", weight: 1, value: 2 },
];

function generate({ items, capacity }: { items?: KnapsackItem[]; capacity?: number }): Frame[] {
  const list = items?.length ? items : DEFAULT_ITEMS;
  const limit = Math.max(1, Math.min(30, Math.floor(capacity ?? DEFAULT_CAPACITY)));
  const table = Array.from({ length: list.length + 1 }, () => Array.from({ length: limit + 1 }, () => 0));
  const frames: Frame[] = [];
  let cells = 0;
  let best = 0;
  let selectedCount = 0;

  const metrics = () => ({
    items: list.length,
    capacity: limit,
    cells,
    best,
    selected: selectedCount,
  });

  const view = (
    row: number,
    focus: number,
    decision?: NonNullable<TableView["decision"]>,
  ): TableView => {
    const marksForRow = (rowIndex: number): MarkKind[] => {
      const marks = filled(limit + 1);
      const currentItem = row > 0 ? list[row - 1] : null;
      if (rowIndex < row) {
        marks.fill("sorted");
        if (rowIndex === row - 1 && currentItem) {
          marks[focus] = "compare-alt";
          if (focus >= currentItem.weight) marks[focus - currentItem.weight] = "compare";
        }
        return marks;
      }
      if (rowIndex === row) {
        for (let i = 0; i < focus; i++) marks[i] = "sorted";
        marks[focus] = "active";
      }
      return marks;
    };

    return {
      kind: "table",
      columns: Array.from({ length: limit + 1 }, (_, column) => String(column)),
      rows: table.slice(0, row + 1).map((values, rowIndex) => ({
        id: `row-${rowIndex}`,
        label: rowIndex === 0 ? "0 · no items" : `${rowIndex} · ${list[rowIndex - 1].name} (w${list[rowIndex - 1].weight}, v${list[rowIndex - 1].value})`,
        values: [...values],
        marks: marksForRow(rowIndex),
      })),
      caption: "DP table · each cell is the best value available at that capacity.",
      activeCell: { row, column: focus },
      decision,
    };
  };

  frames.push({
    title: `Fill a DP table for ${list.length} items`,
    detail:
      `Each row asks the same question: what is the best value we can carry at every capacity after considering one more item? A 0/1 choice means an item is either taken once or skipped.`,
    chips: [`${list.length} items`, `Capacity ${limit}`],
    codeLine: 2,
    phase: "Setup",
    metrics: metrics(),
    view: view(0, 0),
  });

  list.forEach((item, itemIndex) => {
    const row = itemIndex + 1;
    const previous = table[row - 1];

    for (let currentCapacity = 0; currentCapacity <= limit; currentCapacity++) {
      const skip = previous[currentCapacity];
      const take = currentCapacity >= item.weight ? previous[currentCapacity - item.weight] + item.value : null;
      table[row][currentCapacity] = take === null ? skip : Math.max(skip, take);
      cells++;
      best = Math.max(best, table[row][currentCapacity]);

      const chosen = take !== null && take > skip;
      const takeSource = currentCapacity >= item.weight ? previous[currentCapacity - item.weight] : undefined;
      frames.push({
        title: `${chosen ? "Take" : "Skip"} ${item.name} at capacity ${currentCapacity}`,
        detail:
          take === null
            ? `${item.name} weighs ${item.weight}, which is more than capacity ${currentCapacity}, so this cell carries forward the previous best value of ${skip}.`
            : chosen
              ? `Taking ${item.name} gives ${take} value (${previous[currentCapacity - item.weight]} from the remaining capacity + ${item.value}). That beats skipping it at ${skip}.`
              : `Taking ${item.name} would give ${take}, which does not beat the existing value ${skip}. Keep the previous choice.`,
        chips: [`${item.name}: w${item.weight} · v${item.value}`, `Cell ${row}, ${currentCapacity}`],
        codeLine: take === null ? 8 : 11,
        phase: `Item ${row} of ${list.length}`,
        metrics: metrics(),
        view: view(row, currentCapacity, {
          item: item.name,
          capacity: currentCapacity,
          skip,
          take,
          result: table[row][currentCapacity],
          choice: chosen ? "take" : "skip",
          takeSource,
          itemValue: item.value,
          remainingCapacity: currentCapacity - item.weight,
        }),
      });
    }

    frames.push({
      title: `${item.name} row complete`,
      detail: `The row now contains the best value for every capacity when the first ${row} items are available. The algorithm can safely move on to the next item.`,
      chips: [`Row ${row}`, `Best ${table[row][limit]}`],
      codeLine: 13,
      phase: `Item ${row} of ${list.length}`,
      metrics: metrics(),
      view: view(row, limit),
    });
  });

  let remaining = limit;
  const selected: KnapsackItem[] = [];
  for (let row = list.length; row > 0; row--) {
    if (table[row][remaining] !== table[row - 1][remaining]) {
      const item = list[row - 1];
      selected.unshift(item);
      remaining -= item.weight;
    }
  }
  selectedCount = selected.length;

  const selectedNames = selected.length ? selected.map((item) => item.name).join(", ") : "nothing";
  frames.push({
    title: `Best value is ${table[list.length][limit]}`,
    detail: `The optimal packing takes ${selectedNames}. Its total value is ${table[list.length][limit]} within the capacity of ${limit}.`,
    chips: [`${selected.length} selected`, `Capacity ${limit}`],
    codeLine: 15,
    phase: "Done",
    metrics: metrics(),
    view: view(list.length, limit),
  });

  return frames;
}

export const zeroOneKnapsack: Algorithm = {
  slug: "zero-one-knapsack",
  name: "0/1 Knapsack",
  category: "dynamic-programming",
  tagline: "Choose the most valuable set of items within a weight limit.",
  summary:
    "The 0/1 Knapsack problem chooses each item at most once. Dynamic programming records the best value for every capacity, reusing smaller subproblems instead of trying every possible subset from scratch.",
  icon: "Grid2x2",
  difficulty: "Intermediate",
  popularity: 88,
  views: "5.7k",
  complexity: {
    best: "O(nC)",
    average: "O(nC)",
    worst: "O(nC)",
    space: "O(nC)",
    stable: null,
    inPlace: false,
  },
  steps: [
    "Create a DP table with one row for each item",
    "For every capacity, compare skipping the item with taking it",
    "Carry the larger value into the current cell",
    "Repeat until every item and capacity has been considered",
    "Read the optimal value from the final capacity cell",
  ],
  bestUsedWhen: [
    "When every item can be selected at most once",
    "When you need the best value under a hard capacity limit",
    "When overlapping subproblems make brute force too expensive",
    "When the capacity is moderate enough for a table",
  ],
  keyInsight:
    "The current cell only needs the previous row: skip the item, or take it and add its value to the best solution that fits in the remaining capacity.",
  related: ["fibonacci-recursion"],
  inputKind: "knapsack",
  defaultInput: { items: DEFAULT_ITEMS, capacity: DEFAULT_CAPACITY },
  metrics: [
    { key: "items", label: "Items", icon: "Boxes" },
    { key: "capacity", label: "Capacity", icon: "Scale" },
    { key: "cells", label: "Cells Filled", icon: "Grid2x2" },
    { key: "best", label: "Best Value", icon: "Target" },
    { key: "selected", label: "Selected Items", icon: "CheckCheck" },
  ],
  legend: [
    { mark: "active", label: "Current cell" },
    { mark: "compare", label: "Take candidate" },
    { mark: "compare-alt", label: "Skip candidate" },
    { mark: "sorted", label: "Filled cell" },
    { mark: "idle", label: "Not yet filled" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def knapsack_01(items, capacity):
    dp = [0] * (capacity + 1)

    for weight, value in items:
        for c in range(capacity, weight - 1, -1):
            dp[c] = max(dp[c], dp[c - weight] + value)

    return dp[capacity]`,
    javascript: `function knapsack01(items, capacity) {
  const dp = Array(capacity + 1).fill(0);

  for (const { weight, value } of items) {
    for (let c = capacity; c >= weight; c--) {
      dp[c] = Math.max(dp[c], dp[c - weight] + value);
    }
  }

  return dp[capacity];
}`,
    java: `static int knapsack01(int[][] items, int capacity) {
    int[] dp = new int[capacity + 1];

    for (int[] item : items) {
        int weight = item[0];
        int value = item[1];
        for (int c = capacity; c >= weight; c--) {
            dp[c] = Math.max(dp[c], dp[c - weight] + value);
        }
    }
    return dp[capacity];
}`,
    cpp: `int knapsack01(const vector<pair<int, int>>& items, int capacity) {
    vector<int> dp(capacity + 1, 0);

    for (auto [weight, value] : items) {
        for (int c = capacity; c >= weight; --c) {
            dp[c] = max(dp[c], dp[c - weight] + value);
        }
    }
    return dp[capacity];
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "You have a collection of items, each with a weight and a value, plus a bag with limited capacity. The 0/1 rule is strict: each item is either selected once or left behind.",
      },
      {
        type: "pillars",
        items: [
          { title: "State", text: "Best value after considering the first i items at capacity c.", icon: "Grid2x2" },
          { title: "Choice", text: "Skip the item or take it if its weight fits.", icon: "GitFork" },
          { title: "Reuse", text: "Each cell builds on a smaller solved capacity.", icon: "Repeat" },
        ],
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Start with zero value", text: "A capacity of zero, or no available items, can hold nothing." },
          { title: "Evaluate both choices", text: "For each item and capacity, compare skipping it with taking its value plus the best remaining capacity." },
          { title: "Keep the better choice", text: "The larger of those two values becomes the current DP cell." },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "Why the direction matters",
        text: "A one-dimensional implementation scans capacities from right to left. That prevents the same item from being reused in the same pass, preserving the 0/1 constraint.",
      },
    ],
    walkthrough: [
      {
        type: "stages",
        caption: "Each row adds one more item to the choices available.",
        rows: [
          { label: "No items", groups: [[0, 0, 0, 0, 0]], tone: "violet" },
          { label: "Camera", groups: [[0, 0, 0, 0, 8]], tone: "brand" },
          { label: "Camera + Tent", groups: [[0, 0, 0, 0, 8, 10, 10, 10, 18]], tone: "mint" },
        ],
      },
      {
        type: "result",
        values: [8, 10, 14, 18, 24],
        caption: "Best value grows as the table discovers profitable combinations.",
      },
    ],
    complexity: [
      {
        type: "table",
        head: ["Measure", "Complexity", "Why"],
        rows: [
          ["Time", "O(nC)", "Every item is compared at every capacity."],
          ["Space", "O(nC)", "The full table stores one row per item and capacity."],
          ["Optimised space", "O(C)", "A right-to-left pass can keep only one row."],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Pseudo-polynomial time",
        text: "C is the numeric capacity, not the number of bits used to write it. A very large capacity can still make the table expensive even when n is small.",
      },
    ],
  },
  quiz: [
    {
      id: "knapsack-1",
      prompt: "What does the 0/1 rule mean?",
      options: ["Every item can be used any number of times", "Each item is either taken once or skipped", "Only zero-value items can be selected", "The capacity must be zero or one"],
      answer: 1,
      explanation: "The 0/1 constraint allows one copy of each item at most.",
    },
    {
      id: "knapsack-2",
      prompt: "What does a DP cell represent?",
      options: ["The number of items left", "The weight of the current item", "The best value for a given prefix of items and capacity", "The number of recursive calls"],
      answer: 2,
      explanation: "A cell stores the best value achievable using the items considered so far at that capacity.",
    },
    {
      id: "knapsack-3",
      prompt: "Why does the one-dimensional solution scan capacity downward?",
      options: ["To sort the items", "To avoid selecting the same item twice", "To make values negative", "To find the smallest capacity first"],
      answer: 1,
      explanation: "Right-to-left updates ensure the current item cannot read a cell it already changed in the same pass.",
    },
  ],
  generate,
};
