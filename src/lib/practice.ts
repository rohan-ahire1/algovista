import { ALGORITHMS, getAlgorithm } from "./algorithms";
import type { QuizQuestion } from "./engine/algorithm";
import { buildInput } from "./engine/input";
import { DEFAULT_SETTINGS } from "./store/schema";

export interface PracticeQuestion extends QuizQuestion {
  algorithmSlug: string;
  algorithmName: string;
}

/** Deterministic shuffle — same seed always produces the same paper. */
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = (seed >>> 0) || 1;
  const next = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function withAlgorithm(slug: string): PracticeQuestion[] {
  const algorithm = getAlgorithm(slug);
  if (!algorithm) return [];
  return algorithm.quiz.map((q) => ({ ...q, algorithmSlug: algorithm.slug, algorithmName: algorithm.name }));
}

export const ALL_QUESTIONS: PracticeQuestion[] = ALGORITHMS.flatMap((a) => withAlgorithm(a.slug));

export function buildQuickQuiz(seed: number, slug?: string): PracticeQuestion[] {
  const pool = slug ? withAlgorithm(slug) : ALL_QUESTIONS;
  return shuffle(pool, seed).slice(0, Math.min(5, pool.length));
}

export function buildDrill(slug: string): PracticeQuestion[] {
  return withAlgorithm(slug);
}

export function buildMockExam(seed: number): PracticeQuestion[] {
  return shuffle(ALL_QUESTIONS, seed).slice(0, Math.min(15, ALL_QUESTIONS.length));
}

/**
 * Challenges are generated from the visualizer itself: we take a real frame from
 * a real run and ask which step comes next. The distractors are other genuine
 * steps of the same algorithm, so guessing by "which one sounds plausible"
 * does not work.
 */
export function buildChallenges(seed: number, count = 5): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  const algorithms = shuffle(ALGORITHMS, seed);

  for (const algorithm of algorithms) {
    if (questions.length >= count) break;

    const frames = algorithm.generate(buildInput(algorithm, { ...DEFAULT_SETTINGS, arraySize: 7, seed: 11 }));
    if (frames.length < 6) continue;

    const titles = Array.from(new Set(frames.map((f) => f.title)));
    if (titles.length < 4) continue;

    const at = 1 + Math.floor(((seed % 97) / 97) * (frames.length - 3));
    const current = frames[at];
    const answerTitle = frames[at + 1].title;
    const distractors = shuffle(
      titles.filter((t) => t !== answerTitle && t !== current.title),
      seed + at,
    ).slice(0, 3);

    if (distractors.length < 3) continue;

    const options = shuffle([answerTitle, ...distractors], seed + at + 1);
    const values = current.view.kind === "array" ? current.view.values : undefined;

    questions.push({
      id: `challenge-${algorithm.slug}-${at}`,
      algorithmSlug: algorithm.slug,
      algorithmName: algorithm.name,
      prompt: `${algorithm.name} is at step ${at + 1}: “${current.title}”. What happens next?`,
      givenLabel: values ? "Array at this step" : undefined,
      givenArray: values,
      options,
      answer: options.indexOf(answerTitle),
      explanation: frames[at + 1].detail,
    });
  }

  return questions;
}

export const PRACTICE_SECTIONS = [
  { id: "quiz", label: "Quick Quiz", icon: "Target" },
  { id: "drills", label: "Algorithm Drills", icon: "Code2" },
  { id: "challenges", label: "Challenges", icon: "Flag" },
  { id: "exams", label: "Mock Exams", icon: "FileText" },
  { id: "submissions", label: "My Submissions", icon: "History" },
  { id: "leaderboard", label: "Leaderboard", icon: "Trophy" },
] as const;

export type PracticeSection = (typeof PRACTICE_SECTIONS)[number]["id"];
