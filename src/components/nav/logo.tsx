import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="AlgoVista home">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="6" y="5" width="8" height="22" rx="4" fill="var(--primary)" transform="rotate(-30 6 5)" />
        <rect x="17" y="5" width="8" height="22" rx="4" fill="var(--success)" transform="rotate(30 17 5)" />
      </svg>
      <span className="font-display text-[20px] font-extrabold tracking-[-0.04em] text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">AlgoVista</span>
    </Link>
  );
}
