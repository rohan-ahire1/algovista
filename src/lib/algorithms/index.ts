import type { Algorithm, CategoryId } from "../engine/algorithm";
import { CATEGORIES } from "../engine/algorithm";

import { binarySearch } from "./binary-search";
import { breadthFirstSearch } from "./breadth-first-search";
import { bubbleSort } from "./bubble-sort";
import { depthFirstSearch } from "./depth-first-search";
import { dijkstra } from "./dijkstra";
import { fibonacciRecursion } from "./fibonacci-recursion";
import { insertionSort } from "./insertion-sort";
import { linearSearch } from "./linear-search";
import { mergeSort } from "./merge-sort";
import { quickSort } from "./quick-sort";
import { selectionSort } from "./selection-sort";
import { topologicalSort } from "./topological-sort";

export const ALGORITHMS: Algorithm[] = [
  bubbleSort,
  mergeSort,
  binarySearch,
  depthFirstSearch,
  breadthFirstSearch,
  dijkstra,
  fibonacciRecursion,
  quickSort,
  topologicalSort,
  insertionSort,
  selectionSort,
  linearSearch,
];

export const ALGORITHM_MAP: Record<string, Algorithm> = Object.fromEntries(
  ALGORITHMS.map((a) => [a.slug, a]),
);

export function getAlgorithm(slug: string): Algorithm | undefined {
  return ALGORITHM_MAP[slug];
}

export function inCategory(algorithm: Algorithm, category: CategoryId) {
  return algorithm.category === category || (algorithm.alsoIn ?? []).includes(category);
}

export function categoriesWithCounts() {
  return CATEGORIES.map((c) => ({
    ...c,
    count: ALGORITHMS.filter((a) => inCategory(a, c.id)).length,
  }));
}

export function relatedTo(slug: string) {
  const algorithm = getAlgorithm(slug);
  if (!algorithm) return [];
  return algorithm.related.map((s) => getAlgorithm(s)).filter((a): a is Algorithm => Boolean(a));
}

export function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function searchAlgorithms(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALGORITHMS.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      categoryLabel(a.category).toLowerCase().includes(q),
  ).slice(0, 8);
}

export { CATEGORIES };
