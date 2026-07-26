import type { Metadata } from "next";
import { AlgorithmLibrary } from "@/components/library/algorithm-library";

export const metadata: Metadata = {
  title: "All Algorithms",
  description: "Browse every algorithm available to visualize and learn.",
};

export default async function AlgorithmsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <AlgorithmLibrary initialCategory={category} />;
}
