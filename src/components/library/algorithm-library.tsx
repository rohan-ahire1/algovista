"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LayoutGrid, Lightbulb, SlidersHorizontal } from "lucide-react";

import { ALGORITHMS, categoriesWithCounts, categoryLabel, inCategory } from "@/lib/algorithms";
import type { CategoryId } from "@/lib/engine/algorithm";
import { Badge } from "@/components/ui/primitives";
import { Select } from "@/components/ui/controls";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

type Sort = "popular" | "name" | "difficulty";

const DIFFICULTY_RANK = { Beginner: 0, Intermediate: 1, Advanced: 2 } as const;

const TONE_BY_CATEGORY: Record<string, "brand" | "violet" | "mint" | "amber" | "neutral"> = {
  sorting: "brand",
  searching: "mint",
  graphs: "violet",
  recursion: "amber",
  "divide-conquer": "brand",
  greedy: "violet",
};

export function AlgorithmLibrary({ initialCategory }: { initialCategory?: string }) {
  const router = useRouter();
  const categories = React.useMemo(() => categoriesWithCounts(), []);
  const [category, setCategory] = React.useState<CategoryId | "all">(
    (categories.find((c) => c.id === initialCategory)?.id as CategoryId) ?? "all",
  );
  const [sort, setSort] = React.useState<Sort>("popular");
  const [difficulty, setDifficulty] = React.useState<string>("all");

  const visible = React.useMemo(() => {
    let list = ALGORITHMS.filter((a) => (category === "all" ? true : inCategory(a, category)));
    if (difficulty !== "all") list = list.filter((a) => a.difficulty === difficulty);

    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "difficulty") return DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
      return b.popularity - a.popularity;
    });
  }, [category, sort, difficulty]);

  const select = (id: CategoryId | "all") => {
    setCategory(id);
    router.replace(id === "all" ? "/algorithms" : `/algorithms?category=${id}`, { scroll: false });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1680px] gap-0 px-0">
      {/* sidebar */}
      <aside className="hidden w-[268px] shrink-0 border-r border-[var(--border)] px-5 py-8 lg:block">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">Categories</p>
        <nav className="mt-3 grid gap-0.5">
          <SidebarItem
            icon="Boxes"
            label="All Algorithms"
            count={ALGORITHMS.length}
            active={category === "all"}
            onClick={() => select("all")}
          />
          {categories.map((c) => (
            <SidebarItem
              key={c.id}
              icon={c.icon}
              label={c.label}
              count={c.count}
              active={category === c.id}
              onClick={() => select(c.id)}
            />
          ))}
        </nav>

        <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <Lightbulb className="h-5 w-5 text-[var(--warning)]" strokeWidth={1.9} />
          <p className="mt-2.5 text-[13.5px] font-semibold text-[var(--text)]">Not sure where to start?</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
            Follow the learning path — it orders every algorithm from fundamentals upward.
          </p>
          <Link href="/learn/path" className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--primary)]">
            View learning path <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* main */}
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(1.8rem,3.2vw,2.3rem)] font-extrabold tracking-[-0.03em] text-[var(--text)]">
              {category === "all" ? "All Algorithms" : categoryLabel(category)}
            </h1>
            <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">Choose an algorithm to visualize and learn.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface)] px-3 shadow-[var(--shadow-xs)]">
              <SlidersHorizontal className="h-4 w-4 text-[var(--text-subtle)]" />
              <select
                aria-label="Filter by difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="h-11 cursor-pointer appearance-none bg-transparent pr-1 text-sm font-medium text-[var(--text)] outline-none"
              >
                <option value="all">All levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <Select
              aria-label="Sort algorithms"
              value={sort}
              onChange={(v) => setSort(v as Sort)}
              options={[
                { value: "popular", label: "Sort by: Popular" },
                { value: "name", label: "Sort by: Name" },
                { value: "difficulty", label: "Sort by: Difficulty" },
              ]}
              className="w-[190px]"
            />
          </div>
        </div>

        {/* mobile category chips */}
        <div className="av-scroll mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          <Chip label="All" active={category === "all"} onClick={() => select("all")} />
          {categories.map((c) => (
            <Chip key={c.id} label={c.label} active={category === c.id} onClick={() => select(c.id)} />
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((a, i) => (
            <Link
              key={a.slug}
              href={`/algorithms/${a.slug}`}
              className="group animate-fade-up flex items-start gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] transition-all duration-200 ease-[var(--ease-out-quint)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
              style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
            >
              <span
                className={cn(
                  "flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[14px] transition-transform duration-200 group-hover:scale-105",
                  TONE_BY_CATEGORY[a.category] === "mint"
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : TONE_BY_CATEGORY[a.category] === "violet"
                      ? "bg-[var(--violet-soft)] text-[var(--violet)]"
                      : TONE_BY_CATEGORY[a.category] === "amber"
                        ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                        : "bg-[var(--primary-soft)] text-[var(--primary)]",
                )}
              >
                <Icon name={a.icon} className="h-7 w-7" strokeWidth={1.7} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[17px] font-bold tracking-[-0.02em] text-[var(--text)]">{a.name}</span>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--text-subtle)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
                </span>
                <span className="mt-1 block text-[13.5px] leading-relaxed text-[var(--text-muted)]">{a.tagline}</span>
                <span className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge tone={TONE_BY_CATEGORY[a.category] ?? "brand"}>{categoryLabel(a.category)}</Badge>
                  <Badge tone="neutral">{a.difficulty}</Badge>
                </span>
              </span>
            </Link>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] px-6 py-16 text-center">
            <LayoutGrid className="mx-auto h-6 w-6 text-[var(--text-subtle)]" />
            <p className="mt-3 font-semibold text-[var(--text)]">Nothing matches these filters</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Try a different difficulty or category.</p>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-[var(--border)] pt-8 text-[14px]">
          <Lightbulb className="h-[18px] w-[18px] text-[var(--warning)]" />
          <span className="text-[var(--text-muted)]">Can&apos;t find what you&apos;re looking for?</span>
          <Link href="/about#roadmap" className="inline-flex items-center gap-1.5 font-semibold text-[var(--primary)]">
            Request an algorithm <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-left text-[14px] font-medium transition-colors",
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]",
      )}
    >
      <Icon name={icon} className="h-[18px] w-[18px]" />
      <span className="flex-1 truncate">{label}</span>
      <span className={cn("text-[12px] tabular-nums", active ? "text-[var(--primary)]" : "text-[var(--text-subtle)]")}>
        {count}
      </span>
    </button>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "border-transparent bg-[var(--primary)] text-[var(--on-primary)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]",
      )}
    >
      {label}
    </button>
  );
}
