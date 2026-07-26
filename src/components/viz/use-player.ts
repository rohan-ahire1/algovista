"use client";

import * as React from "react";
import type { Frame } from "@/lib/engine/types";
import { speedToDelay } from "@/lib/store/schema";

export function usePlayer(frames: Frame[], speed: number, onFinish?: () => void) {
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const finishRef = React.useRef(onFinish);
  React.useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  const total = frames.length;
  const last = Math.max(0, total - 1);

  // Rebuilding the frames (new array, new algorithm) restarts the timeline.
  // Resetting during render is cheaper than an effect and avoids a flash of the
  // old step against the new data.
  const [seenFrames, setSeenFrames] = React.useState(frames);
  if (seenFrames !== frames) {
    setSeenFrames(frames);
    setIndex(0);
    setPlaying(false);
  }

  /** Moves the timeline and fires onFinish exactly once per arrival at the end. */
  const commit = React.useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, last));
      if (clamped >= last && index < last) finishRef.current?.();
      setIndex(clamped);
      if (clamped >= last) setPlaying(false);
    },
    [index, last],
  );

  React.useEffect(() => {
    if (!playing || index >= last) return;
    const id = window.setTimeout(() => commit(index + 1), speedToDelay(speed));
    return () => window.clearTimeout(id);
  }, [playing, index, last, speed, commit]);

  const controls = React.useMemo(
    () => ({
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      toggle: () => {
        if (index >= last) {
          setIndex(0);
          setPlaying(true);
          return;
        }
        setPlaying((p) => !p);
      },
      next: () => {
        setPlaying(false);
        commit(index + 1);
      },
      prev: () => {
        setPlaying(false);
        setIndex((i) => Math.max(i - 1, 0));
      },
      first: () => {
        setPlaying(false);
        setIndex(0);
      },
      end: () => {
        setPlaying(false);
        commit(last);
      },
      seek: (i: number) => {
        setPlaying(false);
        commit(i);
      },
    }),
    [commit, index, last],
  );

  return { index, playing, total, frame: frames[index] ?? frames[0], controls, atEnd: index >= last };
}

/** Space / arrow-key control for the visualizer, ignored while typing. */
export function usePlayerKeys(controls: {
  toggle: () => void;
  next: () => void;
  prev: () => void;
  first: () => void;
  end: () => void;
}) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;

      if (e.code === "Space") {
        e.preventDefault();
        controls.toggle();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        controls.next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        controls.prev();
      } else if (e.key === "Home") {
        controls.first();
      } else if (e.key === "End") {
        controls.end();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [controls]);
}
