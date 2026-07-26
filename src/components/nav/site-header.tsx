"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";
import { ButtonLink } from "@/components/ui/button";
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
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] w-full max-w-[1680px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = l.match.some((m) => pathname.startsWith(m));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-[10px] px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text)]",
                )}
              >
                {l.label}
                {active ? (
                  <span className="absolute inset-x-3.5 -bottom-[19px] h-[2px] rounded-full bg-[var(--primary)]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <SearchBox className="ml-auto hidden w-full max-w-md md:block" />

        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <button
            type="button"
            onClick={() => setSettings({ theme: settings.theme === "light" ? "dark" : "light" })}
            aria-label={`Switch to ${settings.theme === "light" ? "dark" : "light"} theme`}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-field)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]"
          >
            {settings.theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </button>

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

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-field)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-sunken)] lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="animate-fade-up border-t border-[var(--border)] bg-[var(--surface)] px-4 pb-4 pt-3 lg:hidden">
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
