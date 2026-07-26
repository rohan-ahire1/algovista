import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cookie, Keyboard, Layers, ScanEye, Sparkles } from "lucide-react";

import { ALGORITHMS, CATEGORIES, COMING_SOON_BLURB, type Category } from "@/lib/algorithms";
import { LANGUAGES } from "@/lib/engine/algorithm";
import { Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "About",
  description: "How AlgoVista works and what is coming next.",
};

const PRINCIPLES = [
  {
    icon: ScanEye,
    title: "Every frame is real",
    text: "Nothing here is a canned animation. Each algorithm compiles its input into a full list of steps, and the screen renders whichever step you are on.",
  },
  {
    icon: Layers,
    title: "Explanations, not just colours",
    text: "Every step says why it happened — which comparison was made, which branch was taken, and what that means for the rest of the run.",
  },
  {
    icon: Keyboard,
    title: "Built to be scrubbed",
    text: "Because the whole timeline is computed up front, stepping backwards is exact. Space plays and pauses; the arrow keys move one step at a time.",
  },
  {
    icon: Cookie,
    title: "No account required",
    text: "Your settings and progress live in a cookie in this browser. Nothing is uploaded, and clearing your cookies resets everything.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-6 lg:px-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--primary)] shadow-[var(--shadow-xs)]">
        <Sparkles className="h-4 w-4" />
        About AlgoVista
      </span>

      <h1 className="mt-6 max-w-[20ch] text-[clamp(2.1rem,5vw,3.1rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-[var(--text)]">
        Algorithms are easier to understand when you can watch them run.
      </h1>
      <p className="mt-5 max-w-[62ch] text-[16.5px] leading-relaxed text-[var(--text-muted)]">
        AlgoVista turns {ALGORITHMS.length} classic algorithms into step-by-step visual runs, each with a written
        explanation, a worked example, a complexity breakdown and implementations in {LANGUAGES.length - 1} languages
        plus pseudocode.
      </p>

      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <Card key={p.title} className="p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] text-[var(--primary)]">
              <p.icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <p className="mt-4 text-[16px] font-bold text-[var(--text)]">{p.title}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-muted)]">{p.text}</p>
          </Card>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-[var(--text)]">What is in the library</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(CATEGORIES as readonly Category[]).map((c) => {
            const items = ALGORITHMS.filter((a) => a.category === c.id || (a.alsoIn ?? []).includes(c.id));
            return (
              <Card key={c.id} className={c.comingSoon ? "border-dashed bg-[var(--surface-2)] p-5" : "p-5"}>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      c.comingSoon
                        ? "flex h-10 w-10 items-center justify-center rounded-[11px] bg-[var(--surface-sunken)] text-[var(--text-subtle)]"
                        : "flex h-10 w-10 items-center justify-center rounded-[11px] bg-[var(--primary-soft)] text-[var(--primary)]"
                    }
                  >
                    <Icon name={c.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <p className="flex-1 text-[15px] font-bold text-[var(--text)]">{c.label}</p>
                  {c.comingSoon ? (
                    <span className="rounded-full bg-[var(--surface-sunken)] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--text-subtle)]">
                      Soon
                    </span>
                  ) : null}
                </div>
                {c.comingSoon ? (
                  <p className="mt-3.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
                    {COMING_SOON_BLURB[c.id]}
                  </p>
                ) : (
                  <ul className="mt-3.5 grid gap-1.5">
                    {items.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/algorithms/${a.slug}`}
                          className="text-[13.5px] text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                        >
                          {a.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <section id="roadmap" className="mt-14 scroll-mt-24">
        <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-[var(--text)]">Roadmap</h2>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-[var(--text-muted)]">
          Requesting an algorithm is not wired up to a backend yet — there are no accounts and no server-side storage.
          Dynamic Programming and Data Structures are the next two categories to fill in; beyond those, the platform
          itself grows into:
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { title: "Accounts and sync", text: "Optional sign-in so progress follows you between devices, replacing the cookie." },
            { title: "Custom input", text: "Type your own array or draw your own graph and watch any algorithm run on it." },
          ].map((r) => (
            <Card key={r.title} className="p-5">
              <p className="text-[15px] font-bold text-[var(--text)]">{r.title}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{r.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mt-12 flex flex-wrap items-center justify-between gap-5 bg-[var(--primary-soft)] p-6">
        <div>
          <p className="text-[17px] font-bold text-[var(--text)]">Pick an algorithm and press play.</p>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">That is genuinely the fastest way in.</p>
        </div>
        <ButtonLink href="/algorithms" size="lg">
          Browse the library
          <ArrowRight className="h-[18px] w-[18px]" />
        </ButtonLink>
      </Card>
    </div>
  );
}
