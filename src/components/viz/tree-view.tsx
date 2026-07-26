"use client";

import * as React from "react";
import type { TreeView } from "@/lib/engine/types";
import { MARK_STYLES } from "./marks";

const W = 900;
const NODE_W = 74;
const NODE_H = 34;
const ROW = 78;
const PAD_Y = 26;

export function TreeViewRenderer({ view, compact = false }: { view: TreeView; compact?: boolean }) {
  const { nodes, marks, collections } = view;
  const maxDepth = Math.max(...nodes.map((n) => n.depth), 0);
  const H = PAD_Y * 2 + maxDepth * ROW + NODE_H;

  const pos = React.useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      map[n.id] = {
        x: NODE_W / 2 + 16 + n.x * (W - NODE_W - 32),
        y: PAD_Y + n.depth * ROW,
      };
    });
    return map;
  }, [nodes]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="av-scroll w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={compact ? "h-44 w-full min-w-[520px]" : "h-[clamp(240px,42vh,420px)] w-full min-w-[620px]"}
          role="img"
          aria-label="Recursion tree"
        >
          {nodes.map((n) => {
            if (!n.parent) return null;
            const a = pos[n.parent];
            const b = pos[n.id];
            const done = marks[n.id] === "sorted";
            return (
              <path
                key={`edge-${n.id}`}
                d={`M ${a.x} ${a.y + NODE_H / 2} C ${a.x} ${a.y + ROW * 0.6}, ${b.x} ${b.y - ROW * 0.5}, ${b.x} ${b.y - NODE_H / 2}`}
                fill="none"
                stroke={done ? "var(--success)" : "var(--border-strong)"}
                strokeWidth={done ? 2.5 : 1.75}
                style={{ transition: "stroke 320ms ease" }}
              />
            );
          })}

          {nodes.map((n) => {
            const style = MARK_STYLES[marks[n.id] ?? "idle"];
            const p = pos[n.id];
            const focused = marks[n.id] === "active";
            return (
              <g key={n.id}>
                {focused ? (
                  <rect
                    x={p.x - NODE_W / 2 - 5}
                    y={p.y - NODE_H / 2 - 5}
                    width={NODE_W + 10}
                    height={NODE_H + 10}
                    rx={13}
                    fill="var(--viz-active)"
                    opacity={0.18}
                  />
                ) : null}
                <rect
                  x={p.x - NODE_W / 2}
                  y={p.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={10}
                  fill={style.fill}
                  stroke={focused ? "var(--viz-active)" : "var(--border)"}
                  strokeWidth={focused ? 2.5 : 1.25}
                  style={{ transition: "fill 320ms ease, stroke 320ms ease" }}
                />
                <text
                  x={p.x}
                  y={p.y + 5}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight={650}
                  fill={style.text}
                  style={{ transition: "fill 320ms ease" }}
                >
                  {n.label}
                </text>
                {n.result !== undefined ? (
                  <text x={p.x} y={p.y + NODE_H / 2 + 15} textAnchor="middle" fontSize="12" fontWeight={700} fill="var(--success)">
                    → {n.result}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {collections?.length ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {collections.map((c) => (
            <div key={c.label} className="rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{c.label}</p>
              <div className="flex min-h-8 flex-wrap items-center gap-1.5">
                {c.items.length ? (
                  c.items.map((item, i) => (
                    <span
                      key={`${item}-${i}`}
                      className="inline-flex h-7 items-center rounded-[8px] bg-[var(--violet-soft)] px-2.5 text-[12.5px] font-semibold text-[var(--violet)]"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-[12.5px] text-[var(--text-subtle)]">empty</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
