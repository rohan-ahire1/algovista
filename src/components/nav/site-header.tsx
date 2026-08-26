"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Menu, Moon, Sun, X } from "lucide-react";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";
import { Button, ButtonLink } from "@/components/ui/button-compat";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/algorithms", label: "Visualize", match: ["/algorithms", "/visualize"] },
  { href: "/learn", label: "Learn", match: ["/learn"] },
  { href: "/practice", label: "Practice", match: ["/practice"] },
  { href: "/about", label: "About", match: ["/about"] },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { settings, setSettings, progress } = useAppStore();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isLanding = pathname === "/";

  const initials = (progress.name || "AV")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 overflow-x-clip border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] shadow-[var(--shadow-xs)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1480px] min-w-0 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo className="shrink-0" />

        <nav className="ml-4 hidden shrink-0 items-center gap-1 xl:flex">
          {LINKS.map((l) => {
            const active = l.match.some((m) => pathname.startsWith(m));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-[10px] px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <SearchBox className="ml-auto hidden min-w-0 w-full max-w-md flex-1 md:block" />

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSettings({ theme: settings.theme === "light" ? "dark" : "light" })}
            aria-label={`Switch to ${settings.theme === "light" ? "dark" : "light"} theme`}
            className="h-10 w-10 text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]"
          >
            {settings.theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </Button>

          <div className="hidden items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[12px] font-semibold text-[var(--text)] sm:flex">
            <Flame className="h-4 w-4 text-[var(--primary)]" />
            {progress.streak}
          </div>

          {isLanding ? (
            <ButtonLink href="/algorithms" size="sm" className="hidden h-10 px-4 sm:inline-flex">
              Start Visualizing
            </ButtonLink>
          ) : (
            <Link
              href="/dashboard"
              aria-label="Your dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--violet)] text-[13px] font-bold text-white shadow-[var(--shadow-sm)] ring-2 ring-[var(--surface)] transition-transform hover:scale-105"
            >
              {initials}
            </Link>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            className="h-10 w-10 text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] xl:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div className="animate-fade-up border-t border-[var(--border)] bg-[var(--surface)] px-4 pb-4 pt-3 xl:hidden">
          <SearchBox className="mb-3 md:hidden" />
          <nav className="grid gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
