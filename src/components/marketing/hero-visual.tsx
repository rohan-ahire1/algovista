"use client";

import * as React from "react";
import { bubbleSort } from "@/lib/algorithms/bubble-sort";
import type { ArrayView } from "@/lib/engine/types";
import { MARK_STYLES } from "@/components/viz/marks";
import { cn } from "@/lib/cn";

const SEED = [5, 3, 8, 1, 2, 4, 7, 6];

/**
 * The hero runs the real Bubble Sort frame generator — the illustration and the
 * product are literally the same engine.
 */
export function HeroVisual() {
  const frames = React.useMemo(() => bubbleSort.generate({ array: SEED }), []);
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % frames.length), index === 0 ? 1100 : 900);
    return () => window.clearTimeout(id);
  }, [index, frames.length, paused]);

  const frame = frames[index];
  const view = frame.view as ArrayView;
  const max = Math.max(...view.values);
  const dots = 4;
  const activeDot = Math.floor((index / frames.length) * dots);

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[48px] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 60% 30%, color-mix(in srgb, var(--violet) 22%, transparent), transparent 70%), radial-gradient(50% 50% at 20% 70%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 70%)",
        }}
      />

      <div className="[perspective:1400px]">
        <div
          className="relative flex h-[330px] items-end justify-center gap-3 px-4 sm:gap-4"
          style={{ transform: "rotateX(11deg) rotateZ(-1.5deg)", transformStyle: "preserve-3d" }}
        >
          {view.values.map((v, i) => {
            const style = MARK_STYLES[view.marks[i] ?? "idle"];
            const focus = view.marks[i] === "compare" || view.marks[i] === "compare-alt";
            return (
              <div
                key={i}
                className="relative flex w-[9%] min-w-[34px] flex-col justify-end"
                style={{ height: `${28 + (v / max) * 70}%` }}
              >
                {/* top face */}
                <div
                  className="h-3 w-full rounded-t-[8px] transition-colors duration-500"
                  style={{ background: style.fill, filter: "brightness(1.12)" }}
                />
                <div
                  className="flex flex-1 items-end justify-center rounded-b-[8px] pb-3 transition-all duration-500 ease-[var(--ease-out-quint)]"
                  style={{
                    background: `linear-gradient(180deg, ${style.fill}, color-mix(in srgb, ${style.fill} 82%, #000))`,
                    boxShadow: focus
                      ? `0 18px 34px -14px color-mix(in srgb, ${style.fill} 80%, transparent)`
                      : "0 14px 28px -18px rgba(16,18,41,0.5)",
                    transform: focus ? "translateY(-6px)" : "none",
                  }}
                >
                  <span className="text-[19px] font-bold tabular-nums" style={{ color: style.text }}>
                    {v}
                  </span>
                </div>
              </div>
            );
          })}

          {/* plinth */}
          <div
            aria-hidden
            className="absolute inset-x-0 -bottom-4 h-5 rounded-[14px]"
            style={{
              background: "linear-gradient(180deg, var(--surface), var(--surface-sunken))",
              boxShadow: "0 26px 50px -28px rgba(16,18,41,0.55)",
              border: "1px solid var(--border)",
            }}
          />
        </div>
      </div>

      {/* floating step card */}
      <div
        key={frame.title}
        className="animate-pop absolute right-0 top-6 w-[190px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-lg)] sm:right-2"
      >
        <p className="text-[13px] font-bold text-[var(--text)]">
          Step {index + 1}
          <span className="ml-1 font-medium text-[var(--text-subtle)]">of {frames.length}</span>
        </p>
        <p className="mt-1 text-[12.5px] leading-snug text-[var(--text-muted)]">{frame.title}</p>
      </div>

      <div className="mt-10 flex items-center justify-center gap-2">
        {Array.from({ length: dots }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === activeDot ? "w-6 bg-[var(--primary)]" : "w-1.5 bg-[var(--border-strong)]",
            )}
          />
        ))}
      </div>
    </div>
  );
}
