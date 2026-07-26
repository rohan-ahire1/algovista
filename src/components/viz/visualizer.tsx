"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Pencil,
  Shuffle,
  SkipBack,
  SkipForward,
  Sliders,
} from "lucide-react";

import { ALGORITHMS, getAlgorithm } from "@/lib/algorithms";
import { buildInput, isEditableGraph, resolveGraphSource, usesArrayControls } from "@/lib/engine/input";
import { defaultCustomGraph } from "@/lib/engine/graph-edit";
import { MAX_RANDOM_NODES } from "@/lib/engine/graph-gen";
import { GraphEditor } from "./graph-editor";
import { useAppStore } from "@/lib/store/app-store";
import { Card } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/controls";
import { Icon } from "@/components/icon";
import { Legend, Stage } from "./stage";
import { usePlayer, usePlayerKeys } from "./use-player";
import { cn } from "@/lib/cn";

export function Visualizer({ slug }: { slug: string }) {
  const router = useRouter();
  const { settings, setSettings, markExplored, markCompleted, recordActivity } = useAppStore();

  // The registry lives on the client too, so only the slug has to cross the
  // server/client boundary — an Algorithm carries a generate() function, which
  // is not serializable.
  const algorithm = getAlgorithm(slug)!;
  const editable = isEditableGraph(algorithm);
  const [editing, setEditing] = React.useState(false);
  const workingGraph = resolveGraphSource(settings.graphSource) ?? defaultCustomGraph();

  const frames = React.useMemo(
    () => algorithm.generate(buildInput(algorithm, settings)),
    [algorithm, settings],
  );

  const onFinish = React.useCallback(() => {
    markCompleted(algorithm.slug);
    recordActivity({
      slug: algorithm.slug,
      title: algorithm.name,
      detail: `Visualized · Completed all ${frames.length} steps`,
    });
  }, [algorithm.slug, algorithm.name, frames.length, markCompleted, recordActivity]);

  const { index, playing, total, frame, controls, atEnd } = usePlayer(frames, settings.speed, onFinish);
  usePlayerKeys(controls);

  React.useEffect(() => {
    markExplored(algorithm.slug);
  }, [algorithm.slug, markExplored]);

  const stepListRef = React.useRef<HTMLOListElement>(null);
  React.useEffect(() => {
    const el = stepListRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [index]);

  const speedOptions = [
    { value: "25", label: "0.5x" },
    { value: "45", label: "0.75x" },
    { value: "60", label: "1.0x" },
    { value: "78", label: "1.5x" },
    { value: "92", label: "2.0x" },
  ];
  const nearestSpeed = speedOptions.reduce((best, o) =>
    Math.abs(Number(o.value) - settings.speed) < Math.abs(Number(best.value) - settings.speed) ? o : best,
  ).value;

  const segments = Math.min(total, 12);

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        {/* ------------------------------ stage ------------------------------ */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/algorithms/${algorithm.slug}`}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to algorithms
            </Link>

            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
                <Icon name={algorithm.icon} className="h-[18px] w-[18px]" />
              </span>
              <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-[var(--text)]">{algorithm.name}</h1>
              <Select
                aria-label="Switch algorithm"
                size="sm"
                value={algorithm.slug}
                onChange={(slug) => router.push(`/visualize/${slug}`)}
                options={ALGORITHMS.map((a) => ({ value: a.slug, label: a.name }))}
                className="w-[190px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-medium text-[var(--text-muted)]">Speed</span>
              <Select
                aria-label="Playback speed"
                size="sm"
                value={nearestSpeed}
                onChange={(v) => setSettings({ speed: Number(v) })}
                options={speedOptions}
                className="w-[92px]"
              />
            </div>
          </div>

          {/* progress */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-[15px] font-semibold text-[var(--text)]">
              Step <span className="text-[var(--primary)]">{index + 1}</span>{" "}
              <span className="font-medium text-[var(--text-muted)]">of {total}</span>
            </p>
            <p className="text-[13px] text-[var(--text-subtle)]">{frame.phase}</p>
          </div>
          <div className="mt-2.5 flex gap-1.5" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
            {Array.from({ length: segments }).map((_, i) => {
              const reached = (i + 1) / segments <= (index + 1) / total;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Jump to ${Math.round(((i + 0.5) / segments) * total)} of ${total}`}
                  onClick={() => controls.seek(Math.floor(((i + 0.5) / segments) * total))}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    reached ? "bg-[var(--primary)]" : "bg-[var(--surface-sunken)] hover:bg-[var(--border-strong)]",
                  )}
                  style={reached ? { opacity: 0.45 + 0.55 * ((i + 1) / segments) } : undefined}
                />
              );
            })}
          </div>

          <Card className="mt-5 p-5 sm:p-7">
            {editing ? (
              <>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[17px] font-bold text-[var(--text)]">Edit the graph</h2>
                    <p className="mt-0.5 text-[13.5px] text-[var(--text-muted)]">
                      Draw a graph by hand, or generate one with up to {MAX_RANDOM_NODES} nodes. Every change re-runs
                      Dijkstra immediately and is saved in this browser.
                    </p>
                  </div>
                  <Button onClick={() => setEditing(false)}>
                    <Play className="h-[18px] w-[18px]" />
                    Run the visualization
                  </Button>
                </div>
                <GraphEditor
                  graph={workingGraph}
                  source={settings.graphSource}
                  onChange={(graphSource) => setSettings({ graphSource })}
                />
              </>
            ) : (
              <>
                <Stage frame={frame} animation={settings.animation} />
                <div className="mt-6">
                  <Legend items={algorithm.legend} />
                </div>

            {/* transport */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              <Button variant="secondary" size="icon" aria-label="Jump to start" onClick={controls.first}>
                <SkipBack className="h-[18px] w-[18px]" />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Previous step" onClick={controls.prev} disabled={index === 0}>
                <ChevronLeft className="h-[18px] w-[18px]" />
              </Button>
              <button
                type="button"
                onClick={controls.toggle}
                aria-label={playing ? "Pause" : atEnd ? "Replay" : "Play"}
                className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[var(--primary)] text-[var(--on-primary)] shadow-[var(--shadow-primary)] transition-transform duration-200 ease-[var(--ease-out-quint)] hover:scale-105 active:scale-95"
              >
                {playing ? (
                  <Pause className="h-6 w-6" fill="currentColor" />
                ) : atEnd ? (
                  <RotateCcw className="h-6 w-6" />
                ) : (
                  <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                )}
              </button>
              <Button variant="secondary" size="icon" aria-label="Next step" onClick={controls.next} disabled={atEnd}>
                <ChevronRight className="h-[18px] w-[18px]" />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Jump to end" onClick={controls.end}>
                <SkipForward className="h-[18px] w-[18px]" />
              </Button>

              <div className="ml-2 flex items-center gap-2">
                {usesArrayControls(algorithm) ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSettings({ seed: Math.floor(Math.random() * 9000) + 100 })}
                  >
                    <Shuffle className="h-4 w-4" />
                    New array
                  </Button>
                ) : null}
                {editable ? (
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4" />
                    Edit graph
                  </Button>
                ) : null}
                <ButtonLink href="/settings" variant="ghost" size="sm">
                  <Sliders className="h-4 w-4" />
                  Controls
                </ButtonLink>
              </div>
            </div>
              </>
            )}
          </Card>

          {/* metrics */}
          <Card className="mt-4 flex flex-wrap items-center gap-y-4 p-4 sm:p-5">
            {algorithm.metrics.map((m) => (
              <div key={m.key} className="flex min-w-[150px] flex-1 items-center gap-3 border-[var(--border)] px-2 sm:border-r sm:last:border-r-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[var(--surface-sunken)] text-[var(--primary)]">
                  <Icon name={m.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] text-[var(--text-muted)]">{m.label}</span>
                  <span className="block truncate font-display text-[19px] font-extrabold tabular-nums text-[var(--text)]">
                    {frame.metrics[m.key] ?? "—"}
                  </span>
                </span>
              </div>
            ))}
            <div className="flex min-w-[150px] flex-1 items-center gap-3 border-[var(--border)] px-2 sm:border-r">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[var(--surface-sunken)] text-[var(--primary)]">
                <Icon name="Layers" className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] text-[var(--text-muted)]">Time Complexity</span>
                <span className="block font-display text-[19px] font-extrabold text-[var(--text)]">
                  {algorithm.complexity.average}
                </span>
              </span>
            </div>
            <div className="flex min-w-[150px] flex-1 items-center gap-3 px-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[var(--surface-sunken)] text-[var(--primary)]">
                <Icon name="Boxes" className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] text-[var(--text-muted)]">Space Complexity</span>
                <span className="block font-display text-[19px] font-extrabold text-[var(--text)]">
                  {algorithm.complexity.space}
                </span>
              </span>
            </div>
          </Card>
        </div>

        {/* ---------------------------- right rail --------------------------- */}
        <aside className="grid content-start gap-4">
          <Card className="border-[color-mix(in_srgb,var(--primary)_25%,var(--border))] p-5">
            <p className="flex items-center gap-2 text-[15px] font-bold text-[var(--text)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
              Current Step
            </p>
            <div className="mt-3.5 rounded-[var(--radius-field)] bg-[var(--primary-soft)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14.5px] font-bold text-[var(--primary)]">{frame.title}</span>
                {frame.chips?.map((c) => (
                  <span
                    key={c}
                    className="rounded-[7px] bg-[var(--surface)] px-2 py-1 text-[11.5px] font-semibold text-[var(--text-muted)]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{frame.detail}</p>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[15px] font-bold text-[var(--text)]">Algorithm Steps</p>
            <ol ref={stepListRef} className="av-scroll mt-3.5 max-h-[340px] overflow-y-auto pr-1">
              {frames.map((f, i) => {
                const done = i < index;
                const active = i === index;
                return (
                  <li
                    key={i}
                    data-active={active}
                    className={cn(
                      "mb-1 flex items-start gap-3 rounded-[11px] px-3 py-2.5 transition-colors",
                      active ? "bg-[var(--primary-soft)]" : "hover:bg-[var(--surface-sunken)]",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => controls.seek(i)}
                      className="flex flex-1 items-start gap-3 text-left"
                      aria-current={active ? "step" : undefined}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                          active
                            ? "bg-[var(--primary)] text-[var(--on-primary)]"
                            : done
                              ? "bg-[var(--success)] text-white"
                              : "bg-[var(--surface-sunken)] text-[var(--text-subtle)]",
                        )}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block text-[13.5px] font-semibold leading-snug",
                            active ? "text-[var(--primary)]" : done ? "text-[var(--text)]" : "text-[var(--text-muted)]",
                          )}
                        >
                          {f.title}
                        </span>
                        {active ? (
                          <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--text-muted)]">
                            {f.detail}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card className="bg-[var(--primary-soft)] p-5">
            <p className="flex items-center gap-2 text-[14.5px] font-bold text-[var(--text)]">
              <Lightbulb className="h-[18px] w-[18px] text-[var(--primary)]" strokeWidth={2} />
              How {algorithm.name} works
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{algorithm.summary}</p>
          </Card>

          <Link
            href={`/algorithms/${algorithm.slug}/code`}
            className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
          >
            <Code2 className="h-[18px] w-[18px] text-[var(--primary)]" />
            <span className="flex-1 text-[14.5px] font-semibold text-[var(--text)]">View Pseudocode</span>
            <ChevronRight className="h-4 w-4 text-[var(--text-subtle)] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <p className="px-1 text-center text-[12px] text-[var(--text-subtle)]">
            Shortcuts: <kbd className="font-semibold">Space</kbd> play/pause · <kbd className="font-semibold">←</kbd>{" "}
            <kbd className="font-semibold">→</kbd> step · <kbd className="font-semibold">/</kbd> search
          </p>
        </aside>
      </div>
    </div>
  );
}
