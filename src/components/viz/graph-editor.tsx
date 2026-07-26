"use client";

import * as React from "react";
import { CircleDot, Dices, Minus, MousePointer2, Pencil, Plus, RotateCcw, Spline, Trash2, TriangleAlert } from "lucide-react";

import type { GraphSpec } from "@/lib/engine/types";
import {
  MAX_EDGES,
  MAX_NODES,
  MAX_WEIGHT,
  MIN_WEIGHT,
  addEdge,
  addNode,
  defaultCustomGraph,
  hasEdge,
  moveNode,
  nextNodeId,
  removeEdge,
  removeNode,
  setEdgeWeight,
  setStart,
  unreachableNodes,
} from "@/lib/engine/graph-edit";
import {
  DEFAULT_RECIPE,
  DENSITIES,
  MAX_RANDOM_NODES,
  MIN_RANDOM_NODES,
  type DensityId,
  type RandomGraphRecipe,
} from "@/lib/engine/graph-gen";
import type { GraphSource } from "@/lib/store/schema";
import { Button } from "@/components/ui/button";
import { Segmented, Slider } from "@/components/ui/controls";
import { graphScale } from "./graph-view";
import { cn } from "@/lib/cn";

const W = 820;
const H = 500;
const PAD = 46;

type Tool = "select" | "node" | "edge";

const TOOLS: { id: Tool; label: string; hint: string; icon: React.ElementType }[] = [
  { id: "select", label: "Select", hint: "Drag nodes to move them. Click a node to set the source or delete it.", icon: MousePointer2 },
  { id: "node", label: "Add node", hint: "Click anywhere on the canvas to drop a new node.", icon: Plus },
  { id: "edge", label: "Add edge", hint: "Click one node, then another, to connect them.", icon: Spline },
];

/** normalized (0–1) → svg user units, matching GraphViewRenderer exactly */
const toX = (x: number) => PAD + x * (W - PAD * 2);
const toY = (y: number) => PAD + y * (H - PAD * 2);

export function GraphEditor({
  graph,
  source,
  onChange,
}: {
  graph: GraphSpec;
  source: GraphSource;
  onChange: (source: GraphSource) => void;
}) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [tool, setTool] = React.useState<Tool>("select");
  const [mode, setMode] = React.useState<"draw" | "random">(source?.kind === "random" ? "random" : "draw");
  const [recipe, setRecipe] = React.useState<RandomGraphRecipe>(
    source?.kind === "random" ? source.recipe : DEFAULT_RECIPE,
  );

  const { r: R } = graphScale(graph.nodes.length);
  /** Hand-edit tools only make sense — and only fit in the cookie — on small graphs. */
  const tooLargeToEdit = graph.nodes.length > MAX_NODES;

  const emitGraph = (next: GraphSpec) => onChange({ kind: "custom", graph: next });

  const applyRecipe = (patch: Partial<RandomGraphRecipe>) => {
    const next = { ...recipe, ...patch };
    setRecipe(next);
    onChange({ kind: "random", recipe: next });
  };

  const [selected, setSelected] = React.useState<string | null>(null);
  const [edgeFrom, setEdgeFrom] = React.useState<string | null>(null);
  const [editingEdge, setEditingEdge] = React.useState<string | null>(null);
  const dragRef = React.useRef<{ id: string; moved: boolean } | null>(null);

  const orphans = React.useMemo(() => unreachableNodes(graph), [graph]);
  const nodeFull = graph.nodes.length >= MAX_NODES;
  const edgeFull = graph.edges.length >= MAX_EDGES;

  /** Converts a pointer event into normalized graph coordinates. */
  const pointTo01 = (e: React.PointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    return { x: (px - PAD) / (W - PAD * 2), y: (py - PAD) / (H - PAD * 2) };
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (mode === "random" || tool !== "node" || nodeFull || tooLargeToEdit) return;
    const { x, y } = pointTo01(e);
    emitGraph(addNode(graph, x, y));
  };

  const handleNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();

    // On a generated graph the only edit that keeps it a recipe is the source.
    if (mode === "random") {
      const index = graph.nodes.findIndex((n) => n.id === id);
      if (index >= 0) applyRecipe({ startIndex: index });
      return;
    }

    if (tooLargeToEdit && tool !== "select") return;

    if (tool === "edge") {
      if (!edgeFrom) {
        setEdgeFrom(id);
      } else if (edgeFrom === id) {
        setEdgeFrom(null);
      } else {
        if (!hasEdge(graph, edgeFrom, id) && !edgeFull) emitGraph(addEdge(graph, edgeFrom, id, 1));
        setEdgeFrom(null);
      }
      return;
    }

    if (tool === "select") {
      dragRef.current = { id, moved: false };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || mode === "random") return;
    const { x, y } = pointTo01(e);
    drag.moved = true;
    emitGraph(moveNode(graph, drag.id, x, y));
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    // A press without movement is a click, which selects rather than moves.
    if (drag && !drag.moved) setSelected((prev) => (prev === drag.id ? null : drag.id));
  };

  const selectedNode = selected ? graph.nodes.find((n) => n.id === selected) : null;
  const activeTool = TOOLS.find((t) => t.id === tool)!;

  return (
    <div className="flex flex-col gap-4">
      {/* mode switch */}
      <Segmented
        value={mode}
        onChange={(m) => {
          setMode(m);
          setSelected(null);
          setEdgeFrom(null);
          setEditingEdge(null);
          if (m === "random") onChange({ kind: "random", recipe });
        }}
        options={[
          {
            value: "draw" as const,
            label: (
              <>
                <Pencil className="h-4 w-4" /> Draw it yourself
              </>
            ),
          },
          {
            value: "random" as const,
            label: (
              <>
                <Dices className="h-4 w-4" /> Generate random
              </>
            ),
          },
        ]}
        className="max-w-[420px]"
      />

      {mode === "random" ? (
        <div className="grid gap-5 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-5 sm:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-[13.5px] font-semibold text-[var(--text)]">Nodes</p>
              <p className="font-display text-[17px] font-extrabold tabular-nums text-[var(--primary)]">
                {recipe.nodeCount}
              </p>
            </div>
            <Slider
              aria-label="Number of nodes"
              value={recipe.nodeCount}
              min={MIN_RANDOM_NODES}
              max={MAX_RANDOM_NODES}
              onChange={(v) => applyRecipe({ nodeCount: v, startIndex: Math.min(recipe.startIndex, v - 1) })}
              className="mt-3"
            />
            <div className="mt-1 flex justify-between text-[12px] text-[var(--text-subtle)]">
              <span>{MIN_RANDOM_NODES}</span>
              <span>{MAX_RANDOM_NODES}</span>
            </div>
          </div>

          <div>
            <p className="text-[13.5px] font-semibold text-[var(--text)]">Density</p>
            <Segmented
              className="mt-3"
              value={recipe.density}
              onChange={(d) => applyRecipe({ density: d as DensityId })}
              options={DENSITIES.map((d) => ({ value: d.id as DensityId, label: d.label }))}
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <Button onClick={() => applyRecipe({ seed: Math.floor(Math.random() * 999_999) })}>
              <Dices className="h-[18px] w-[18px]" />
              Generate new graph
            </Button>
            <Button
              variant="secondary"
              onClick={() => applyRecipe({ startIndex: (recipe.startIndex + 1) % recipe.nodeCount })}
            >
              <CircleDot className="h-4 w-4" />
              Source: {graph.start}
            </Button>
            <p className="text-[12.5px] tabular-nums text-[var(--text-subtle)]">
              {graph.nodes.length} nodes · {graph.edges.length} edges · always connected
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex gap-1 rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface-2)] p-1">
              {TOOLS.map((t) => {
                const active = tool === t.id;
                const disabled =
                  tooLargeToEdit || (t.id === "node" && nodeFull) || (t.id === "edge" && edgeFull);
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={disabled}
                    aria-pressed={active}
                    onClick={() => {
                      setTool(t.id);
                      setEdgeFrom(null);
                      setSelected(null);
                    }}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 rounded-[9px] px-3 text-[13px] font-semibold transition-colors disabled:opacity-40",
                      active
                        ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-[var(--shadow-xs)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]",
                    )}
                  >
                    <t.icon className="h-4 w-4" strokeWidth={2} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <span className="text-[12.5px] tabular-nums text-[var(--text-subtle)]">
              {graph.nodes.length}/{MAX_NODES} nodes · {graph.edges.length}/{MAX_EDGES} edges
            </span>

            <Button
              variant="secondary"
              size="sm"
              className="ml-auto"
              onClick={() => onChange({ kind: "custom", graph: defaultCustomGraph() })}
            >
              <RotateCcw className="h-4 w-4" />
              Reset graph
            </Button>
          </div>

          <p className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
            <activeTool.icon className="h-4 w-4 shrink-0 text-[var(--primary)]" strokeWidth={2} />
            {tooLargeToEdit
              ? `This graph has ${graph.nodes.length} nodes — drawing tools work up to ${MAX_NODES}. Reset, or switch to Generate random.`
              : edgeFrom
                ? `Connecting from ${edgeFrom} — click a second node.`
                : activeTool.hint}
          </p>
        </>
      )}

      {/* canvas */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={cn(
            "surface-grid h-[clamp(280px,46vh,460px)] w-full touch-none",
            mode === "random" ? "cursor-pointer" : tool === "node" && "cursor-copy",
            mode === "draw" && tool === "edge" && "cursor-crosshair",
          )}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          role="application"
          aria-label="Graph editor canvas"
        >
          {graph.edges.map((e) => {
            const a = graph.nodes.find((n) => n.id === e.from);
            const b = graph.nodes.find((n) => n.id === e.to);
            if (!a || !b) return null;
            const key = `${e.from}-${e.to}`;
            const x1 = toX(a.x);
            const y1 = toY(a.y);
            const x2 = toX(b.x);
            const y2 = toY(b.y);
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            const editing = editingEdge === key;

            return (
              <g key={key}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={editing ? "var(--primary)" : "var(--border-strong)"}
                  strokeWidth={editing ? 3.5 : 2.5}
                  strokeLinecap="round"
                />
                <g
                  className="cursor-pointer"
                  onPointerDown={(ev) => {
                    ev.stopPropagation();
                    setEditingEdge(editing ? null : key);
                  }}
                >
                  <rect
                    x={mx - 17}
                    y={my - 13}
                    width={34}
                    height={26}
                    rx={8}
                    fill="var(--surface)"
                    stroke={editing ? "var(--primary)" : "var(--border)"}
                    strokeWidth={editing ? 2 : 1.25}
                  />
                  <text
                    x={mx}
                    y={my + 5}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight={700}
                    fill={editing ? "var(--primary)" : "var(--text-muted)"}
                  >
                    {e.weight ?? 1}
                  </text>
                </g>
              </g>
            );
          })}

          {graph.nodes.map((n) => {
            const isStart = graph.start === n.id;
            const isSelected = selected === n.id;
            const isPending = edgeFrom === n.id;
            const isOrphan = orphans.includes(n.id);

            return (
              <g
                key={n.id}
                className={cn(tool === "select" ? "cursor-grab" : "cursor-pointer")}
                onPointerDown={(e) => handleNodePointerDown(e, n.id)}
              >
                {isSelected || isPending ? (
                  <circle cx={toX(n.x)} cy={toY(n.y)} r={R + 8} fill="var(--primary)" opacity={0.18} />
                ) : null}
                <circle
                  cx={toX(n.x)}
                  cy={toY(n.y)}
                  r={R}
                  fill={isStart ? "var(--primary)" : isOrphan ? "var(--surface-sunken)" : "var(--viz-idle)"}
                  stroke={
                    isSelected || isPending
                      ? "var(--primary)"
                      : isOrphan
                        ? "var(--warning)"
                        : "var(--border-strong)"
                  }
                  strokeWidth={isSelected || isPending ? 3 : isOrphan ? 2.5 : 1.5}
                  strokeDasharray={isOrphan ? "4 3" : undefined}
                />
                <text
                  x={toX(n.x)}
                  y={toY(n.y) + 6}
                  textAnchor="middle"
                  fontSize="17"
                  fontWeight={700}
                  fill={isStart ? "#ffffff" : "var(--text)"}
                  style={{ pointerEvents: "none" }}
                >
                  {n.id}
                </text>
                {isStart ? (
                  <text
                    x={toX(n.x)}
                    y={toY(n.y) + R + 17}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight={700}
                    fill="var(--primary)"
                    style={{ pointerEvents: "none" }}
                  >
                    SOURCE
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {mode === "random" ? (
          <p className="absolute inset-x-0 bottom-0 bg-[var(--surface)] px-4 py-2 text-center text-[12.5px] text-[var(--text-muted)]">
            Click any node to make it the source. Switch to <span className="font-semibold">Draw it yourself</span> to
            edit nodes and weights by hand.
          </p>
        ) : tool === "node" && nodeFull ? (
          <p className="absolute inset-x-0 bottom-0 bg-[var(--warning-soft)] px-4 py-2 text-center text-[12.5px] font-medium text-[var(--warning)]">
            Node limit reached ({MAX_NODES}). Delete one to add another.
          </p>
        ) : null}
      </div>

      {/* contextual panels */}
      {mode === "draw" && selectedNode ? (
        <div className="animate-fade-up flex flex-wrap items-center gap-3 rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[13px] font-bold text-[var(--primary)]">
            {selectedNode.id}
          </span>
          <span className="text-[13.5px] text-[var(--text-muted)]">
            {graph.start === selectedNode.id ? "This is the source node." : "Node selected."}
          </span>
          <div className="ml-auto flex gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={graph.start === selectedNode.id}
              onClick={() => emitGraph(setStart(graph, selectedNode.id))}
            >
              <CircleDot className="h-4 w-4" />
              Set as source
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={graph.nodes.length <= 1}
              onClick={() => {
                emitGraph(removeNode(graph, selectedNode.id));
                setSelected(null);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete node
            </Button>
          </div>
        </div>
      ) : null}

      {mode === "draw" && editingEdge ? (
        (() => {
          const [from, to] = editingEdge.split("-");
          const edge = graph.edges.find((e) => e.from === from && e.to === to);
          if (!edge) return null;
          const weight = edge.weight ?? 1;
          return (
            <div className="animate-fade-up flex flex-wrap items-center gap-3 rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <span className="text-[13.5px] font-semibold text-[var(--text)]">
                Edge {from} — {to}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Decrease weight"
                  disabled={weight <= MIN_WEIGHT}
                  onClick={() => emitGraph(setEdgeWeight(graph, from, to, weight - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <input
                  type="number"
                  aria-label="Edge weight"
                  value={weight}
                  min={MIN_WEIGHT}
                  max={MAX_WEIGHT}
                  onChange={(e) => emitGraph(setEdgeWeight(graph, from, to, Number(e.target.value)))}
                  className="h-9 w-16 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] text-center text-sm font-semibold tabular-nums text-[var(--text)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Increase weight"
                  disabled={weight >= MAX_WEIGHT}
                  onClick={() => emitGraph(setEdgeWeight(graph, from, to, weight + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  emitGraph(removeEdge(graph, from, to));
                  setEditingEdge(null);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete edge
              </Button>
            </div>
          );
        })()
      ) : null}

      {orphans.length ? (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-field)] border border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[var(--warning-soft)] px-4 py-3 text-[13px] text-[var(--text-muted)]">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" strokeWidth={2} />
          <span>
            <span className="font-semibold text-[var(--text)]">{orphans.join(", ")}</span>{" "}
            {orphans.length === 1 ? "has" : "have"} no path from {graph.start}, so Dijkstra will leave{" "}
            {orphans.length === 1 ? "it" : "them"} at ∞. That is correct behaviour — connect{" "}
            {orphans.length === 1 ? "it" : "them"} with an edge to include {orphans.length === 1 ? "it" : "them"}.
          </span>
        </p>
      ) : null}

      {mode === "draw" && nextNodeId(graph) !== null ? (
        <p className="text-[12.5px] text-[var(--text-subtle)]">
          Next node will be labelled <span className="font-semibold text-[var(--text-muted)]">{nextNodeId(graph)}</span>.
          Weights are capped at {MAX_WEIGHT}; negative weights are not allowed because Dijkstra requires non-negative
          edges.
        </p>
      ) : null}
    </div>
  );
}
