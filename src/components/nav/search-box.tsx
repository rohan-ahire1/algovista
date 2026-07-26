"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchAlgorithms, categoryLabel } from "@/lib/algorithms";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

export function SearchBox({ className, placeholder = "Search algorithms..." }: { className?: string; placeholder?: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => searchAlgorithms(query), [query]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/algorithms/${slug}`);
  };

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!results.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => (a + 1) % results.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (a - 1 + results.length) % results.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            go(results[active].slug);
          }
        }}
        placeholder={placeholder}
        aria-label="Search algorithms"
        className="h-11 w-full rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface-2)] pl-11 pr-12 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] focus:bg-[var(--surface)]"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--text-subtle)] sm:block">
        /
      </kbd>

      {open && query.trim() ? (
        <div className="animate-pop absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
          {results.length ? (
            results.map((r, i) => (
              <button
                key={r.slug}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.slug)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  i === active ? "bg-[var(--primary-soft)]" : "hover:bg-[var(--surface-sunken)]",
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon name={r.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-[var(--text)]">{r.name}</span>
                  <span className="block truncate text-[12px] text-[var(--text-muted)]">{categoryLabel(r.category)}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-4 text-[13px] text-[var(--text-muted)]">
              No algorithm matches “{query}”.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
