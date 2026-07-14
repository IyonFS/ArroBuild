import type { ReactNode } from "react";
import LearnShell from "@/components/learn/LearnShell";
import LearnThemeProvider from "@/components/learn/LearnThemeProvider";

export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <LearnThemeProvider>
      <LearnShell>{children}</LearnShell>
    </LearnThemeProvider>
  );
}
