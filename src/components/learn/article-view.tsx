"use client";

import * as React from "react";
import { getAlgorithm } from "@/lib/algorithms";
import { Tabs } from "@/components/ui/controls";
import { ArticleBlocks } from "./article-blocks";
import { MiniPreview } from "@/components/viz/mini-preview";

type TabId = "overview" | "howItWorks" | "walkthrough" | "complexity";

const TABS: { value: TabId; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "howItWorks", label: "How it Works" },
  { value: "walkthrough", label: "Example Walkthrough" },
  { value: "complexity", label: "Complexity" },
];

export function ArticleView({ slug }: { slug: string }) {
  const [tab, setTab] = React.useState<TabId>("overview");
  const algorithm = getAlgorithm(slug)!;

  return (
    <div>
      <Tabs value={tab} onChange={setTab} options={TABS} className="overflow-x-auto" />

      <div key={tab} className="animate-fade-up mt-7 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <h2 className="mb-5 text-[19px] font-bold text-[var(--text)]">
            {tab === "overview"
              ? `What is ${algorithm.name}?`
              : tab === "howItWorks"
                ? "How it works, step by step"
                : tab === "walkthrough"
                  ? "Worked example"
                  : "Complexity analysis"}
          </h2>
          <ArticleBlocks blocks={algorithm.article[tab]} />
        </div>

        <div className="min-w-0">
          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <p className="mb-4 text-[13px] font-medium text-[var(--text-muted)]">Live preview</p>
            <MiniPreview slug={algorithm.slug} interval={1100} />
          </div>
        </div>
      </div>
    </div>
  );
}
