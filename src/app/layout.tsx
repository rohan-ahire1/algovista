import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { AppStoreProvider } from "@/lib/store/app-store";
import {
  DEFAULT_PROGRESS,
  DEFAULT_SETTINGS,
  PROGRESS_COOKIE,
  SETTINGS_COOKIE,
  parseCookieValue,
} from "@/lib/store/schema";
import { SiteHeader } from "@/components/nav/site-header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-code", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AlgoVista — Understand Algorithms Visually",
    template: "%s · AlgoVista",
  },
  description:
    "Watch algorithms come to life with interactive visualizations. Learn by seeing how they work step by step.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const settings = parseCookieValue(jar.get(SETTINGS_COOKIE)?.value, DEFAULT_SETTINGS);
  const progress = parseCookieValue(jar.get(PROGRESS_COOKIE)?.value, DEFAULT_PROGRESS);

  return (
    <html lang="en" data-theme={settings.theme} suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} ${mono.variable} antialiased`}>
        <AppStoreProvider initialSettings={settings} initialProgress={progress}>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </div>
        </AppStoreProvider>
      </body>
    </html>
  );
}
