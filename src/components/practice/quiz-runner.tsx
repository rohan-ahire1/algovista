"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Trophy, X } from "lucide-react";

import type { PracticeQuestion } from "@/lib/practice";
import { useAppStore } from "@/lib/store/app-store";
import { Button, ButtonLink } from "@/components/ui/button-compat";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export function QuizRunner({
  title,
  icon,
  questions,
  onRestart,
  storageSlug,
}: {
  title: string;
  icon: React.ReactNode;
  questions: PracticeQuestion[];
  onRestart?: () => void;
  storageSlug?: string;
}) {
  const { recordQuiz, recordActivity } = useAppStore();
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [finished, setFinished] = React.useState(false);

  // A new question set resets the run. Doing it during render (rather than in an
  // effect) avoids briefly showing the old answers against the new questions.
  const [seenQuestions, setSeenQuestions] = React.useState(questions);
  if (seenQuestions !== questions) {
    setSeenQuestions(questions);
    setIndex(0);
    setAnswers({});
    setFinished(false);
  }

  const question = questions[index];
  const chosen = answers[index];
  const answered = chosen !== undefined;
  const correctCount = Object.entries(answers).filter(([i, a]) => questions[Number(i)]?.answer === a).length;

  const finish = React.useCallback(() => {
    setFinished(true);
    const slug = storageSlug ?? question?.algorithmSlug;
    if (slug) recordQuiz(slug, correctCount, questions.length);
    recordActivity({
      slug: slug ?? "practice",
      title,
      detail: `Practiced · Scored ${correctCount}/${questions.length}`,
    });
  }, [correctCount, question?.algorithmSlug, questions.length, recordActivity, recordQuiz, storageSlug, title]);

  if (!questions.length) {
    return (
      <Card className="px-6 py-16 text-center">
        <p className="font-semibold text-[var(--text)]">No questions available yet</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Pick another algorithm to practise.</p>
      </Card>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <Card className="p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
          <Trophy className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h2 className="mt-5 font-display text-[28px] font-extrabold text-[var(--text)]">
          {correctCount} / {questions.length}
        </h2>
        <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
          {pct >= 80 ? "Strong work — that is a solid grasp." : pct >= 50 ? "Good start. Review the misses below." : "Worth another pass through the explanations."}
        </p>

        <div className="mx-auto mt-7 grid max-w-[620px] gap-2 text-left">
          {questions.map((q, i) => {
            const ok = answers[i] === q.answer;
            return (
              <div
                key={q.id}
                className="flex items-start gap-3 rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white",
                    ok ? "bg-[var(--success)]" : "bg-[var(--danger)]",
                  )}
                >
                  {ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-[var(--text)]">{q.prompt}</p>
                  <p className="mt-0.5 text-[12.5px] text-[var(--text-muted)]">{q.explanation}</p>
                  <Link
                    href={`/algorithms/${q.algorithmSlug}/learn`}
                    className="mt-1 inline-block text-[12.5px] font-semibold text-[var(--primary)]"
                  >
                    Review {q.algorithmName}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {onRestart ? (
            <Button
              onClick={() => {
                onRestart();
                setFinished(false);
                setAnswers({});
                setIndex(0);
              }}
            >
              <RotateCcw className="h-[18px] w-[18px]" />
              New set
            </Button>
          ) : null}
          <ButtonLink href="/learn/path" variant="secondary">
            View Learning Path
          </ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[var(--primary-soft)] text-[var(--primary)]">
            {icon}
          </span>
          <h1 className="text-[20px] font-extrabold tracking-[-0.025em] text-[var(--text)]">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[13.5px] text-[var(--text-muted)]">
            Question {index + 1} of {questions.length}
          </span>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-8 rounded-full transition-colors",
                  i < index || answers[i] !== undefined ? "bg-[var(--primary)]" : "bg-[var(--surface-sunken)]",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <Card className="mt-5 p-6 sm:p-7">
        <p className="text-[19px] font-bold leading-snug tracking-[-0.02em] text-[var(--text)]">{question.prompt}</p>

        {question.givenArray?.length ? (
          <div className="mt-5">
            <p className="text-[13px] text-[var(--text-muted)]">{question.givenLabel ?? "Given Array"}:</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {question.givenArray.map((v, i) => (
                <span
                  key={i}
                  className="inline-flex h-[52px] min-w-[52px] items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3 font-display text-[19px] font-bold tabular-nums text-[var(--text)]"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-6 text-[13.5px] text-[var(--text-muted)]">Choose the correct answer.</p>

        <div className="mt-3 grid gap-2.5">
          {question.options.map((option, i) => {
            const isChosen = chosen === i;
            const isAnswer = question.answer === i;
            const reveal = answered && (isChosen || isAnswer);
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => setAnswers((a) => ({ ...a, [index]: i }))}
                className={cn(
                  "flex items-center gap-3.5 rounded-[var(--radius-field)] border px-4 py-3.5 text-left transition-all duration-200",
                  !answered && "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
                  reveal && isAnswer && "border-[var(--success)] bg-[var(--success-soft)]",
                  reveal && isChosen && !isAnswer && "border-[var(--danger)] bg-[var(--danger-soft)]",
                  answered && !reveal && "border-[var(--border)] opacity-55",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                    reveal && isAnswer
                      ? "border-[var(--success)] bg-[var(--success)] text-white"
                      : reveal && isChosen
                        ? "border-[var(--danger)] bg-[var(--danger)] text-white"
                        : "border-[var(--border-strong)]",
                  )}
                >
                  {reveal && isAnswer ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  {reveal && isChosen && !isAnswer ? <X className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                </span>
                <span className="text-[15px] font-medium text-[var(--text)]">{option}</span>
              </button>
            );
          })}
        </div>

        {answered ? (
          <div
            className={cn(
              "animate-fade-up mt-5 flex items-start gap-3.5 rounded-[var(--radius-field)] border px-4 py-3.5",
              chosen === question.answer
                ? "border-[var(--success)] bg-[var(--success-soft)]"
                : "border-[var(--danger)] bg-[var(--danger-soft)]",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white",
                chosen === question.answer ? "bg-[var(--success)]" : "bg-[var(--danger)]",
              )}
            >
              {chosen === question.answer ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <div>
              <p
                className="text-[14.5px] font-bold"
                style={{ color: chosen === question.answer ? "var(--success)" : "var(--danger)" }}
              >
                {chosen === question.answer ? "Correct!" : "Not quite"}
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{question.explanation}</p>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          <ArrowLeft className="h-4 w-4" />
          Previous Question
        </Button>

        {index === questions.length - 1 ? (
          <Button onClick={finish} disabled={!answered}>
            Finish
            <Check className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={!answered}>
            Next Question
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
