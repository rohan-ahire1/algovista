"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckSquare,
  Clock,
  Compass,
  Flag,
  Flame,
  Pencil,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";

import { ACHIEVEMENTS, nextGoal } from "@/lib/achievements";
import { getAlgorithm } from "@/lib/algorithms";
import { TOTAL_LESSONS } from "@/lib/learning-path";
import { useAppStore } from "@/lib/store/app-store";
import { Card, Progress as Bar } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { cn } from "@/lib/cn";

const BADGE_ICON: Record<string, React.ElementType> = {
  Flag,
  Brain,
  Flame,
  Share2,
  Trophy,
};

const TONE_BG = {
  brand: "from-[var(--primary)] to-[var(--violet)]",
  violet: "from-[var(--violet)] to-[var(--primary)]",
  mint: "from-[var(--success)] to-[var(--primary)]",
  amber: "from-[var(--warning)] to-[var(--danger)]",
} as const;

function timeAgo(at: number) {
  const secs = Math.max(1, Math.round((Date.now() - at) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

export function DashboardScreen() {
  const { progress, setProgress } = useAppStore();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(progress.name);

  const goal = nextGoal(progress);
  const quizzes = Object.keys(progress.quiz).length;

  const stats = [
    { icon: Compass, label: "Algorithms Explored", value: progress.explored.length, note: "Keep exploring!" },
    { icon: CheckSquare, label: "Quiz Sets Completed", value: quizzes, note: quizzes ? "Great job!" : "Try one today" },
    { icon: Flame, label: "Day Streak", value: progress.streak, note: "Keep it going!", warm: true },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      {/* welcome */}
      <Card className="overflow-hidden bg-gradient-to-br from-[var(--primary-soft)] via-[var(--surface)] to-[var(--violet-soft)] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-8">
          <div className="min-w-[260px] flex-1">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--violet)] font-display text-[22px] font-extrabold text-white shadow-[var(--shadow-md)] ring-4 ring-[var(--surface)]">
                {(progress.name || "AV").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="text-[17px] font-semibold text-[var(--text)]">Welcome back,</p>
                {editing ? (
                  <form
                    className="mt-1 flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setProgress((p) => ({ ...p, name: draft.trim().slice(0, 24) || "Explorer" }));
                      setEditing(false);
                    }}
                  >
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      aria-label="Your name"
                      className="h-10 w-[180px] rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[15px] font-semibold text-[var(--text)]"
                    />
                    <Button size="sm" type="submit">
                      Save
                    </Button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(progress.name);
                      setEditing(true);
                    }}
                    className="group mt-0.5 flex items-center gap-2"
                  >
                    <span className="font-display text-[30px] font-extrabold tracking-[-0.03em] text-[var(--primary)]">
                      {progress.name}!
                    </span>
                    <Pencil className="h-4 w-4 text-[var(--text-subtle)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                )}
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--text-muted)]">
                  Keep learning and exploring.
                  <br />
                  You&apos;re making great progress!
                </p>
              </div>
            </div>
          </div>

          <div className="hidden w-[300px] xl:block">
            <div className="scale-[0.62] origin-center">
              <HeroVisual />
            </div>
          </div>

          <div className="grid min-w-[280px] flex-1 gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <Card key={s.label} className="px-4 py-4">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-[11px]",
                    s.warm ? "bg-[var(--warning-soft)] text-[var(--warning)]" : "bg-[var(--primary-soft)] text-[var(--primary)]",
                  )}
                >
                  <s.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <p className="mt-3 font-display text-[30px] font-extrabold leading-none tabular-nums text-[var(--text)]">
                  {s.value}
                </p>
                <p className="mt-1.5 text-[13px] font-medium text-[var(--text)]">{s.label}</p>
                <p className="mt-0.5 text-[12px] text-[var(--text-subtle)]">{s.note}</p>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* recent activity */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 text-[16px] font-bold text-[var(--text)]">
              <Clock className="h-[18px] w-[18px] text-[var(--primary)]" strokeWidth={1.9} />
              Recent Activity
            </h2>
            <Link href="/algorithms" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {progress.activity.length ? (
            <div className="mt-4 grid gap-0.5">
              {progress.activity.map((a) => {
                const algorithm = getAlgorithm(a.slug);
                return (
                  <Link
                    key={`${a.slug}-${a.at}`}
                    href={algorithm ? `/algorithms/${a.slug}` : "/practice"}
                    className="flex items-center gap-3.5 rounded-[11px] px-2 py-3 transition-colors hover:bg-[var(--surface-sunken)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[var(--primary-soft)] text-[var(--primary)]">
                      <Icon name={algorithm?.icon ?? "Target"} className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold text-[var(--text)]">{a.title}</span>
                      <span className="block truncate text-[12.5px] text-[var(--text-muted)]">{a.detail}</span>
                    </span>
                    <span className="shrink-0 text-[12.5px] text-[var(--text-subtle)]">{timeAgo(a.at)}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-[var(--radius-field)] border border-dashed border-[var(--border-strong)] px-5 py-10 text-center">
              <p className="text-[14px] font-semibold text-[var(--text)]">Nothing here yet</p>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                Run a visualization and it will show up in your activity.
              </p>
              <ButtonLink href="/visualize/bubble-sort" size="sm" className="mt-4">
                Start with Bubble Sort
              </ButtonLink>
            </div>
          )}
        </Card>

        {/* achievements */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 text-[16px] font-bold text-[var(--text)]">
              <Trophy className="h-[18px] w-[18px] text-[var(--primary)]" strokeWidth={1.9} />
              Achievements
            </h2>
            <span className="text-[13px] font-semibold text-[var(--text-muted)]">
              {ACHIEVEMENTS.filter((a) => a.earned(progress)).length} / {ACHIEVEMENTS.length}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-5">
            {ACHIEVEMENTS.map((a) => {
              const earned = a.earned(progress);
              const p = a.progress(progress);
              const BadgeIcon = BADGE_ICON[a.icon] ?? Trophy;
              return (
                <div key={a.id} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "flex h-[62px] w-[62px] items-center justify-center transition-all duration-300",
                      earned ? "bg-gradient-to-br text-white shadow-[var(--shadow-md)]" : "bg-[var(--surface-sunken)] text-[var(--text-subtle)]",
                      earned ? TONE_BG[a.tone] : "",
                    )}
                    style={{ clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }}
                  >
                    <BadgeIcon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <p className={cn("mt-2.5 text-[13px] font-bold", earned ? "text-[var(--text)]" : "text-[var(--text-muted)]")}>
                    {a.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-[var(--text-subtle)]">{a.requirement}</p>
                  {!earned ? (
                    <p className="mt-1 text-[11px] font-semibold tabular-nums text-[var(--text-subtle)]">
                      {p.current} / {p.target}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] font-semibold text-[var(--success)]">Earned</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* next goal */}
      <Card className="mt-5 flex flex-wrap items-center gap-6 p-5 sm:p-6">
        <div className="flex min-w-[240px] flex-1 items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] text-[var(--primary)]">
            <Sparkles className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div>
            <p className="text-[16px] font-bold text-[var(--text)]">
              {progress.completed.length ? `Great progress, ${progress.name}!` : `Let's get started, ${progress.name}!`}
            </p>
            <p className="mt-0.5 text-[13.5px] text-[var(--text-muted)]">
              {progress.completed.length} of {TOTAL_LESSONS} algorithms completed end to end.
            </p>
          </div>
        </div>

        {goal ? (
          <div className="min-w-[240px] flex-1">
            <p className="text-[13px] font-semibold text-[var(--text)]">Next Goal</p>
            <p className="mt-0.5 text-[13.5px] text-[var(--text-muted)]">{goal.achievement.requirement}</p>
            <div className="mt-2.5 flex items-center gap-3">
              <Bar value={(goal.current / goal.target) * 100} className="flex-1" />
              <span className="shrink-0 text-[12.5px] font-semibold tabular-nums text-[var(--text-muted)]">
                {goal.current} / {goal.target}
              </span>
            </div>
          </div>
        ) : (
          <p className="flex-1 text-[14px] font-semibold text-[var(--success)]">Every achievement unlocked. Nice.</p>
        )}

        <ButtonLink href="/learn/path" size="lg">
          Continue Learning
          <ArrowRight className="h-[18px] w-[18px]" />
        </ButtonLink>
      </Card>
    </div>
  );
}
