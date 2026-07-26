import type { Metadata } from "next";
import { LearningPath } from "@/components/learn/learning-path";

export const metadata: Metadata = {
  title: "Your Learning Path",
  description: "A structured journey to master algorithms and problem solving.",
};

export default function LearningPathPage() {
  return <LearningPath />;
}
