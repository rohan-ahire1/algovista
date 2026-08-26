"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider as ShadcnSlider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Tabs as ShadcnTabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";

/* These small wrappers preserve AlgoVista's existing behavior while composing
 * the generated shadcn primitives underneath. */

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
  return (
    <ShadcnSlider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(values) => onChange(values[0] ?? value)}
      aria-label={ariaLabel}
      className={cn("h-5", className)}
    />
  );
}

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
    <ShadcnSelect value={value} onValueChange={onChange}>
      <SelectTrigger
        size={size === "sm" ? "sm" : "default"}
        aria-label={ariaLabel}
        className={cn("w-full border-[var(--border)] bg-[var(--surface)] font-medium text-[var(--text)] shadow-[var(--shadow-xs)]", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadcnSelect>
  );
}

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
      <Input
        aria-label={ariaLabel}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-auto border-0 bg-transparent px-0 py-0 text-sm font-medium shadow-none focus-visible:ring-0"
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
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next as T)}
      className={cn("grid w-full gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          variant="outline"
          className="h-11 rounded-[var(--radius-field)] border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)] data-[state=on]:border-transparent data-[state=on]:bg-[var(--primary)] data-[state=on]:text-[var(--on-primary)]"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

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
    <ShadcnTabs value={value} onValueChange={(next) => onChange(next as T)} className={cn("w-full", className)}>
      <TabsList variant="line" className="w-max gap-7 rounded-none bg-transparent p-0">
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="rounded-none px-0 pb-3 pt-1 text-sm font-medium text-[var(--text-muted)] data-[state=active]:text-[var(--primary)]"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </ShadcnTabs>
  );
}
