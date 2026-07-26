import type { Progress } from "./store/schema";
import { TOTAL_LESSONS } from "./learning-path";

export interface Achievement {
  id: string;
  title: string;
  requirement: string;
  icon: string;
  tone: "brand" | "violet" | "mint" | "amber";
  earned: (p: Progress) => boolean;
  progress: (p: Progress) => { current: number; target: number };
}

const quizCount = (p: Progress) => Object.keys(p.quiz).length;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    requirement: "Explore 5 algorithms",
    icon: "Flag",
    tone: "brand",
    earned: (p) => p.explored.length >= 5,
    progress: (p) => ({ current: Math.min(p.explored.length, 5), target: 5 }),
  },
  {
    id: "problem-solver",
    title: "Problem Solver",
    requirement: "Complete 5 quiz sets",
    icon: "Brain",
    tone: "mint",
    earned: (p) => quizCount(p) >= 5,
    progress: (p) => ({ current: Math.min(quizCount(p), 5), target: 5 }),
  },
  {
    id: "consistency",
    title: "Consistency",
    requirement: "7 day streak",
    icon: "Flame",
    tone: "violet",
    earned: (p) => p.streak >= 7,
    progress: (p) => ({ current: Math.min(p.streak, 7), target: 7 }),
  },
  {
    id: "graph-explorer",
    title: "Graph Explorer",
    requirement: "Finish all 4 graph algorithms",
    icon: "Share2",
    tone: "brand",
    earned: (p) =>
      ["breadth-first-search", "depth-first-search", "dijkstra", "topological-sort"].every((s) =>
        p.completed.includes(s),
      ),
    progress: (p) => ({
      current: ["breadth-first-search", "depth-first-search", "dijkstra", "topological-sort"].filter((s) =>
        p.completed.includes(s),
      ).length,
      target: 4,
    }),
  },
  {
    id: "completionist",
    title: "Completionist",
    requirement: `Complete all ${TOTAL_LESSONS} algorithms`,
    icon: "Trophy",
    tone: "amber",
    earned: (p) => p.completed.length >= TOTAL_LESSONS,
    progress: (p) => ({ current: p.completed.length, target: TOTAL_LESSONS }),
  },
];

export function nextGoal(p: Progress) {
  const pending = ACHIEVEMENTS.find((a) => !a.earned(p));
  if (!pending) return null;
  const { current, target } = pending.progress(p);
  return { achievement: pending, current, target };
}
