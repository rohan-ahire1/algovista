import * as React from "react";
import { cn } from "@/lib/cn";

/* ------------------------------- Card ---------------------------------- */

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center justify-between gap-3 px-5 pt-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-[15px] font-semibold text-[var(--text)]", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
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
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium leading-none",
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
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]", className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-quint)]"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background:
            tone === "mint"
              ? "var(--success)"
              : "linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--violet) 70%, var(--primary)))",
        }}
      />
    </div>
  );
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
