import type { Metadata } from "next";
import { SettingsScreen } from "@/components/settings/settings-screen";

export const metadata: Metadata = {
  title: "Visualization Controls",
  description: "Customize how the algorithm visualization looks and behaves.",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
