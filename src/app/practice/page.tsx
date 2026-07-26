import type { Metadata } from "next";
import { PracticeScreen } from "@/components/practice/practice-screen";

export const metadata: Metadata = {
  title: "Practice",
  description: "Quizzes, drills and generated challenges to test what you have learned.",
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ algorithm?: string }>;
}) {
  const { algorithm } = await searchParams;
  return <PracticeScreen initialAlgorithm={algorithm} />;
}
