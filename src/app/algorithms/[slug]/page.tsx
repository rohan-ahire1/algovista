import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Home,
  Lightbulb,
  PlayCircle,
  ShieldCheck,
  SquareDashed,
} from "lucide-react";

import { ALGORITHMS, categoryLabel, getAlgorithm, relatedTo } from "@/lib/algorithms";
import { Badge, Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { MiniPreview } from "@/components/viz/mini-preview";

export function generateStaticParams() {
  return ALGORITHMS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = getAlgorithm(slug);
  if (!algorithm) return { title: "Not found" };
  return { title: algorithm.name, description: algorithm.tagline };
}

export default async function AlgorithmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const algorithm = getAlgorithm(slug);
  if (!algorithm) notFound();

  const related = relatedTo(slug);
  const { complexity } = algorithm;

  const facts = [
    { icon: Clock, label: "Time Complexity", value: complexity.average, note: complexity.best === complexity.worst ? "Best, Average, Worst" : `Best ${complexity.best} · Worst ${complexity.worst}` },
    { icon: Box, label: "Space Complexity", value: complexity.space, note: "Additional Space" },
    ...(complexity.stable !== null
      ? [{ icon: ShieldCheck, label: "Stability", value: complexity.stable ? "Yes" : "No", note: complexity.stable ? "Stable Algorithm" : "Not Stable" }]
      : []),
    ...(complexity.inPlace !== null
      ? [{ icon: SquareDashed, label: "In-Place", value: complexity.inPlace ? "Yes" : "No", note: complexity.inPlace ? "In-Place" : "Not In-Place" }]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-6 lg:px-10">
      <nav className="flex flex-wrap items-center gap-2 text-[13.5px] text-[var(--text-muted)]" aria-label="Breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[var(--text)]">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-[var(--text-subtle)]" />
        <Link href="/algorithms" className="hover:text-[var(--text)]">
          Algorithms Library
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-[var(--text-subtle)]" />
        <Link href={`/algorithms?category=${algorithm.category}`} className="hover:text-[var(--text)]">
          {categoryLabel(algorithm.category)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-[var(--text-subtle)]" />
        <span className="font-semibold text-[var(--text)]">{algorithm.name}</span>
      </nav>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_368px]">
        <div className="min-w-0">
          {/* header */}
          <div className="flex flex-wrap items-start gap-5">
            <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[18px] bg-[var(--primary-soft)] text-[var(--primary)]">
              <Icon name={algorithm.icon} className="h-9 w-9" strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.035em] text-[var(--text)]">
                  {algorithm.name}
                </h1>
                <Badge tone="violet" className="px-3 py-1.5 text-[12.5px]">
                  {categoryLabel(algorithm.category)}
                </Badge>
                <Badge tone="neutral" className="px-3 py-1.5 text-[12.5px]">
                  {algorithm.difficulty}
                </Badge>
              </div>
              <p className="mt-3 max-w-[52rem] text-[15.5px] leading-relaxed text-[var(--text-muted)]">
                {algorithm.summary}
              </p>
            </div>
          </div>

          {/* complexity facts */}
          <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f) => (
              <Card key={f.label} className="px-4 py-4">
                <f.icon className="h-[19px] w-[19px] text-[var(--primary)]" strokeWidth={1.9} />
                <p className="mt-2.5 text-[13px] font-medium text-[var(--text-muted)]">{f.label}</p>
                <p className="mt-1 font-display text-[22px] font-extrabold tracking-[-0.02em] text-[var(--text)]">
                  {f.value}
                </p>
                <p className="mt-1 text-[12px] text-[var(--text-subtle)]">{f.note}</p>
              </Card>
            ))}
          </div>

          {/* best used when + preview */}
          <Card className="mt-5 grid gap-8 p-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
            <div>
              <h2 className="flex items-center gap-2.5 text-[17px] font-bold text-[var(--text)]">
                <Lightbulb className="h-5 w-5 text-[var(--warning)]" strokeWidth={2} />
                Best Used When
              </h2>
              <ul className="mt-5 grid gap-3.5">
                {algorithm.bestUsedWhen.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[var(--primary)]" strokeWidth={2} />
                    <span className="text-[14.5px] leading-relaxed text-[var(--text)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:border-l lg:border-[var(--border)] lg:pl-8">
              <p className="text-[13px] font-medium text-[var(--text-muted)]">Visualization Preview</p>
              <div className="mt-3">
                <MiniPreview slug={algorithm.slug} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <ButtonLink href={`/visualize/${algorithm.slug}`}>
                  Visualize now
                  <PlayCircle className="h-[18px] w-[18px]" />
                </ButtonLink>
                <ButtonLink href={`/algorithms/${algorithm.slug}/learn`} variant="secondary">
                  Learn more
                </ButtonLink>
              </div>
            </div>
          </Card>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
            <Link
              href={`/algorithms/${algorithm.slug}/code`}
              className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] text-[var(--primary)]">
                <Code2 className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-[var(--text)]">View implementation</span>
                <span className="block text-[13px] text-[var(--text-muted)]">Pseudocode, Python, JavaScript, Java, C++</span>
              </span>
              <ChevronRight className="h-4 w-4 text-[var(--text-subtle)] transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={`/practice?algorithm=${algorithm.slug}`}
              className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--success-soft)] text-[var(--success)]">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-[var(--text)]">Test yourself</span>
                <span className="block text-[13px] text-[var(--text-muted)]">
                  {algorithm.quiz.length} questions on {algorithm.name}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-[var(--text-subtle)] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* right rail */}
        <aside className="grid content-start gap-5">
          <Card className="p-5">
            <h2 className="text-[16px] font-bold text-[var(--text)]">Algorithm Steps</h2>
            <ol className="mt-4 grid gap-4">
              {algorithm.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-[12px] font-bold text-[var(--text-muted)]">
                    {i + 1}
                  </span>
                  <span className="text-[14px] leading-relaxed text-[var(--text)]">{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5">
            <h2 className="text-[16px] font-bold text-[var(--text)]">Related Algorithms</h2>
            <div className="mt-4 grid gap-1">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/algorithms/${r.slug}`}
                  className="group flex items-center gap-3 rounded-[11px] px-2 py-2.5 transition-colors hover:bg-[var(--surface-sunken)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
                    <Icon name={r.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-[var(--text)]">{r.name}</span>
                    <span className="block truncate text-[12.5px] text-[var(--text-muted)]">
                      {categoryLabel(r.category)}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-subtle)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[var(--text)]">Also Explore</h2>
              <Link href="/algorithms" className="text-[13px] font-semibold text-[var(--primary)]">
                View all
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[algorithm.category, ...(algorithm.alsoIn ?? [])].map((c) => (
                <Link key={c} href={`/algorithms?category=${c}`}>
                  <Badge tone="brand" className="px-3 py-1.5 text-[12.5px] transition-opacity hover:opacity-80">
                    {categoryLabel(c)}
                  </Badge>
                </Link>
              ))}
              <Badge tone="neutral" className="px-3 py-1.5 text-[12.5px]">
                {algorithm.difficulty}
              </Badge>
            </div>
          </Card>

          <Card className="border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[var(--warning-soft)] p-5">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" strokeWidth={2} />
              <div>
                <p className="text-[14px] font-bold text-[var(--text)]">Key Insight</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{algorithm.keyInsight}</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
