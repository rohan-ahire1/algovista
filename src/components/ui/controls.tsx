"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------- Slider --------------------------------- */

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("relative flex h-5 w-full items-center", className)}>
      <div className="absolute inset-x-0 h-1.5 rounded-full bg-[var(--surface-sunken)]" />
      <div
        className="pointer-events-none absolute h-1.5 rounded-full bg-[var(--primary)]"
        style={{ width: `${pct}%` }}
      />
      <div
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-[var(--primary)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-transform duration-150 ease-[var(--ease-out-quint)]"
        style={{ left: `${pct}%` }}
      />
      <input
        type="range"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent"
      />
    </div>
  );
}

/* ------------------------------- Select --------------------------------- */

export function Select({
  value,
  onChange,
  options,
  className,
  size = "md",
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full cursor-pointer appearance-none rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface)] pr-9 font-medium text-[var(--text)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--border-strong)]",
          size === "sm" ? "h-9 pl-3 text-[13px]" : "h-11 pl-4 text-sm",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
        strokeWidth={2}
      />
    </div>
  );
}

/* --------------------------- Number stepper ----------------------------- */

export function NumberField({
  value,
  min,
  max,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div
      className={cn(
        "flex h-11 items-center rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface)] pl-4 pr-1 shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      <input
        aria-label={ariaLabel}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="w-full bg-transparent text-sm font-medium text-[var(--text)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="flex flex-col">
        <button
          type="button"
          aria-label="Increase"
          onClick={() => onChange(clamp(value + 1))}
          className="flex h-4 w-6 items-center justify-center rounded-t text-[var(--text-subtle)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]"
        >
          <ChevronDown className="h-3 w-3 rotate-180" />
        </button>
        <button
          type="button"
          aria-label="Decrease"
          onClick={() => onChange(clamp(value - 1))}
          className="flex h-4 w-6 items-center justify-center rounded-b text-[var(--text-subtle)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Segmented control -------------------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-[var(--radius-field)] border text-sm font-medium transition-all duration-200 ease-[var(--ease-out-quint)]",
              active
                ? "border-transparent bg-[var(--primary)] text-[var(--on-primary)] shadow-[var(--shadow-primary)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Tabs ---------------------------------- */

export function Tabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center gap-7 border-b border-[var(--border)]", className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "relative -mb-px whitespace-nowrap pb-3 pt-1 text-sm font-medium transition-colors",
              active ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text)]",
            )}
          >
            {o.label}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-[2px] rounded-full transition-all duration-300 ease-[var(--ease-out-quint)]",
                active ? "bg-[var(--primary)] opacity-100" : "opacity-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
