import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="AlgoVista home">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="9.5" cy="10" r="5" fill="var(--primary)" />
        <circle cx="22" cy="8" r="3.4" fill="var(--violet)" />
        <circle cx="20.5" cy="22" r="6" fill="var(--primary)" opacity="0.32" />
        <circle cx="9" cy="23" r="3.2" fill="var(--violet)" opacity="0.75" />
      </svg>
      <span className="font-display text-[21px] font-extrabold tracking-[-0.03em] text-[var(--text)]">AlgoVista</span>
    </Link>
  );
}
