"use client";

import type { TableView } from "@/lib/engine/types";
import { cn } from "@/lib/cn";
import { MARK_STYLES } from "./marks";

export function TableViewRenderer({ view, compact = false }: { view: TableView; compact?: boolean }) {
  return (
    <div className="flex w-full flex-col gap-3">
      {view.caption ? <p className="text-[12.5px] text-[var(--text-muted)]">{view.caption}</p> : null}
      <div className="av-scroll w-full overflow-x-auto rounded-[var(--radius-field)] border border-[var(--border)]">
        <table className={cn("w-full border-collapse text-center", compact ? "min-w-[620px] text-[10px]" : "min-w-[760px] text-[11.5px]")}>
          <thead>
            <tr className="bg-[var(--surface-sunken)]">
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[168px] border-b border-r border-[var(--border)] bg-[var(--surface-sunken)] px-3 py-2.5 text-left font-semibold text-[var(--text-muted)]"
              >
                Item / capacity
              </th>
              {view.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="min-w-[42px] border-b border-[var(--border)] px-2 py-2.5 font-semibold tabular-nums text-[var(--text-muted)]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row, rowIndex) => (
              <tr key={row.id}>
                <th
                  scope="row"
                  className="sticky left-0 z-[1] min-w-[168px] border-r border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left font-semibold leading-tight text-[var(--text)]"
                >
                  {row.label}
                </th>
                {view.columns.map((column, columnIndex) => {
                  const mark = row.marks?.[columnIndex] ?? "idle";
                  const style = MARK_STYLES[mark];
                  const active = view.activeCell?.row === rowIndex && view.activeCell.column === columnIndex;
                  return (
                    <td
                      key={`${row.id}-${column}`}
                      aria-label={`${row.label}, capacity ${column}: ${row.values[columnIndex] ?? "—"}`}
                      data-active={active ? "true" : undefined}
                      className="border-b border-[var(--border)] px-2 py-2 font-bold tabular-nums transition-colors duration-200 last:border-r-0"
                      style={{
                        background: style.fill,
                        color: style.text,
                        boxShadow: active ? `inset 0 0 0 2px ${style.ring ?? "var(--primary)"}` : undefined,
                      }}
                    >
                      {row.values[columnIndex] ?? "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
