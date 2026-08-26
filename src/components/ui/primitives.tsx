import * as React from "react";
import { cn } from "@/lib/cn";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from "@/components/ui/card";
import { Progress as ShadcnProgress } from "@/components/ui/progress";

/* ------------------------------- Card ---------------------------------- */

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <ShadcnCard className={className} {...props} />;
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <ShadcnCardHeader className={className} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <ShadcnCardTitle className={className} {...props} />;
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <ShadcnCardContent className={className} {...props} />;
}

/* ------------------------------- Badge --------------------------------- */

type Tone = "brand" | "violet" | "mint" | "amber" | "neutral" | "rose";

const tones: Record<Tone, string> = {
  brand: "bg-[var(--primary-soft)] text-[var(--primary)]",
  violet: "bg-[var(--violet-soft)] text-[var(--violet)]",
  mint: "bg-[var(--success-soft)] text-[var(--success)]",
  amber: "bg-[var(--warning-soft)] text-[var(--warning)]",
  rose: "bg-[var(--danger-soft)] text-[var(--danger)]",
  neutral: "bg-[var(--surface-sunken)] text-[var(--text-muted)]",
};

export function Badge({
  tone = "brand",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <ShadcnBadge
      variant="secondary"
      className={cn(
        "border-transparent",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------ Progress -------------------------------- */

export function Progress({
  value,
  className,
  tone = "brand",
}: {
  value: number;
  className?: string;
  tone?: "brand" | "mint";
}) {
  return <ShadcnProgress value={value} className={cn(tone === "mint" && "av-progress-mint", className)} />;
}

/* ------------------------------ Icon tile ------------------------------- */

export function IconTile({
  tone = "brand",
  size = "md",
  className,
  children,
}: {
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  const dims = { sm: "h-8 w-8 rounded-[9px]", md: "h-11 w-11 rounded-[12px]", lg: "h-14 w-14 rounded-[16px]" }[size];
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", dims, tones[tone], className)}>
      {children}
    </span>
  );
}

/* -------------------------------- Misc ---------------------------------- */

export function SectionLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[var(--border)]", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] px-6 py-14 text-center">
      {icon ? <IconTile tone="neutral">{icon}</IconTile> : null}
      <div>
        <p className="font-semibold text-[var(--text)]">{title}</p>
        {description ? <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
