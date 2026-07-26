import type { AlgoInput, Frame, InputKind, LegendItem, MetricSpec } from "./types";

export const LANGUAGES = [
  { id: "pseudocode", label: "Pseudocode", shiki: "text" },
  { id: "python", label: "Python", shiki: "python" },
  { id: "javascript", label: "JavaScript", shiki: "javascript" },
  { id: "java", label: "Java", shiki: "java" },
  { id: "cpp", label: "C++", shiki: "cpp" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const CATEGORIES = [
  { id: "sorting", label: "Sorting", icon: "BarChart3" },
  { id: "searching", label: "Searching", icon: "Search" },
  { id: "graphs", label: "Graphs", icon: "Share2" },
  { id: "recursion", label: "Recursion", icon: "Repeat" },
  { id: "divide-conquer", label: "Divide & Conquer", icon: "GitFork" },
  { id: "greedy", label: "Greedy", icon: "Target" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

/* ----------------------------- Article model ---------------------------- */

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "pillars"; items: { title: string; text: string; icon: string }[] }
  | { type: "callout"; tone: "insight" | "warning" | "success"; title: string; text: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "stages"; caption?: string; rows: { label: string; groups: number[][]; tone?: "brand" | "violet" | "mint" }[] }
  | { type: "result"; values: number[]; caption: string };

export interface Article {
  overview: ArticleBlock[];
  howItWorks: ArticleBlock[];
  walkthrough: ArticleBlock[];
  complexity: ArticleBlock[];
}

/* ------------------------------ Quiz model ------------------------------ */

export interface QuizQuestion {
  id: string;
  prompt: string;
  givenArray?: number[];
  givenLabel?: string;
  options: string[];
  answer: number;
  explanation: string;
}

/* --------------------------- Algorithm record --------------------------- */

export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: boolean | null;
  inPlace: boolean | null;
}

export interface Algorithm {
  slug: string;
  name: string;
  category: CategoryId;
  /** Secondary categories — an algorithm shows up under each of these too. */
  alsoIn?: CategoryId[];
  tagline: string;
  summary: string;
  icon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  popularity: number;
  views: string;
  complexity: Complexity;
  steps: string[];
  bestUsedWhen: string[];
  keyInsight: string;
  related: string[];
  inputKind: InputKind;
  defaultInput?: Partial<AlgoInput>;
  metrics: MetricSpec[];
  legend: LegendItem[];
  code: Record<LanguageId, string>;
  article: Article;
  quiz: QuizQuestion[];
  generate: (input: AlgoInput) => Frame[];
}
