import * as React from "react";
import Link from "next/link";

import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "danger" | "default" | "outline" | "destructive" | "link";
type Size = "sm" | "md" | "lg" | "icon" | "default";

function mapVariant(variant: Variant = "primary") {
  if (variant === "primary") return "default" as const;
  if (variant === "danger") return "destructive" as const;
  if (variant === "soft") return "secondary" as const;
  if (variant === "default") return "default" as const;
  return variant;
}

function mapSize(size: Size = "md") {
  return size === "md" ? "default" : size;
}

function toneClass(variant: Variant) {
  return variant === "soft" ? "bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--primary-soft)]/80" : undefined;
}

export type ButtonProps = Omit<React.ComponentProps<typeof ShadcnButton>, "variant" | "size"> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  return (
    <ShadcnButton
      ref={ref}
      variant={mapVariant(variant)}
      size={mapSize(size)}
      className={cn(toneClass(variant), className)}
      {...props}
    />
  );
});

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <ShadcnButton asChild variant={mapVariant(variant)} size={mapSize(size)} className={cn(toneClass(variant), className)}>
      <Link {...props}>{children}</Link>
    </ShadcnButton>
  );
}
