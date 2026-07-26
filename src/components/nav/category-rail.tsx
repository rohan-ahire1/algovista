import Link from "next/link";
import { ALGORITHMS, categoriesWithCounts, categoryLabel } from "@/lib/algorithms";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

/**
 * Shared left rail used by the content pages (code view, learn article).
 * Highlights the category of the algorithm currently being read.
 */
export function CategoryRail({ activeCategory, popular = true }: { activeCategory?: string; popular?: boolean }) {
  const categories = categoriesWithCounts();
  const trending = [...ALGORITHMS].sort((a, b) => b.popularity - a.popularity).slice(0, 3);

  return (
    <aside className="hidden w-[258px] shrink-0 border-r border-[var(--border)] px-4 py-8 lg:block">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">Categories</p>
      <nav className="mt-3 grid gap-0.5">
        <Link
          href="/algorithms"
          className="flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[14px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]"
        >
          <Icon name="Boxes" className="h-[18px] w-[18px]" />
          All Algorithms
        </Link>
        {categories.map((c) => {
          const active = c.id === activeCategory;
          return (
            <Link
              key={c.id}
              href={`/algorithms?category=${c.id}`}
              className={cn(
                "flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                active
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]",
              )}
            >
              <Icon name={c.icon} className="h-[18px] w-[18px]" />
              <span className={cn("flex-1 truncate", c.comingSoon && !active && "opacity-70")}>{c.label}</span>
              {c.comingSoon ? (
                <span className="rounded-full bg-[var(--surface-sunken)] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--text-subtle)]">
                  Soon
                </span>
              ) : (
                <span className="text-[12px] tabular-nums text-[var(--text-subtle)]">{c.count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {popular ? (
        <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]">
          <p className="text-[13.5px] font-bold text-[var(--text)]">Popular Right Now</p>
          <div className="mt-3 grid gap-1">
            {trending.map((a) => (
              <Link
                key={a.slug}
                href={`/algorithms/${a.slug}`}
                className="flex items-center gap-2.5 rounded-[10px] px-2 py-2 transition-colors hover:bg-[var(--surface-sunken)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon name={a.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-[var(--text)]">{a.name}</span>
                  <span className="block text-[11.5px] text-[var(--text-subtle)]">
                    {a.views} views · {categoryLabel(a.category)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
