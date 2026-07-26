import Link from "next/link";
import { ArrowRight, CirclePlay, Heart, Lightbulb, PlayCircle, ScanEye, Sparkles, Waypoints } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { Icon } from "@/components/icon";
import { ALGORITHMS, categoriesWithCounts } from "@/lib/algorithms";

const FEATURES = [
  { icon: ScanEye, title: "Interactive Visualizations", text: "See algorithms in action" },
  { icon: Waypoints, title: "Step-by-Step Execution", text: "Follow every move" },
  { icon: Lightbulb, title: "Practice & Test", text: "Build confidence with quizzes" },
  { icon: Heart, title: "Learn by Doing", text: "Practice and master" },
];

export default function LandingPage() {
  const categories = categoriesWithCounts().filter((c) => c.count > 0);

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-[0.55]"
        style={{
          background:
            "radial-gradient(60% 55% at 75% 12%, color-mix(in srgb, var(--violet) 12%, transparent), transparent 70%), radial-gradient(45% 45% at 10% 0%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 70%)",
        }}
      />

      <section className="mx-auto grid w-full max-w-[1320px] items-center gap-12 px-4 pb-6 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-8 lg:pt-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--primary)] shadow-[var(--shadow-xs)]">
            <Sparkles className="h-3.5 w-3.5" />
            Visualize. Understand. Master.
          </span>

          <h1 className="mt-6 text-[clamp(2.6rem,6vw,4.4rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-[var(--text)]">
            Understand
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(96deg, var(--primary), var(--violet) 78%)" }}
            >
              Algorithms
            </span>
            <br />
            Visually.
          </h1>

          <p className="mt-5 max-w-[30rem] text-[16.5px] leading-relaxed text-[var(--text-muted)]">
            Watch algorithms come to life with interactive visualizations. Learn by seeing how they work step by step.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/algorithms" size="lg">
              <CirclePlay className="h-[18px] w-[18px]" />
              Explore Algorithms
            </ButtonLink>
            <ButtonLink href="/visualize/bubble-sort" size="lg" variant="secondary" className="text-[var(--primary)]">
              <PlayCircle className="h-[18px] w-[18px]" />
              Watch Demo
            </ButtonLink>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {[
              { k: `${ALGORITHMS.length}`, v: "Algorithms" },
              { k: "4", v: "Languages + pseudocode" },
              { k: "100%", v: "Step-by-step explained" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-[22px] font-extrabold text-[var(--text)]">{s.k}</dt>
                <dd className="text-[13px] text-[var(--text-muted)]">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-fade-up lg:pl-4" style={{ animationDelay: "120ms" }}>
          <HeroVisual />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1320px] px-4 pb-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[19px] font-bold text-[var(--text)]">Popular Topics</h2>
          <Link
            href="/algorithms"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--primary)] transition-opacity hover:opacity-80"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/algorithms?category=${c.id}`}
              className="group flex items-center gap-3.5 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow-xs)] transition-all duration-200 ease-[var(--ease-out-quint)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] text-[var(--primary)]">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-semibold text-[var(--text)]">{c.label}</span>
                <span className="block text-[13px] text-[var(--text-muted)]">
                  {c.count} {c.count === 1 ? "algorithm" : "algorithms"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3.5 bg-[var(--surface-2)] px-5 py-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[var(--surface)] text-[var(--primary)] shadow-[var(--shadow-xs)]">
                <f.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-[var(--text)]">{f.title}</span>
                <span className="block text-[13px] text-[var(--text-muted)]">{f.text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
