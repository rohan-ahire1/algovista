"use client";

import * as React from "react";
import type { Frame, LegendItem } from "@/lib/engine/types";
import type { AnimationStyle } from "@/lib/store/schema";
import { ArrayViewRenderer } from "./array-view";
import { GraphViewRenderer } from "./graph-view";
import { TableViewRenderer } from "./table-view";
import { TreeViewRenderer } from "./tree-view";
import { MARK_STYLES } from "./marks";

export function Stage({
  frame,
  animation = "smooth",
  compact = false,
  title,
}: {
  frame: Frame;
  animation?: AnimationStyle;
  compact?: boolean;
  title?: string;
}) {
  const view = frame.view;
  if (view.kind === "array") {
    return <ArrayViewRenderer view={view} animation={animation} compact={compact} title={title} />;
  }
  if (view.kind === "graph") return <GraphViewRenderer view={view} compact={compact} />;
  if (view.kind === "tree") return <TreeViewRenderer view={view} compact={compact} />;
  return <TableViewRenderer view={view} compact={compact} />;
}

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      {items.map((item) => (
        <span key={item.mark} className="inline-flex items-center gap-2 text-[12.5px] text-[var(--text-muted)]">
          <span
            className="h-3 w-3 rounded-[4px]"
            style={{ background: MARK_STYLES[item.mark].fill, border: "1px solid var(--border)" }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
