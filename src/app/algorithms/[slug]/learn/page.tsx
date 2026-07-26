import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { ALGORITHMS, getAlgorithm } from "@/lib/algorithms";
import { CategoryRail } from "@/components/nav/category-rail";
import { ArticleView } from "@/components/learn/article-view";
import { Card } from "@/components/ui/primitives";

export function generateStaticParams() {
  return ALGORITHMS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = getAlgorithm(slug);
  if (!algorithm) return { title: "Not found" };
  return { title: `Understanding ${algorithm.name}`, description: algorithm.summary };
}

export default async function LearnAlgorithmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const algorithm = getAlgorithm(slug);
  if (!algorithm) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[1680px]">
      <div className="hidden lg:block">
        <CategoryRail activeCategory={algorithm.category} popular={false} />
      </div>

      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <Link
          href="/algorithms"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all algorithms
        </Link>

        <h1 className="mt-3 text-[clamp(1.9rem,3.4vw,2.4rem)] font-extrabold tracking-[-0.035em] text-[var(--text)]">
          Understanding {algorithm.name}
        </h1>

        <div className="mt-6">
          <ArticleView slug={algorithm.slug} />
        </div>

        <Card className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-[var(--primary-soft)] p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" strokeWidth={2} />
            <div>
              <p className="text-[15px] font-bold text-[var(--text)]">Learn by Doing</p>
              <p className="mt-1 text-[13.5px] text-[var(--text-muted)]">
                Practice and master algorithms step by step.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/visualize/${algorithm.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--text)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--border-strong)]"
            >
              Visualize it
            </Link>
            <Link
              href={`/practice?algorithm=${algorithm.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-field)] bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--on-primary)] shadow-[var(--shadow-primary)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              Start Practicing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
