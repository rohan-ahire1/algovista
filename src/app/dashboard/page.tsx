import type { Metadata } from "next";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your progress, achievements and recent activity.",
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
