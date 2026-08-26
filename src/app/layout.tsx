import type { Metadata } from "next";
import { cookies } from "next/headers";

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
    <html
      lang="en"
      data-theme={settings.theme}
      className={settings.theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <body>
        <AppStoreProvider initialSettings={settings} initialProgress={progress}>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="av-app-shell flex-1">{children}</main>
          </div>
        </AppStoreProvider>
      </body>
    </html>
  );
}
