import { getAlgorithm } from "./algorithms";
import type { Progress } from "./store/schema";

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: "brand" | "violet" | "mint" | "amber";
  lessons: string[]; // algorithm slugs
}

/**
 * The path is built from real algorithms rather than abstract "lessons", so a
 * module's progress is exactly how many of its algorithms you have completed
 * in the visualizer.
 */
export const MODULES: Module[] = [
  {
    id: "foundations",
    title: "Sorting Foundations",
    description: "Learn the quadratic sorts that make comparison, swapping and invariants concrete.",
    icon: "BarChart3",
    tone: "mint",
    lessons: ["bubble-sort", "insertion-sort", "selection-sort"],
  },
  {
    id: "divide-conquer",
    title: "Divide & Conquer",
    description: "Split problems in half and combine the answers — the n log n breakthrough.",
    icon: "GitFork",
    tone: "brand",
    lessons: ["merge-sort", "quick-sort"],
  },
  {
    id: "searching",
    title: "Searching Algorithms",
    description: "Learn searching methods and the trade-off between preprocessing and lookup cost.",
    icon: "Search",
    tone: "mint",
    lessons: ["linear-search", "binary-search"],
  },
  {
    id: "graphs",
    title: "Graph Traversal",
    description: "Explore networks breadth-first, depth-first, and in dependency order.",
    icon: "Share2",
    tone: "violet",
    lessons: ["breadth-first-search", "depth-first-search", "topological-sort"],
  },
  {
    id: "advanced",
    title: "Advanced Topics",
    description: "Greedy shortest paths and the recursion trees behind exponential blow-up.",
    icon: "Target",
    tone: "amber",
    lessons: ["dijkstra", "fibonacci-recursion"],
  },
];

export const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);

export type ModuleStatus = "completed" | "in-progress" | "not-started";

export function moduleProgress(module: Module, progress: Progress) {
  const done = module.lessons.filter((slug) => progress.completed.includes(slug)).length;
  const touched = module.lessons.filter((slug) => progress.explored.includes(slug)).length;
  const status: ModuleStatus = done === module.lessons.length ? "completed" : touched > 0 ? "in-progress" : "not-started";
  return { done, total: module.lessons.length, status, percent: (done / module.lessons.length) * 100 };
}

export function moduleLessons(module: Module) {
  return module.lessons.map((slug) => getAlgorithm(slug)).filter(Boolean);
}

export function completedModules(progress: Progress) {
  return MODULES.filter((m) => moduleProgress(m, progress).status === "completed").length;
}
