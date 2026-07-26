"use client";

import * as React from "react";
import type { ArrayView } from "@/lib/engine/types";
import type { AnimationStyle } from "@/lib/store/schema";
import { cn } from "@/lib/cn";
import { MARK_STYLES, POINTER_TONES } from "./marks";

const EASING: Record<AnimationStyle, string> = {
  smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  instant: "linear",
  bouncy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

const DURATION: Record<AnimationStyle, number> = { smooth: 380, instant: 0, bouncy: 520 };

export function ArrayViewRenderer({
  view,
  animation = "smooth",
  compact = false,
}: {
  view: ArrayView;
  animation?: AnimationStyle;
  compact?: boolean;
}) {
  const { values, marks, pointers, ranges, auxiliary } = view;
  const max = Math.max(...values, 1);
  const transition = `height ${DURATION[animation]}ms ${EASING[animation]}, background-color 240ms ease, box-shadow 240ms ease, transform ${DURATION[animation]}ms ${EASING[animation]}`;
  const n = values.length;
  const showValues = n <= 26;
  const showIndices = n <= 20 && !compact;

  return (
    <div className="flex w-full flex-col">
      {/* pointer rail */}
      {pointers?.length ? (
        <div className="relative mb-2 h-6">
          {pointers.map((p) => (
            <span
              key={`${p.label}-${p.index}`}
              className="absolute -translate-x-1/2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow-[var(--shadow-sm)] transition-[left] duration-300 ease-[var(--ease-out-quint)]"
              style={{
                left: `${((p.index + 0.5) / n) * 100}%`,
                background: POINTER_TONES[p.tone ?? "brand"],
              }}
            >
              {p.label}
            </span>
          ))}
        </div>
      ) : null}

      {/* bars */}
      <div
        className={cn("relative flex w-full items-end gap-[clamp(2px,0.8%,10px)]", compact ? "h-40" : "h-[clamp(180px,34vh,300px)]")}
      >
        {values.map((v, i) => {
          const style = MARK_STYLES[marks[i] ?? "idle"];
          const isFocus = marks[i] === "compare" || marks[i] === "active" || marks[i] === "found";
          return (
            <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div
                className="relative flex w-full items-end justify-center rounded-t-[7px] rounded-b-[3px]"
                style={{
                  height: `${Math.max(6, (v / max) * 100)}%`,
                  background: style.fill,
                  color: style.text,
                  transition,
                  boxShadow: style.ring ? `0 0 0 4px ${style.ring}` : "none",
                  transform: isFocus ? "translateY(-4px)" : "none",
                }}
              >
                {showValues ? (
                  <span
                    className={cn(
                      "pb-1.5 font-semibold tabular-nums",
                      n > 18 ? "text-[10px]" : n > 12 ? "text-[12px]" : "text-[15px]",
                    )}
                    style={{ color: style.text }}
                  >
                    {v}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* baseline */}
      <div className="mt-1 h-1.5 w-full rounded-full bg-[var(--surface-sunken)]" />

      {/* index rail */}
      {showIndices ? (
        <div className="mt-1.5 flex w-full gap-[clamp(2px,0.8%,10px)]">
          {values.map((_, i) => (
            <span key={i} className="min-w-0 flex-1 text-center text-[11px] tabular-nums text-[var(--text-subtle)]">
              {i}
            </span>
          ))}
        </div>
      ) : null}

      {/* range brackets */}
      {ranges?.length ? (
        <div className="relative mt-2 h-7">
          {ranges.map((r, idx) => {
            const left = (r.from / n) * 100;
            const width = ((r.to - r.from + 1) / n) * 100;
            const color =
              r.tone === "violet" ? "var(--violet)" : r.tone === "mint" ? "var(--success)" : "var(--primary)";
            return (
              <div
                key={idx}
                className="absolute top-0 flex flex-col items-center transition-all duration-300 ease-[var(--ease-out-quint)]"
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <div
                  className="h-2 w-full rounded-b-[6px] border-x border-b"
                  style={{ borderColor: color, opacity: 0.55 }}
                />
                {r.label ? (
                  <span className="mt-1 truncate text-[10.5px] font-medium" style={{ color }}>
                    {r.label}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* auxiliary buffer row */}
      {auxiliary ? (
        <div className="mt-4 rounded-[var(--radius-field)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
            {auxiliary.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {auxiliary.values.map((v, i) => {
              const style = MARK_STYLES[auxiliary.marks?.[i] ?? "idle"];
              return (
                <span
                  key={i}
                  className="inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] px-2 text-[13px] font-semibold tabular-nums transition-colors duration-200"
                  style={{ background: style.fill, color: style.text }}
                >
                  {v}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
