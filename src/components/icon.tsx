"use client";

import {
  AlignLeft,
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowRightLeft,
  BarChart3,
  Boxes,
  CheckCheck,
  Circle,
  CircleDot,
  CornerDownLeft,
  CornerUpLeft,
  Crosshair,
  Filter,
  Footprints,
  GitBranch,
  GitFork,
  GitMerge,
  Hand,
  Hash,
  Layers,
  ListOrdered,
  ListTree,
  Lock,
  MoveRight,
  Network,
  PenLine,
  PhoneCall,
  Plus,
  Repeat,
  RotateCw,
  Route,
  Scale,
  ScanLine,
  Scissors,
  Search,
  Share2,
  SlidersHorizontal,
  Spline,
  Split,
  Target,
  TrendingDown,
  Unlock,
  type LucideIcon,
} from "lucide-react";

/**
 * Explicit registry rather than a namespace import — keeps the client bundle
 * to the couple of dozen glyphs the app actually renders.
 */
const REGISTRY: Record<string, LucideIcon> = {
  AlignLeft,
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowRightLeft,
  BarChart3,
  Boxes,
  CheckCheck,
  Circle,
  CircleDot,
  CornerDownLeft,
  CornerUpLeft,
  Crosshair,
  Filter,
  Footprints,
  GitBranch,
  GitFork,
  GitMerge,
  Hand,
  Hash,
  Layers,
  ListOrdered,
  ListTree,
  Lock,
  MoveRight,
  Network,
  PenLine,
  PhoneCall,
  Plus,
  Repeat,
  RotateCw,
  Route,
  Scale,
  ScanLine,
  Scissors,
  Search,
  Share2,
  SlidersHorizontal,
  Spline,
  Split,
  Target,
  TrendingDown,
  Unlock,
};

export function Icon({
  name,
  className,
  strokeWidth = 1.9,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = REGISTRY[name] ?? Circle;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}
