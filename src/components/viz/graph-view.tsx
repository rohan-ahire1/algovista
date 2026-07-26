"use client";

import * as React from "react";
import type { GraphView, MarkKind } from "@/lib/engine/types";
import { edgeKey } from "@/lib/engine/helpers";
import { MARK_STYLES } from "./marks";

const W = 820;
const H = 500;
const PAD = 46;

/**
 * Nodes shrink as the graph grows so a 100-node graph stays legible in the same
 * canvas. Below these thresholds the per-node captions and per-edge weight
 * chips would overlap into noise, so they are dropped rather than crowded.
 */
export function graphScale(nodeCount: number) {
  const r = Math.max(11, Math.min(25, Math.round(120 / Math.sqrt(Math.max(1, nodeCount)))));
  return {
    r,
    labelSize: Math.max(9, Math.round(r * 0.68)),
    showNodeLabels: nodeCount <= 60,
    showWeights: nodeCount <= 32,
    strokeScale: r / 25,
  };
}

/** Long queues are truncated — a hundred chips is not information. */
const MAX_CHIPS = 14;

const EDGE_COLOR: Partial<Record<MarkKind, string>> = {
  path: "var(--primary)",
  discarded: "var(--viz-discarded)",
};

export function GraphViewRenderer({ view, compact = false }: { view: GraphView; compact?: boolean }) {
  const { nodes, edges, directed, nodeMarks, edgeMarks, nodeLabels, collections } = view;

  const { r: R, labelSize, showNodeLabels, showWeights, strokeScale } = graphScale(nodes.length);

  const pos = React.useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      map[n.id] = { x: PAD + n.x * (W - PAD * 2), y: PAD + n.y * (H - PAD * 2) };
    });
    return map;
  }, [nodes]);

  return (
    <div className="flex w-full flex-col gap-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={compact ? "h-44 w-full" : "h-[clamp(240px,42vh,420px)] w-full"}
        role="img"
        aria-label="Graph visualization"
      >
        <defs>
          <marker id="av-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
          </marker>
          <marker id="av-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
          </marker>
        </defs>

        {edges.map((e) => {
          const a = pos[e.from];
          const b = pos[e.to];
          if (!a || !b) return null;
          const mark = edgeMarks[edgeKey(e.from, e.to, directed)];
          const stroke = (mark && EDGE_COLOR[mark]) ?? "var(--border-strong)";
          const active = mark === "path";

          // stop the line at the node boundary so arrowheads sit outside the circle
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const x1 = a.x + ux * R;
          const y1 = a.y + uy * R;
          const x2 = b.x - ux * (R + (directed ? 6 : 0));
          const y2 = b.y - uy * (R + (directed ? 6 : 0));

          return (
            <g key={`${e.from}-${e.to}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={stroke}
                strokeWidth={(active ? 3.5 : 2) * Math.max(0.55, strokeScale)}
                strokeLinecap="round"
                markerEnd={directed ? (active ? "url(#av-arrow-active)" : "url(#av-arrow)") : undefined}
                style={{ transition: "stroke 300ms ease, stroke-width 300ms ease" }}
              />
              {e.weight !== undefined && showWeights ? (
                <g>
                  <rect
                    x={(x1 + x2) / 2 - 15}
                    y={(y1 + y2) / 2 - 12}
                    width={30}
                    height={22}
                    rx={7}
                    fill="var(--surface)"
                    stroke={active ? "var(--primary)" : "var(--border)"}
                    style={{ transition: "stroke 300ms ease" }}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 + 3}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight={600}
                    fill={active ? "var(--primary)" : "var(--text-muted)"}
                  >
                    {e.weight}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}

        {nodes.map((n) => {
          const style = MARK_STYLES[nodeMarks[n.id] ?? "idle"];
          const p = pos[n.id];
          const focused = nodeMarks[n.id] === "active";
          return (
            <g key={n.id} style={{ transition: "transform 300ms var(--ease-out-quint)" }}>
              {focused ? (
                <circle cx={p.x} cy={p.y} r={R + 8} fill="var(--viz-active)" opacity={0.18} />
              ) : null}
              <circle
                cx={p.x}
                cy={p.y}
                r={R}
                fill={style.fill}
                stroke={focused ? "var(--viz-active)" : "var(--border)"}
                strokeWidth={(focused ? 3 : 1.5) * Math.max(0.6, strokeScale)}
                style={{ transition: "fill 320ms ease, stroke 320ms ease" }}
              >
                {showNodeLabels ? null : <title>{n.id}</title>}
              </circle>
              {showNodeLabels ? (
                <text
                  x={p.x}
                  y={p.y + labelSize * 0.36}
                  textAnchor="middle"
                  fontSize={labelSize}
                  fontWeight={700}
                  fill={style.text}
                  style={{ transition: "fill 320ms ease", pointerEvents: "none" }}
                >
                  {n.id}
                </text>
              ) : null}
              {nodeLabels?.[n.id] && showWeights ? (
                <text x={p.x} y={p.y + R + 15} textAnchor="middle" fontSize="12" fontWeight={600} fill="var(--text-muted)">
                  {nodeLabels[n.id]}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {collections?.length ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {collections.map((c) => (
            <div key={c.label} className="rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{c.label}</p>
              <div className="flex min-h-8 flex-wrap items-center gap-1.5">
                {c.items.length ? (
                  c.items.slice(0, MAX_CHIPS).map((item, i) => (
                    <span
                      key={`${item}-${i}`}
                      className="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[12.5px] font-semibold"
                      style={{
                        background:
                          c.tone === "mint"
                            ? "var(--success-soft)"
                            : c.tone === "violet"
                              ? "var(--violet-soft)"
                              : "var(--primary-soft)",
                        color: c.tone === "mint" ? "var(--success)" : c.tone === "violet" ? "var(--violet)" : "var(--primary)",
                      }}
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-[12.5px] text-[var(--text-subtle)]">empty</span>
                )}
                {c.items.length > MAX_CHIPS ? (
                  <span className="text-[12px] font-medium text-[var(--text-subtle)]">
                    +{c.items.length - MAX_CHIPS} more
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
