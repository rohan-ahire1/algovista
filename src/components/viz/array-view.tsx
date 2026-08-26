"use client";

import * as React from "react";
import type { ArrayView, MarkKind } from "@/lib/engine/types";
import type { AnimationStyle } from "@/lib/store/schema";
import { cn } from "@/lib/cn";
import { MARK_STYLES, POINTER_TONES } from "./marks";

const EASING: Record<AnimationStyle, string> = {
  smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  instant: "linear",
  bouncy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

const DURATION: Record<AnimationStyle, number> = { smooth: 380, instant: 0, bouncy: 520 };

interface ItemKeyState {
  values: number[];
  keys: string[];
  nextKey: number;
  signature: string;
}

function reconcileItemKeys(values: number[], previous: ItemKeyState) {
  const oldValues = previous.values;
  const oldKeys = previous.keys;
  let nextKey = previous.nextKey;
  const makeKey = () => `array-item-${nextKey++}`;

  const used = new Set<number>();
  const nextKeys = values.map((value) => {
    const oldIndex = oldValues.findIndex((oldValue, index) => !used.has(index) && oldValue === value);
    if (oldIndex < 0) return makeKey();
    used.add(oldIndex);
    return oldKeys[oldIndex] ?? makeKey();
  });

  return { values: [...values], keys: nextKeys, nextKey, signature: values.join(",") } satisfies ItemKeyState;
}

export function ArrayViewRenderer({
  view,
  animation = "smooth",
  compact = false,
  title,
}: {
  view: ArrayView;
  animation?: AnimationStyle;
  compact?: boolean;
  title?: string;
}) {
  const { values, marks, pointers, ranges, auxiliary } = view;
  const max = Math.max(...values, 1);
  const transition = `height ${DURATION[animation]}ms ${EASING[animation]}, background-color 240ms ease, box-shadow 240ms ease, transform ${DURATION[animation]}ms ${EASING[animation]}, opacity 240ms ease`;
  const n = values.length;
  const focusMarks = new Set<MarkKind>(["compare", "compare-alt", "pivot", "active", "found", "frontier", "path"]);
  const hasFocus = marks.some((mark) => focusMarks.has(mark));
  const showIndices = n <= 20 && !compact;
  const valueSignature = values.join(",");
  const [itemState, setItemState] = React.useState<ItemKeyState>(() => ({
    values: [...values],
    keys: values.map((_, index) => `array-item-${index}`),
    nextKey: values.length,
    signature: valueSignature,
  }));
  const itemPlan = React.useMemo(() => reconcileItemKeys(values, itemState), [values, itemState]);
  const { keys: itemKeys } = itemPlan;
  const itemKeySignature = itemKeys.join("|");
  const itemNodes = React.useRef(new Map<string, HTMLDivElement>());
  const previousRects = React.useRef(new Map<string, DOMRect>());

  React.useLayoutEffect(() => {
    const nextRects = new Map<string, DOMRect>();
    const motions: { node: HTMLDivElement; x: number; transition: string }[] = [];

    itemKeys.forEach((itemKey) => {
      const node = itemNodes.current.get(itemKey);
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const oldRect = previousRects.current.get(itemKey);
      if (oldRect && Math.abs(oldRect.left - rect.left) > 1) {
        motions.push({ node, x: oldRect.left - rect.left, transition: node.style.transition });
        node.style.transition = "none";
        node.style.setProperty("--av-flip-x", `${oldRect.left - rect.left}px`);
      }
      nextRects.set(itemKey, rect);
    });

    previousRects.current = nextRects;
    if (!motions.length) {
      if (itemState.signature === valueSignature) return;
      const stateFrame = window.requestAnimationFrame(() => setItemState(itemPlan));
      return () => window.cancelAnimationFrame(stateFrame);
    }

    const animationFrame = window.requestAnimationFrame(() => {
      motions.forEach(({ node, transition }) => {
        node.style.transition = transition;
        node.style.setProperty("--av-flip-x", "0px");
      });
      if (itemState.signature !== valueSignature) setItemState(itemPlan);
    });

    return () => window.cancelAnimationFrame(animationFrame);
    // The key plan is intentionally keyed by its signature. Updating the state
    // after measuring must not restart the FLIP animation with a new array ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKeySignature, valueSignature]);

  return (
    <div className="flex w-full flex-col">
      {!compact ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                hasFocus ? "bg-[var(--primary)] shadow-[0_0_0_5px_var(--primary-soft)] av-live-dot" : "bg-[var(--success)]",
              )}
            />
            <span className="truncate text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              {hasFocus ? "Live comparison" : "Input array"}
            </span>
            {title ? <span className="hidden truncate text-[12.5px] text-[var(--text-subtle)] sm:inline">· {title}</span> : null}
          </div>
          <span className="rounded-full bg-[var(--surface-sunken)] px-2.5 py-1 text-[11.5px] font-semibold tabular-nums text-[var(--text-muted)]">
            {n} {n === 1 ? "element" : "elements"}
          </span>
        </div>
      ) : null}

      {/* pointer rail */}
      {pointers?.length ? (
        <div className="relative mb-2 h-6 px-1">
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
        className={cn(
          "av-array-plot relative w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-3 pt-4 sm:px-5",
          compact ? "h-40 pb-2" : "h-[clamp(190px,30vh,270px)] pb-3",
        )}
        style={{
          backgroundImage:
            "linear-gradient(to top, color-mix(in srgb, var(--border) 42%, transparent) 1px, transparent 1px)",
          backgroundSize: "100% 25%",
        }}
      >
        <div className="relative flex h-full w-full items-end gap-[clamp(3px,0.7%,9px)]">
          {values.map((v, i) => {
            const itemKey = itemKeys[i];
            const mark = marks[i] ?? "idle";
            const style = MARK_STYLES[mark];
            const isFocus = focusMarks.has(mark);
            const isQuiet = hasFocus && !isFocus && (mark === "idle" || mark === "discarded");
            const showValue = n <= 26 || isFocus;
            const fill =
              mark === "idle"
                ? "linear-gradient(180deg, color-mix(in srgb, var(--viz-idle) 72%, white), color-mix(in srgb, var(--viz-idle) 88%, var(--sky)))"
                : `linear-gradient(180deg, color-mix(in srgb, ${style.fill} 72%, white), color-mix(in srgb, ${style.fill} 88%, var(--surface)))`;

            return (
              <div key={itemKey} className="relative flex h-full min-w-0 flex-1 flex-col justify-end">
                <div
                  ref={(node) => {
                    if (node) itemNodes.current.set(itemKey, node);
                    else itemNodes.current.delete(itemKey);
                  }}
                  className={cn(
                    "av-viz-bar relative flex w-full items-end justify-center rounded-t-[8px] rounded-b-[4px]",
                    isFocus && "av-viz-bar-focus z-10",
                  )}
                  style={
                    {
                      height: `${Math.max(7, (v / max) * 100)}%`,
                      background: fill,
                      color: style.text,
                      transition,
                      opacity: isQuiet ? 0.66 : 1,
                      border: `1px solid color-mix(in srgb, ${style.fill} 32%, var(--border))`,
                      boxShadow: style.ring
                        ? `0 0 0 2px ${style.ring}, inset 0 1px 0 rgb(255 255 255 / 62%)`
                        : "inset 0 1px 0 rgb(255 255 255 / 58%)",
                      transform: "translateX(var(--av-flip-x, 0px)) translateY(var(--av-lift, 0px))",
                      "--av-flip-x": "0px",
                      "--av-lift": isFocus ? "-5px" : "0px",
                    } as React.CSSProperties
                  }
                >
                  {showValue ? (
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        isFocus
                          ? "absolute -top-7 rounded-full px-2 py-0.5 text-[11px] shadow-[var(--shadow-sm)]"
                          : "pb-1.5",
                        n > 18 && !isFocus ? "text-[10px]" : n > 12 && !isFocus ? "text-[12px]" : "text-[15px]",
                      )}
                      style={
                        isFocus
                          ? { background: `color-mix(in srgb, ${style.fill} 78%, white)`, color: style.text }
                          : { color: style.text }
                      }
                    >
                      {v}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
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
