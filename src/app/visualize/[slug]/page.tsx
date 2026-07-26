import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALGORITHMS, getAlgorithm } from "@/lib/algorithms";
import { Visualizer } from "@/components/viz/visualizer";

export function generateStaticParams() {
  return ALGORITHMS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = getAlgorithm(slug);
  if (!algorithm) return { title: "Not found" };
  return { title: `Visualize ${algorithm.name}`, description: algorithm.tagline };
}

export default async function VisualizePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const algorithm = getAlgorithm(slug);
  if (!algorithm) notFound();
  return <Visualizer slug={algorithm.slug} />;
}
