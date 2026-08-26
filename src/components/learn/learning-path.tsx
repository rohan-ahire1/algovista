"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Check, ChevronLeft, ChevronRight, Clock, Flame, Map } from "lucide-react";

import { MODULES, TOTAL_LESSONS, completedModules, moduleLessons, moduleProgress } from "@/lib/learning-path";
import { useAppStore } from "@/lib/store/app-store";
import { Card, Progress as Bar } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button-compat";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

const TONE_CLASS = {
  brand: "bg-[var(--primary-soft)] text-[var(--primary)]",
  violet: "bg-[var(--violet-soft)] text-[var(--violet)]",
  mint: "bg-[var(--success-soft)] text-[var(--success)]",
  amber: "bg-[var(--warning-soft)] text-[var(--warning)]",
} as const;

export function LearningPath() {
  const { progress } = useAppStore();
  const [open, setOpen] = React.useState<string | null>(null);

  const lessonsDone = progress.completed.length;
  const modulesDone = completedModules(progress);

  const stats = [
    { icon: BookOpen, label: "Algorithms Completed", value: `${lessonsDone} / ${TOTAL_LESSONS}` },
    { icon: Clock, label: "Minutes Spent", value: `${progress.minutes}` },
    { icon: Flame, label: "Current Streak", value: `${progress.streak} day${progress.streak === 1 ? "" : "s"}`, warm: true },
  ];

  return (
    <div className="mx-auto w-full max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Learn
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(2rem,4vw,2.6rem)] font-extrabold tracking-[-0.035em] text-[var(--text)]">
            Your Learning Path
          </h1>
          <p className="mt-2 text-[15px] text-[var(--text-muted)]">
            A structured journey to master algorithms and problem solving.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className="flex items-center gap-3 px-4 py-3.5">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px]",
                  s.warm ? "bg-[var(--warning-soft)] text-[var(--warning)]" : "bg-[var(--primary-soft)] text-[var(--primary)]",
                )}
              >
                <s.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] text-[var(--text-muted)]">{s.label}</span>
                <span className="block font-display text-[17px] font-extrabold text-[var(--text)]">{s.value}</span>
              </span>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-9 grid gap-4">
        {MODULES.map((module, i) => {
          const p = moduleProgress(module, progress);
          const lessons = moduleLessons(module);
          const expanded = open === module.id;
          const isLast = i === MODULES.length - 1;

          return (
            <div key={module.id} className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-4">
              {/* timeline */}
              <div className="relative flex justify-center">
                <span
                  className={cn(
                    "z-10 mt-6 flex h-8 w-8 items-center justify-center rounded-full border-[3px] bg-[var(--surface)]",
                    p.status === "completed"
                      ? "border-[var(--success)] bg-[var(--success)]"
                      : p.status === "in-progress"
                        ? "border-[var(--primary)]"
                        : "border-[var(--border-strong)]",
                  )}
                >
                  {p.status === "completed" ? (
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  ) : p.status === "in-progress" ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                  ) : null}
                </span>
                {!isLast ? (
                  <span
                    className={cn(
                      "absolute left-1/2 top-[52px] h-[calc(100%-36px)] w-[3px] -translate-x-1/2 rounded-full",
                      p.status === "completed" ? "bg-[var(--success)]" : "bg-[var(--border-strong)]",
                    )}
                  />
                ) : null}
              </div>

              <Card className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : module.id)}
                  aria-expanded={expanded}
                  className="flex w-full flex-wrap items-center gap-5 p-5 text-left"
                >
                  <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px]", TONE_CLASS[module.tone])}>
                    <Icon name={module.icon} className="h-[22px] w-[22px]" />
                  </span>

                  <span className="min-w-[200px] flex-1">
                    <span className="block text-[16px] font-bold text-[var(--text)]">
                      {i + 1}. {module.title}
                    </span>
                    <span className="mt-1 block max-w-[42ch] text-[13.5px] leading-relaxed text-[var(--text-muted)]">
                      {module.description}
                    </span>
                  </span>

                  <span className="w-full min-w-[180px] max-w-[260px] sm:w-auto sm:flex-1">
                    <Bar value={p.percent} tone={p.status === "completed" ? "mint" : "brand"} />
                    <span className="mt-2 block text-[12.5px] text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--text)]">
                        {p.done} / {p.total}
                      </span>{" "}
                      algorithms
                    </span>
                  </span>

                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[13px] font-semibold",
                      p.status === "completed"
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : p.status === "in-progress"
                          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "bg-[var(--surface-sunken)] text-[var(--text-subtle)]",
                    )}
                  >
                    {p.status === "completed" ? (
                      <>
                        <Check className="h-4 w-4" /> Completed
                      </>
                    ) : p.status === "in-progress" ? (
                      "In Progress"
                    ) : (
                      "Not Started"
                    )}
                  </span>
                </button>

                {expanded ? (
                  <div className="animate-fade-up border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <div className="grid gap-1.5">
                      {lessons.map((lesson) => {
                        const done = progress.completed.includes(lesson!.slug);
                        const started = progress.explored.includes(lesson!.slug);
                        return (
                          <Link
                            key={lesson!.slug}
                            href={`/visualize/${lesson!.slug}`}
                            className="group flex items-center gap-3 rounded-[11px] bg-[var(--surface)] px-3.5 py-3 transition-colors hover:bg-[var(--surface-sunken)]"
                          >
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                                done
                                  ? "bg-[var(--success)] text-white"
                                  : started
                                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                                    : "bg-[var(--surface-sunken)] text-[var(--text-subtle)]",
                              )}
                            >
                              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : "•"}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-semibold text-[var(--text)]">
                                {lesson!.name}
                              </span>
                              <span className="block truncate text-[12.5px] text-[var(--text-muted)]">
                                {lesson!.tagline}
                              </span>
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-subtle)] transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </Card>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-center">
        <ButtonLink
          href="/algorithms"
          size="lg"
          className="w-full max-w-[420px]"
        >
          <Map className="h-[18px] w-[18px]" />
          View Full Roadmap
        </ButtonLink>
        <p className="mt-3 text-[13.5px] text-[var(--text-muted)]">
          {modulesDone} of {MODULES.length} modules complete · see all topics and recommended paths
        </p>
      </div>
    </div>
  );
}
