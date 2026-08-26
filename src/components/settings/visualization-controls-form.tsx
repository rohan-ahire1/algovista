"use client";

import * as React from "react";
import { Moon, RotateCcw, Shuffle, Sun } from "lucide-react";

import type { Algorithm } from "@/lib/engine/algorithm";
import type { ArrayPreset } from "@/lib/engine/helpers";
import type { AnimationStyle } from "@/lib/store/schema";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button-compat";
import { NumberField, Segmented, Select, Slider } from "@/components/ui/controls";
import { cn } from "@/lib/cn";

export function VisualizationControlsForm({
  className,
  algorithm,
}: {
  className?: string;
  algorithm?: Algorithm;
}) {
  const { settings, setSettings, resetSettings } = useAppStore();
  const inputKind = algorithm?.inputKind ?? "array";
  const hasArrayInput = inputKind === "array" || inputKind === "array-target";
  const recursionSize = Math.max(2, Math.min(8, Math.round(settings.arraySize / 2)));
  const itemCount = algorithm?.defaultInput?.items?.length ?? 0;
  const capacity = algorithm?.defaultInput?.capacity ?? 0;

  return (
    <div className={cn("space-y-7", className)}>
      {hasArrayInput ? (
        <Field label="Array Size">
          <div className="flex items-center gap-4">
            <NumberField
              aria-label="Array size"
              value={settings.arraySize}
              min={5}
              max={50}
              onChange={(v) => setSettings({ arraySize: v })}
              className="w-[104px]"
            />
            <div className="min-w-0 flex-1">
              <div className="relative">
                <span
                  className="absolute -top-5 -translate-x-1/2 text-[12.5px] font-semibold text-[var(--text)]"
                  style={{ left: `${((settings.arraySize - 5) / 45) * 100}%` }}
                >
                  {settings.arraySize}
                </span>
                <Slider
                  aria-label="Array size slider"
                  value={settings.arraySize}
                  min={5}
                  max={50}
                  onChange={(v) => setSettings({ arraySize: v })}
                />
              </div>
              <div className="mt-1 flex justify-between text-[12px] text-[var(--text-subtle)]">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
          </div>
        </Field>
      ) : inputKind === "number" ? (
        <Field label="Problem Size">
          <div className="flex items-center gap-4">
            <NumberField
              aria-label="Problem size"
              value={recursionSize}
              min={2}
              max={8}
              onChange={(v) => setSettings({ arraySize: v * 2 })}
              className="w-[104px]"
            />
            <div className="min-w-0 flex-1">
              <div className="relative">
                <span
                  className="absolute -top-5 -translate-x-1/2 text-[12.5px] font-semibold text-[var(--text)]"
                  style={{ left: `${((recursionSize - 2) / 6) * 100}%` }}
                >
                  {recursionSize}
                </span>
                <Slider
                  aria-label="Problem size slider"
                  value={recursionSize}
                  min={2}
                  max={8}
                  onChange={(v) => setSettings({ arraySize: v * 2 })}
                />
              </div>
              <div className="mt-1 flex justify-between text-[12px] text-[var(--text-subtle)]">
                <span>2</span>
                <span>8</span>
              </div>
            </div>
          </div>
        </Field>
      ) : inputKind === "knapsack" ? (
        <Field label="Problem Input">
          <div className="rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3">
            <p className="text-[13.5px] font-semibold text-[var(--text)]">{itemCount} items · capacity {capacity}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
              The demo uses a fixed item set so you can focus on how the DP table is filled.
            </p>
          </div>
        </Field>
      ) : (
        <Field label="Graph Input">
          <div className="rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3">
            <p className="text-[13.5px] font-semibold text-[var(--text)]">
              {inputKind === "graph-weighted" ? "Weighted network" : "Traversal graph"}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
              {inputKind === "graph-weighted"
                ? "Use Edit graph beside the visualizer to change nodes, edges, and weights."
                : "This visualization uses its built-in graph preset."}
            </p>
          </div>
        </Field>
      )}

      <Field label="Speed">
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-[var(--text-muted)]">Slow</span>
          <div className="relative min-w-0 flex-1">
            <span
              className="absolute -top-5 -translate-x-1/2 text-[12.5px] font-semibold text-[var(--text)]"
              style={{ left: `${settings.speed}%` }}
            >
              {settings.speed}%
            </span>
            <Slider
              aria-label="Speed"
              value={settings.speed}
              min={0}
              max={100}
              onChange={(v) => setSettings({ speed: v })}
            />
          </div>
          <span className="text-[13px] text-[var(--text-muted)]">Fast</span>
        </div>
      </Field>

      <Field label="Animation Style">
        <Select
          aria-label="Animation style"
          value={settings.animation}
          onChange={(v) => setSettings({ animation: v as AnimationStyle })}
          options={[
            { value: "smooth", label: "Smooth" },
            { value: "instant", label: "Instant" },
            { value: "bouncy", label: "Bouncy" },
          ]}
        />
      </Field>

      <Field label="Theme">
        <Segmented
          value={settings.theme}
          onChange={(v) => setSettings({ theme: v })}
          options={[
            {
              value: "light",
              label: (
                <>
                  <Sun className="h-[18px] w-[18px]" /> Light
                </>
              ),
            },
            {
              value: "dark",
              label: (
                <>
                  <Moon className="h-[18px] w-[18px]" /> Dark
                </>
              ),
            },
          ]}
        />
      </Field>

      {hasArrayInput ? (
        <Field label="Initial Array">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              aria-label="Initial array preset"
              value={settings.preset}
              onChange={(v) => setSettings({ preset: v as ArrayPreset })}
              options={[
                { value: "random", label: "Random" },
                { value: "sorted", label: "Sorted" },
                { value: "reversed", label: "Reversed" },
                { value: "nearly-sorted", label: "Nearly sorted" },
                { value: "few-unique", label: "Few unique" },
              ]}
              className="min-w-[190px] flex-1"
            />
            <Button
              variant="secondary"
              className="text-[var(--primary)]"
              onClick={() => setSettings({ seed: Math.floor(Math.random() * 9000) + 100 })}
            >
              <Shuffle className="h-4 w-4" />
              Generate New
            </Button>
          </div>
        </Field>
      ) : null}

      <Field label="Actions">
        <div className={cn("grid gap-3", hasArrayInput ? "grid-cols-2" : "grid-cols-1")}>
          <Button variant="secondary" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          {hasArrayInput ? (
            <Button
              variant="danger"
              onClick={() => setSettings({ seed: Math.floor(Math.random() * 9000) + 100, preset: "random" })}
            >
              <Shuffle className="h-4 w-4" />
              Randomize
            </Button>
          ) : null}
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[13.5px] font-semibold text-[var(--text)]">{label}</p>
      {children}
    </div>
  );
}
