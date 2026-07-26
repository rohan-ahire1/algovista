"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { LANGUAGES, type LanguageId } from "@/lib/engine/algorithm";
import { cn } from "@/lib/cn";

export function CodeViewer({
  html,
  raw,
}: {
  html: Record<string, string>;
  raw: Record<LanguageId, string>;
}) {
  const [lang, setLang] = React.useState<LanguageId>("pseudocode");
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(raw[lang]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the code is still selectable */
    }
  };

  return (
    <div>
      <div className="flex items-center gap-6 border-b border-[var(--border)]" role="tablist">
        {LANGUAGES.map((l) => {
          const active = l.id === lang;
          return (
            <button
              key={l.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setLang(l.id)}
              className={cn(
                "relative -mb-px pb-3 pt-1 text-[14px] font-medium transition-colors",
                active ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
            >
              {l.label}
              {active ? <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[var(--primary)]" /> : null}
            </button>
          );
        })}
      </div>

      <div className="av-code relative mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] shadow-[var(--shadow-sm)]">
        <button
          type="button"
          onClick={copy}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-sunken)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--text-muted)] shadow-[var(--shadow-xs)] transition-colors hover:text-[var(--text)]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <div
          className="av-scroll overflow-x-auto"
          // Highlighted at build time by Shiki; the input is our own static source strings.
          dangerouslySetInnerHTML={{ __html: html[lang] ?? "" }}
        />
      </div>
    </div>
  );
}
