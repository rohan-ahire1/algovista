import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Box, Clock, Lightbulb, PlayCircle, ShieldCheck, SquareDashed } from "lucide-react";

import { ALGORITHMS, getAlgorithm } from "@/lib/algorithms";
import { highlightAll } from "@/lib/highlight";
import { Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { CategoryRail } from "@/components/nav/category-rail";
import { CodeViewer } from "@/components/code/code-viewer";

export function generateStaticParams() {
  return ALGORITHMS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = getAlgorithm(slug);
  if (!algorithm) return { title: "Not found" };
  return { title: `${algorithm.name} implementation`, description: `Source code for ${algorithm.name}.` };
}

export default async function CodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const algorithm = getAlgorithm(slug);
  if (!algorithm) notFound();

  const html = await highlightAll(algorithm.code);
  const { complexity } = algorithm;

  const facts = [
    { icon: Clock, label: "Time Complexity", value: complexity.average },
    { icon: Box, label: "Space Complexity", value: complexity.space },
    ...(complexity.stable !== null
      ? [{ icon: ShieldCheck, label: "Stable", value: complexity.stable ? "Yes" : "No" }]
      : []),
    ...(complexity.inPlace !== null
      ? [{ icon: SquareDashed, label: "In-Place", value: complexity.inPlace ? "Yes" : "No" }]
      : []),
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1680px]">
      <CategoryRail activeCategory={algorithm.category} />

      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-9">
        <Link
          href={`/algorithms/${algorithm.slug}`}
          className="inline-flex items-center gap-2 rounded-[11px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-[13.5px] font-medium text-[var(--text-muted)] shadow-[var(--shadow-xs)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {algorithm.name}
        </Link>

        <h1 className="mt-5 text-[clamp(1.7rem,3vw,2.15rem)] font-extrabold tracking-[-0.03em] text-[var(--text)]">
          {algorithm.name} Implementation
        </h1>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_336px]">
          <div className="min-w-0">
            <CodeViewer html={html} raw={algorithm.code} />

            <Card className="mt-5 flex flex-wrap gap-y-4 p-4">
              {facts.map((f) => (
                <div key={f.label} className="flex min-w-[160px] flex-1 items-center gap-3 px-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--surface-sunken)] text-[var(--primary)]">
                    <f.icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] text-[var(--text-muted)]">{f.label}</span>
                    <span className="block truncate font-display text-[16px] font-extrabold text-[var(--text)]">
                      {f.value}
                    </span>
                  </span>
                </div>
              ))}
            </Card>
          </div>

          <aside className="grid content-start gap-4">
            <Card className="p-5">
              <h2 className="text-[15.5px] font-bold text-[var(--text)]">What is {algorithm.name}?</h2>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{algorithm.summary}</p>
            </Card>

            <Card className="p-5">
              <h2 className="text-[15.5px] font-bold text-[var(--text)]">How It Works</h2>
              <ol className="mt-3.5 grid gap-3">
                {algorithm.steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[11.5px] font-bold text-[var(--primary)]">
                      {i + 1}
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-[var(--text-muted)]">{s}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-5">
              <p className="flex items-center gap-2 text-[15.5px] font-bold text-[var(--text)]">
                <Lightbulb className="h-[18px] w-[18px] text-[var(--warning)]" strokeWidth={2} />
                Key Insight
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{algorithm.keyInsight}</p>
            </Card>

            <Card className="bg-[var(--primary-soft)] p-5">
              <p className="text-[15.5px] font-bold text-[var(--text)]">Try It Yourself</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-muted)]">
                Go to the {algorithm.name} visualization to see this algorithm in action.
              </p>
              <ButtonLink href={`/visualize/${algorithm.slug}`} className="mt-4 w-full">
                <PlayCircle className="h-[18px] w-[18px]" />
                Visualize Now
              </ButtonLink>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
