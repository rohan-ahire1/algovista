"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Dices,
  Gauge,
  Grid3x3,
  Lightbulb,
  ListChecks,
  Play,
  RotateCcw,
  SkipForward,
  Sliders,
  Sparkles,
  Sun,
  Target,
  Waves,
} from "lucide-react";

import { getAlgorithm } from "@/lib/algorithms";
import { buildInput } from "@/lib/engine/input";
import { useAppStore } from "@/lib/store/app-store";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button-compat";
import { Legend, Stage } from "@/components/viz/stage";
import { usePlayer } from "@/components/viz/use-player";
import { VisualizationControlsForm } from "./visualization-controls-form";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/settings", label: "Visualization Controls", icon: Sliders, active: true },
  { href: "/visualize/merge-sort", label: "Algorithm Steps", icon: ListChecks },
  { href: "/algorithms/merge-sort/code", label: "Code View", icon: Code2 },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Target },
];

const ABOUT = [
  { icon: Grid3x3, title: "Array Size", text: "Changes the number of elements in the array." },
  { icon: Sun, title: "Theme", text: "Switch between light and dark themes." },
  { icon: Gauge, title: "Speed", text: "Controls how fast the algorithm runs." },
  { icon: Dices, title: "Initial Array", text: "Choose a preset or generate a new array." },
  { icon: Waves, title: "Animation Style", text: "Sets the type of transitions and movement." },
  { icon: RotateCcw, title: "Actions", text: "Reset to default or randomize the array." },
];

const PREVIEW_SLUG = "merge-sort";

export function SettingsScreen() {
  const { settings } = useAppStore();
  const algorithm = getAlgorithm(PREVIEW_SLUG)!;

  const frames = React.useMemo(
    () => algorithm.generate(buildInput(algorithm, settings)),
    [algorithm, settings],
  );
  const { frame, playing, controls, index, total } = usePlayer(frames, settings.speed);

  return (
    <div className="mx-auto flex w-full max-w-[1680px]">
      {/* sidebar */}
      <aside className="hidden w-[262px] shrink-0 border-r border-[var(--border)] px-4 py-8 lg:block">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">Controls</p>
        <nav className="mt-3 grid gap-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                n.active
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]",
              )}
            >
              <n.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              {n.label}
            </Link>
          ))}
        </nav>

        <Card className="mt-8 p-4">
          <Lightbulb className="h-5 w-5 text-[var(--warning)]" strokeWidth={1.9} />
          <p className="mt-2.5 text-[13.5px] font-semibold text-[var(--text)]">Tip</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
            Adjust the settings and see how they affect the visualization in real time.
          </p>
        </Card>
      </aside>

      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="text-[clamp(1.7rem,3vw,2.15rem)] font-extrabold tracking-[-0.03em] text-[var(--text)]">
          Visualization Controls
        </h1>
        <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
          Customize how the algorithm visualization looks and behaves.
        </p>

        <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,470px)_minmax(0,1fr)]">
          {/* form */}
          <Card className="p-6">
            <VisualizationControlsForm />
          </Card>

          {/* preview */}
          <div className="grid content-start gap-5">
            <Card className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[16px] font-bold text-[var(--text)]">Live Preview</h2>
                  <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[12px] font-semibold text-[var(--primary)]">
                    {algorithm.name}
                  </span>
                  <span className="text-[12.5px] text-[var(--text-subtle)]">
                    Step {index + 1} / {total}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="icon" aria-label={playing ? "Pause" : "Play"} onClick={controls.toggle}>
                    <Play className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="secondary" size="icon" aria-label="Next step" onClick={controls.next}>
                    <SkipForward className="h-[18px] w-[18px]" />
                  </Button>
                  <Button variant="secondary" size="icon" aria-label="Restart" onClick={controls.first}>
                    <RotateCcw className="h-[18px] w-[18px]" />
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <Stage frame={frame} animation={settings.animation} />
              </div>
              <div className="mt-5">
                <Legend items={algorithm.legend} />
              </div>
            </Card>

            <Card className="bg-[var(--primary-soft)] p-5 sm:p-6">
              <p className="flex items-center gap-2 text-[16px] font-bold text-[var(--primary)]">
                <Lightbulb className="h-[18px] w-[18px]" strokeWidth={2} />
                About These Settings
              </p>
              <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {ABOUT.map((a) => (
                  <div key={a.title} className="flex items-start gap-3">
                    <a.icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[var(--primary)]" strokeWidth={1.9} />
                    <div>
                      <p className="text-[13.5px] font-semibold text-[var(--text)]">{a.title}</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--text-muted)]">{a.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-[13.5px] text-[var(--text-muted)]">
          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
          All changes apply in real time and help you explore algorithms better.
        </p>
      </div>
    </div>
  );
}
