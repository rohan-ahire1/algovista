import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none " +
  "transition-[background,color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-out-quint)] " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--on-primary)] shadow-[var(--shadow-primary)] hover:bg-[var(--primary-hover)]",
  secondary:
    "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-[var(--shadow-xs)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
  soft: "bg-[var(--primary-soft)] text-[var(--primary)] hover:brightness-[0.97]",
  ghost: "text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text)]",
  danger:
    "bg-[var(--surface)] text-[var(--danger)] border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] hover:bg-[var(--danger-soft)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-[10px]",
  md: "h-11 px-5 text-sm rounded-[var(--radius-field)]",
  lg: "h-[52px] px-7 text-[15px] rounded-[14px]",
  icon: "h-10 w-10 rounded-[var(--radius-field)]",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
