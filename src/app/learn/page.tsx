import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, Compass, GraduationCap } from "lucide-react";

import { ALGORITHMS, CATEGORIES, inCategory } from "@/lib/algorithms";
import { MODULES, TOTAL_LESSONS } from "@/lib/learning-path";
import { Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Learn",
  description: "Read the theory behind every algorithm, then watch it run.",
};

export default function LearnHubPage() {
  const primaryCategories = CATEGORIES.filter((c) => ALGORITHMS.some((a) => a.category === c.id));

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--primary)] shadow-[var(--shadow-xs)]">
            <GraduationCap className="h-4 w-4" />
            Theory, then practice
          </span>
          <h1 className="mt-5 text-[clamp(2rem,4vw,2.6rem)] font-extrabold tracking-[-0.035em] text-[var(--text)]">
            Learn
          </h1>
          <p className="mt-2 max-w-[46rem] text-[15.5px] leading-relaxed text-[var(--text-muted)]">
            Every algorithm has a written explanation with a worked example and a complexity breakdown. Read it, then
            step through the same algorithm in the visualizer.
          </p>
        </div>

        <ButtonLink href="/learn/path" size="lg">
          <Compass className="h-[18px] w-[18px]" />
          Follow the learning path
        </ButtonLink>
      </div>

      <Card className="mt-8 flex flex-wrap items-center gap-6 bg-[var(--primary-soft)] p-6">
        <div className="min-w-[240px] flex-1">
          <p className="text-[17px] font-bold text-[var(--text)]">A structured route through all {TOTAL_LESSONS} algorithms</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--text-muted)]">
            {MODULES.length} modules, ordered so each one builds on the last — from quadratic sorts through divide and
            conquer to greedy shortest paths.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {MODULES.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-2 rounded-[11px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[13px] font-semibold text-[var(--text)]"
            >
              <Icon name={m.icon} className="h-4 w-4 text-[var(--primary)]" />
              {m.title}
            </span>
          ))}
        </div>
      </Card>

      <div className="mt-10 grid gap-8">
        {primaryCategories.map((category) => {
          const items = ALGORITHMS.filter((a) => inCategory(a, category.id) && a.category === category.id);
          return (
            <section key={category.id}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2.5 text-[18px] font-bold text-[var(--text)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
                    <Icon name={category.icon} className="h-[18px] w-[18px]" />
                  </span>
                  {category.label}
                </h2>
                <Link
                  href={`/algorithms?category=${category.id}`}
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--primary)]"
                >
                  Browse <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/algorithms/${a.slug}/learn`}
                    className="group flex flex-col rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] transition-all duration-200 ease-[var(--ease-out-quint)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[var(--primary-soft)] text-[var(--primary)]">
                        <Icon name={a.icon} className="h-5 w-5" />
                      </span>
                      <span className="text-[15.5px] font-bold text-[var(--text)]">{a.name}</span>
                    </div>
                    <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{a.tagline}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
                      <BookOpen className="h-4 w-4" />
                      Read the explanation
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
