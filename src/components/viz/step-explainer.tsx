"use client";

import { ArrowRight, Lightbulb } from "lucide-react";

import type { Frame, TableDecision } from "@/lib/engine/types";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export function StepExplainer({ frame, index, total }: { frame: Frame; index: number; total: number }) {
  const decision = frame.view.kind === "table" ? frame.view.decision : undefined;

  return (
    <Card className="mt-5 overflow-hidden border-[color-mix(in_srgb,var(--primary)_25%,var(--border))] bg-[var(--surface)] p-0">
      <div key={`${index}-${frame.title}`} className="animate-fade-up p-4 sm:p-5" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.11em] text-[var(--primary)]">
            <span className="flex h-6 w-6 animate-pop items-center justify-center rounded-full bg-[var(--primary-soft)]">
              <Lightbulb className="h-3.5 w-3.5" />
            </span>
            Step {index + 1} of {total}
          </span>
          {frame.phase ? (
            <span className="rounded-full bg-[var(--surface-sunken)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--text-muted)]">
              {frame.phase}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--primary)] shadow-[0_0_0_5px_var(--primary-soft)]" />
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[var(--text)]">{frame.title}</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{frame.detail}</p>
          </div>
        </div>

        {frame.chips?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5 pl-[22px]">
            {frame.chips.slice(0, 3).map((chip) => (
              <span key={chip} className="rounded-[7px] bg-[var(--primary-soft)] px-2 py-1 text-[11.5px] font-semibold text-[var(--primary)]">
                {chip}
              </span>
            ))}
          </div>
        ) : null}

        {decision ? <DecisionSummary decision={decision} /> : null}
      </div>
    </Card>
  );
}

function DecisionSummary({ decision }: { decision: TableDecision }) {
  const takeText = decision.take === null ? "Does not fit" : `${decision.takeSource ?? 0} + ${decision.itemValue ?? 0} = ${decision.take}`;

  return (
    <div className="mt-4 rounded-[var(--radius-field)] bg-[var(--primary-soft)] p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--primary)]">
          At capacity {decision.capacity}, compare:
        </p>
        <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--primary)]">
          {decision.choice === "take" ? "Take item" : "Skip item"}
        </span>
      </div>

      <div className="mt-2.5 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        <DecisionValue label="Skip" value={String(decision.skip)} />
        <ArrowRight className="hidden h-4 w-4 text-[var(--text-subtle)] sm:block" />
        <DecisionValue label="Take" value={takeText} />
        <ArrowRight className="hidden h-4 w-4 text-[var(--text-subtle)] sm:block" />
        <DecisionValue label="Cell result" value={String(decision.result)} active />
      </div>
    </div>
  );
}

function DecisionValue({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={cn("rounded-[9px] border px-2.5 py-2", active ? "border-[var(--primary)] bg-[var(--surface)]" : "border-[var(--border)] bg-[var(--surface)]")}>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">{label}</p>
      <p className="mt-1 truncate text-[13px] font-bold tabular-nums text-[var(--text)]">{value}</p>
    </div>
  );
}
