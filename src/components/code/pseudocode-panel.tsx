"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button-compat";

export function PseudocodePanel({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the pseudocode is still selectable */
    }
  };

  return (
    <div className="av-code overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <span className="text-[13px] font-semibold text-[var(--text)]">Pseudocode</span>
        <Button variant="secondary" size="sm" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="av-scroll max-h-[calc(100dvh-190px)] overflow-auto bg-[var(--surface-sunken)] px-4 py-5 font-mono text-[12.5px] leading-[1.75] text-[var(--text)]">
        {code}
      </pre>
    </div>
  );
}
