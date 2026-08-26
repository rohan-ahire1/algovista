"use client";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  Flag,
  History,
  Info,
  Target,
  Trophy,
} from "lucide-react";

import { ALGORITHMS, getAlgorithm } from "@/lib/algorithms";
import { PRACTICE_SECTIONS, buildChallenges, buildDrill, buildMockExam, buildQuickQuiz, type PracticeSection } from "@/lib/practice";
import { TOTAL_LESSONS } from "@/lib/learning-path";
import { useAppStore } from "@/lib/store/app-store";
import { Card, Progress as Bar } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/button-compat";
import { Icon } from "@/components/icon";
import { QuizRunner } from "./quiz-runner";
import { cn } from "@/lib/cn";

const SECTION_ICON: Record<PracticeSection, React.ElementType> = {
  quiz: Target,
  drills: Code2,
  challenges: Flag,
  exams: FileText,
  submissions: History,
  leaderboard: Trophy,
};

const TIERS = [
  { name: "Bronze", need: 3, tone: "amber" as const },
  { name: "Silver", need: 6, tone: "neutral" as const },
  { name: "Gold", need: 9, tone: "brand" as const },
  { name: "Platinum", need: TOTAL_LESSONS, tone: "violet" as const },
];

export function PracticeScreen({ initialAlgorithm }: { initialAlgorithm?: string }) {
  const { progress } = useAppStore();
  const [section, setSection] = React.useState<PracticeSection>("quiz");
  const [seed, setSeed] = React.useState(31);
  const [drillSlug, setDrillSlug] = React.useState<string | null>(initialAlgorithm ?? null);

  const quickQuiz = React.useMemo(() => buildQuickQuiz(seed, initialAlgorithm), [seed, initialAlgorithm]);
  const challenges = React.useMemo(() => buildChallenges(seed), [seed]);
  const exam = React.useMemo(() => buildMockExam(seed), [seed]);
  const drill = React.useMemo(() => (drillSlug ? buildDrill(drillSlug) : []), [drillSlug]);

  return (
    <div className="mx-auto flex w-full max-w-[1680px]">
      <aside className="hidden w-[268px] shrink-0 border-r border-[var(--border)] px-4 py-8 lg:block">
        <div className="flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-[var(--text-muted)]">
            <ChevronLeft className="h-4 w-4" />
          </span>
          <p className="text-[15px] font-bold text-[var(--text)]">Practice</p>
        </div>

        <nav className="mt-5 grid gap-0.5">
          {PRACTICE_SECTIONS.map((s) => {
            const SectionIcon = SECTION_ICON[s.id];
            const active = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-left text-[14px] font-medium transition-colors",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]",
                )}
              >
                <SectionIcon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                {s.label}
              </button>
            );
          })}
        </nav>

        <Card className="mt-8 bg-[var(--primary-soft)] p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--surface)] text-[var(--primary)]">
            <Target className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <p className="mt-3.5 text-[15px] font-bold text-[var(--primary)]">Keep Practicing!</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
            Consistent practice builds strong problem-solving skills.
          </p>
          <Link href="/learn/path" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
            View Learning Path <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </aside>

      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        {/* mobile section switcher */}
        <div className="av-scroll mb-6 flex gap-2 overflow-x-auto lg:hidden">
          {PRACTICE_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                section === s.id
                  ? "border-transparent bg-[var(--primary)] text-[var(--on-primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {section === "quiz" ? (
          <QuizRunner
            title="Quick Quiz"
            icon={<FileText className="h-5 w-5" />}
            questions={quickQuiz}
            onRestart={() => setSeed((s) => s + 7)}
          />
        ) : null}

        {section === "challenges" ? (
          <>
            <p className="mb-5 flex items-start gap-2.5 rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13.5px] text-[var(--text-muted)]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
              Every challenge is generated from a real run of the visualizer — you are predicting the actual next step.
            </p>
            <QuizRunner
              title="Challenges"
              icon={<Flag className="h-5 w-5" />}
              questions={challenges}
              onRestart={() => setSeed((s) => s + 13)}
              storageSlug="challenges"
            />
          </>
        ) : null}

        {section === "exams" ? (
          <>
            <p className="mb-5 flex items-start gap-2.5 rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13.5px] text-[var(--text-muted)]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
              {exam.length} questions drawn from every algorithm in the library.
            </p>
            <QuizRunner
              title="Mock Exam"
              icon={<FileText className="h-5 w-5" />}
              questions={exam}
              onRestart={() => setSeed((s) => s + 3)}
              storageSlug="mock-exam"
            />
          </>
        ) : null}

        {section === "drills" ? (
          drillSlug ? (
            <div>
              <Button variant="secondary" size="sm" className="mb-5" onClick={() => setDrillSlug(null)}>
                <ChevronLeft className="h-4 w-4" />
                All drills
              </Button>
              <QuizRunner
                title={`${getAlgorithm(drillSlug)?.name ?? "Drill"} drill`}
                icon={<Code2 className="h-5 w-5" />}
                questions={drill}
                storageSlug={drillSlug}
              />
            </div>
          ) : (
            <div>
              <h1 className="text-[22px] font-extrabold tracking-[-0.025em] text-[var(--text)]">Algorithm Drills</h1>
              <p className="mt-1.5 text-[14.5px] text-[var(--text-muted)]">
                Focused question sets, one algorithm at a time.
              </p>
              <div className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {ALGORITHMS.map((a) => {
                  const score = progress.quiz[a.slug];
                  return (
                    <button
                      key={a.slug}
                      type="button"
                      onClick={() => setDrillSlug(a.slug)}
                      className="group flex items-center gap-3.5 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] text-[var(--primary)]">
                        <Icon name={a.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-bold text-[var(--text)]">{a.name}</span>
                        <span className="block text-[12.5px] text-[var(--text-muted)]">
                          {a.quiz.length} questions
                          {score ? ` · best ${score.correct}/${score.total}` : ""}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-subtle)] transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          )
        ) : null}

        {section === "submissions" ? <Submissions /> : null}
        {section === "leaderboard" ? <Leaderboard /> : null}
      </div>
    </div>
  );
}

function Submissions() {
  const { progress } = useAppStore();
  const entries = Object.entries(progress.quiz);

  return (
    <div>
      <h1 className="text-[22px] font-extrabold tracking-[-0.025em] text-[var(--text)]">My Submissions</h1>
      <p className="mt-1.5 text-[14.5px] text-[var(--text-muted)]">
        Your best score for each set. Stored in this browser only.
      </p>

      {entries.length ? (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)]">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[var(--surface-sunken)]">
              <tr>
                {["Set", "Best score", "Accuracy", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(([slug, score]) => {
                const algorithm = getAlgorithm(slug);
                const pct = Math.round((score.correct / score.total) * 100);
                return (
                  <tr key={slug} className="border-t border-[var(--border)] bg-[var(--surface)]">
                    <td className="px-4 py-3.5 text-[14px] font-semibold text-[var(--text)]">
                      {algorithm?.name ?? slug.replace(/-/g, " ")}
                    </td>
                    <td className="px-4 py-3.5 text-[14px] tabular-nums text-[var(--text-muted)]">
                      {score.correct} / {score.total}
                    </td>
                    <td className="w-[220px] px-4 py-3.5">
                      <Bar value={pct} tone={pct >= 80 ? "mint" : "brand"} />
                      <span className="mt-1.5 block text-[12px] text-[var(--text-muted)]">{pct}%</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {algorithm ? (
                        <Link href={`/algorithms/${slug}/learn`} className="text-[13px] font-semibold text-[var(--primary)]">
                          Review
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="mt-6 px-6 py-14 text-center">
          <History className="mx-auto h-6 w-6 text-[var(--text-subtle)]" />
          <p className="mt-3 font-semibold text-[var(--text)]">No submissions yet</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Finish a quiz and your best score will appear here.</p>
        </Card>
      )}
    </div>
  );
}

function Leaderboard() {
  const { progress } = useAppStore();
  const mastered = progress.completed.length;

  return (
    <div>
      <h1 className="text-[22px] font-extrabold tracking-[-0.025em] text-[var(--text)]">Leaderboard</h1>
      <p className="mt-1.5 max-w-[60ch] text-[14.5px] leading-relaxed text-[var(--text-muted)]">
        AlgoVista has no accounts yet, so there is nobody to rank you against. Instead, here is your standing against
        the tiers — climb them by completing algorithms end to end in the visualizer.
      </p>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[var(--primary-soft)] text-[var(--primary)]">
            <Award className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <div className="min-w-[200px] flex-1">
            <p className="font-display text-[24px] font-extrabold text-[var(--text)]">
              {mastered} <span className="text-[16px] font-semibold text-[var(--text-muted)]">of {TOTAL_LESSONS} completed</span>
            </p>
            <Bar value={(mastered / TOTAL_LESSONS) * 100} className="mt-3" />
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {TIERS.map((t) => {
            const reached = mastered >= t.need;
            return (
              <div
                key={t.name}
                className={cn(
                  "rounded-[var(--radius-field)] border px-4 py-4 transition-colors",
                  reached ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-[var(--surface-2)]",
                )}
              >
                <Trophy
                  className={cn("h-5 w-5", reached ? "text-[var(--primary)]" : "text-[var(--text-subtle)]")}
                  strokeWidth={1.9}
                />
                <p className={cn("mt-2.5 text-[15px] font-bold", reached ? "text-[var(--primary)]" : "text-[var(--text)]")}>
                  {t.name}
                </p>
                <p className="mt-0.5 text-[12.5px] text-[var(--text-muted)]">
                  {reached ? "Unlocked" : `${t.need - mastered} more to unlock`}
                </p>
              </div>
            );
          })}
        </div>

        <ButtonLink href="/algorithms" className="mt-7">
          Complete another algorithm
          <ChevronRight className="h-4 w-4" />
        </ButtonLink>
      </Card>
    </div>
  );
}
