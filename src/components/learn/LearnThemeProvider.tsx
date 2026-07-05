"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type LearnTheme = "dark" | "light";

const STORAGE_KEY = "arrobuild-learn-theme";

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
  const [theme, setTheme] = useState<LearnTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LearnTheme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, ready]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <LearnThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </LearnThemeContext.Provider>
  );
}
