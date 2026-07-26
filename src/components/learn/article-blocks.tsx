"use client";

import * as React from "react";
import { CheckCircle2, Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { ArticleBlock } from "@/lib/engine/algorithm";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

const CALLOUT = {
  insight: { icon: Lightbulb, ring: "var(--warning)", bg: "var(--warning-soft)" },
  warning: { icon: TriangleAlert, ring: "var(--danger)", bg: "var(--danger-soft)" },
  success: { icon: CheckCircle2, ring: "var(--success)", bg: "var(--success-soft)" },
} as const;

const GROUP_TONE = {
  brand: { bg: "var(--primary-soft)", fg: "var(--primary)" },
  violet: { bg: "var(--violet-soft)", fg: "var(--violet)" },
  mint: { bg: "var(--success-soft)", fg: "var(--success)" },
} as const;

export function ArticleBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="grid gap-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "p":
      return <p className="max-w-[62ch] text-[15px] leading-[1.75] text-[var(--text-muted)]">{block.text}</p>;

    case "h":
      return <h3 className="text-[17px] font-bold text-[var(--text)]">{block.text}</h3>;

    case "list":
      return (
        <ul className="grid gap-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-[var(--text-muted)]">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              {item}
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol className="grid gap-3">
          {block.items.map((item, i) => (
            <li
              key={item.title}
              className="flex items-start gap-3.5 rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[12.5px] font-bold text-[var(--primary)]">
                {i + 1}
              </span>
              <span>
                <span className="block text-[14.5px] font-semibold text-[var(--text)]">{item.title}</span>
                <span className="mt-0.5 block text-[13.5px] leading-relaxed text-[var(--text-muted)]">{item.text}</span>
              </span>
            </li>
          ))}
        </ol>
      );

    case "pillars":
      return (
        <div className="grid gap-3.5">
          {block.items.map((item) => (
            <div key={item.title} className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[var(--violet-soft)] text-[var(--violet)]">
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
              </span>
              <span>
                <span className="block text-[14.5px] font-bold text-[var(--text)]">{item.title}</span>
                <span className="mt-0.5 block max-w-[46ch] text-[13.5px] leading-relaxed text-[var(--text-muted)]">
                  {item.text}
                </span>
              </span>
            </div>
          ))}
        </div>
      );

    case "callout": {
      const c = CALLOUT[block.tone];
      return (
        <div
          className="flex items-start gap-3.5 rounded-[var(--radius-card)] border px-5 py-4"
          style={{ background: c.bg, borderColor: `color-mix(in srgb, ${c.ring} 30%, transparent)` }}
        >
          <c.icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: c.ring }} strokeWidth={2} />
          <div>
            <p className="text-[14.5px] font-bold text-[var(--text)]">{block.title}</p>
            <p className="mt-1 max-w-[60ch] text-[13.5px] leading-relaxed text-[var(--text-muted)]">{block.text}</p>
          </div>
        </div>
      );
    }

    case "table":
      return (
        <div className="av-scroll overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)]">
          <table className="w-full min-w-[440px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--surface-sunken)]">
                {block.head.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={cn(
                        "px-4 py-3 text-[13.5px]",
                        j === 0 ? "font-semibold text-[var(--text)]" : "text-[var(--text-muted)]",
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "stages":
      return (
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
          {block.caption ? (
            <p className="mb-4 text-[14.5px] font-bold text-[var(--text)]">{block.caption}</p>
          ) : null}
          <div className="av-scroll grid gap-3 overflow-x-auto">
            {block.rows.map((row, i) => {
              const tone = GROUP_TONE[row.tone ?? "brand"];
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-[74px] shrink-0 text-[12.5px] font-semibold text-[var(--text-muted)]">
                    {row.label}
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {row.groups.map((group, gi) => (
                      <div key={gi} className="flex gap-1">
                        {group.map((v, vi) => (
                          <span
                            key={vi}
                            className="inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] px-2 text-[13px] font-semibold tabular-nums"
                            style={{ background: tone.bg, color: tone.fg }}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "result":
      return (
        <div>
          <p className="mb-2.5 text-[14.5px] font-bold text-[var(--text)]">Example Result</p>
          <div className="flex flex-wrap gap-1.5">
            {block.values.map((v, i) => (
              <span
                key={i}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-[10px] bg-[var(--success-soft)] px-3 text-[15px] font-bold tabular-nums text-[var(--success)]"
              >
                {v}
              </span>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-[13.5px] text-[var(--text-muted)]">
            <CheckCircle2 className="h-[18px] w-[18px] text-[var(--success)]" strokeWidth={2} />
            {block.caption}
          </p>
        </div>
      );

    default:
      return (
        <p className="flex items-center gap-2 text-[13.5px] text-[var(--text-subtle)]">
          <Info className="h-4 w-4" /> Unsupported block
        </p>
      );
  }
}
