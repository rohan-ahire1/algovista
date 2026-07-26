"use client";

import * as React from "react";
import { getAlgorithm } from "@/lib/algorithms";
import { buildInput } from "@/lib/engine/input";
import { DEFAULT_SETTINGS } from "@/lib/store/schema";
import { Stage } from "./stage";

/**
 * A small, always-running loop of the algorithm used as an inline preview.
 * It deliberately uses a fixed small input rather than the user's settings so
 * the preview stays readable at card size.
 */
export function MiniPreview({ slug, interval = 900 }: { slug: string; interval?: number }) {
  const algorithm = getAlgorithm(slug);

  const frames = React.useMemo(() => {
    if (!algorithm) return [];
    const settings = { ...DEFAULT_SETTINGS, arraySize: 8, seed: 7 };
    return algorithm.generate(buildInput(algorithm, settings));
  }, [algorithm]);

  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (frames.length < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % frames.length), interval);
    return () => window.clearTimeout(id);
  }, [index, frames.length, interval]);

  if (!algorithm || !frames.length) return null;
  const frame = frames[index];

  return (
    <div className="flex flex-col gap-3">
      <Stage frame={frame} animation="smooth" compact />
      <p className="min-h-[34px] text-[12.5px] leading-snug text-[var(--text-muted)]">
        <span className="font-semibold text-[var(--text)]">{frame.title}.</span> {frame.detail}
      </p>
    </div>
  );
}
