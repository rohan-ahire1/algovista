"use client";

import * as React from "react";
import {
  DEFAULT_PROGRESS,
  DEFAULT_SETTINGS,
  MAX_ACTIVITY,
  PROGRESS_COOKIE,
  SETTINGS_COOKIE,
  type ActivityEntry,
  type Progress,
  type Settings,
} from "./schema";

/* ------------------------------ cookie I/O ------------------------------ */

function writeCookie(name: string, value: unknown) {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(JSON.stringify(value));
  // One year, site-wide, lax — no auth data lives here, only preferences.
  document.cookie = `${name}=${encoded}; path=/; max-age=31536000; samesite=lax`;
}

/* -------------------------------- context ------------------------------- */

interface AppStore {
  settings: Settings;
  progress: Progress;
  setSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
  setProgress: (updater: (p: Progress) => Progress) => void;
  recordActivity: (entry: Omit<ActivityEntry, "at">) => void;
  markExplored: (slug: string) => void;
  markCompleted: (slug: string) => void;
  recordQuiz: (slug: string, correct: number, total: number) => void;
  setModuleProgress: (moduleId: string, lessons: number) => void;
  resetProgress: () => void;
}

const StoreContext = React.createContext<AppStore | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

function bumpStreak(p: Progress): Progress {
  const day = today();
  if (p.lastActive === day) return p;

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  return {
    ...p,
    streak: p.lastActive === yesterday ? p.streak + 1 : 1,
    lastActive: day,
  };
}

export function AppStoreProvider({
  initialSettings,
  initialProgress,
  children,
}: {
  initialSettings: Settings;
  initialProgress: Progress;
  children: React.ReactNode;
}) {
  // The server already read both cookies in the root layout, so the initial
  // state is correct on the very first paint — no hydration flash, no re-read.
  const [settings, setSettingsState] = React.useState<Settings>(initialSettings);
  const [progress, setProgressState] = React.useState<Progress>(initialProgress);

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const setSettings = React.useCallback((patch: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      writeCookie(SETTINGS_COOKIE, next);
      return next;
    });
  }, []);

  const resetSettings = React.useCallback(() => {
    setSettingsState(() => {
      writeCookie(SETTINGS_COOKIE, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    });
  }, []);

  const setProgress = React.useCallback((updater: (p: Progress) => Progress) => {
    setProgressState((prev) => {
      const next = bumpStreak(updater(prev));
      writeCookie(PROGRESS_COOKIE, next);
      return next;
    });
  }, []);

  const recordActivity = React.useCallback(
    (entry: Omit<ActivityEntry, "at">) => {
      setProgress((p) => ({
        ...p,
        activity: [{ ...entry, at: Date.now() }, ...p.activity.filter((a) => !(a.slug === entry.slug && a.title === entry.title))].slice(
          0,
          MAX_ACTIVITY,
        ),
        minutes: p.minutes + 1,
      }));
    },
    [setProgress],
  );

  const markExplored = React.useCallback(
    (slug: string) => {
      setProgress((p) => (p.explored.includes(slug) ? p : { ...p, explored: [...p.explored, slug] }));
    },
    [setProgress],
  );

  const markCompleted = React.useCallback(
    (slug: string) => {
      setProgress((p) => (p.completed.includes(slug) ? p : { ...p, completed: [...p.completed, slug] }));
    },
    [setProgress],
  );

  const recordQuiz = React.useCallback(
    (slug: string, correct: number, total: number) => {
      setProgress((p) => {
        const prev = p.quiz[slug];
        const best = prev && prev.correct / prev.total >= correct / total ? prev : { correct, total };
        return { ...p, quiz: { ...p.quiz, [slug]: best } };
      });
    },
    [setProgress],
  );

  const setModuleProgress = React.useCallback(
    (moduleId: string, lessons: number) => {
      setProgress((p) => ({
        ...p,
        modules: { ...p.modules, [moduleId]: Math.max(p.modules[moduleId] ?? 0, lessons) },
      }));
    },
    [setProgress],
  );

  const resetProgress = React.useCallback(() => {
    setProgressState(() => {
      writeCookie(PROGRESS_COOKIE, DEFAULT_PROGRESS);
      return DEFAULT_PROGRESS;
    });
  }, []);

  const value = React.useMemo<AppStore>(
    () => ({
      settings,
      progress,
      setSettings,
      resetSettings,
      setProgress,
      recordActivity,
      markExplored,
      markCompleted,
      recordQuiz,
      setModuleProgress,
      resetProgress,
    }),
    [
      settings,
      progress,
      setSettings,
      resetSettings,
      setProgress,
      recordActivity,
      markExplored,
      markCompleted,
      recordQuiz,
      setModuleProgress,
      resetProgress,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside <AppStoreProvider>");
  return ctx;
}

export function useSettings() {
  const { settings, setSettings, resetSettings } = useAppStore();
  return { settings, setSettings, resetSettings };
}
