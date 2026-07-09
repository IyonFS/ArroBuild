"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type LearnTheme = "dark" | "light";

const STORAGE_KEY = "arrobuild-learn-theme";

let themeVersion = 0;
const themeListeners = new Set<() => void>();

function notifyThemeListeners() {
  themeVersion += 1;
  themeListeners.forEach((listener) => listener());
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function readTheme(): LearnTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as LearnTheme | null;
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage may be unavailable
  }
  return "dark";
}

function getThemeSnapshot(): LearnTheme {
  void themeVersion;
  return readTheme();
}

function getServerThemeSnapshot(): LearnTheme {
  return "dark";
}

function persistTheme(theme: LearnTheme) {
  localStorage.setItem(STORAGE_KEY, theme);
  notifyThemeListeners();
}

interface LearnThemeContextValue {
  theme: LearnTheme;
  toggleTheme: () => void;
}

const LearnThemeContext = createContext<LearnThemeContextValue | null>(null);

export function useLearnTheme() {
  const context = useContext(LearnThemeContext);
  if (!context) {
    throw new Error("useLearnTheme must be used within LearnThemeProvider");
  }
  return context;
}

export default function LearnThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const toggleTheme = useCallback(() => {
    persistTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return (
    <LearnThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </LearnThemeContext.Provider>
  );
}
