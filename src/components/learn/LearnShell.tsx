"use client";

import { usePathname } from "next/navigation";
import LearnPrimaryNav from "@/components/learn/LearnPrimaryNav";
import LearnTopicStrip from "@/components/learn/LearnTopicStrip";
import { useLearnTheme } from "@/components/learn/LearnThemeProvider";
import { LEARN_NAV_HEIGHT } from "@/lib/learn-links";

interface LearnShellProps {
  children: React.ReactNode;
}

export default function LearnShell({ children }: LearnShellProps) {
  const pathname = usePathname();
  const { theme } = useLearnTheme();
  const isLessonPage = /^\/learn\/[^/]+\/[^/]+$/.test(pathname);

  return (
    <div
      className={`learn-shell learn-app flex flex-col ${
        isLessonPage ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
      data-learn-theme={theme}
      style={{
        background: "var(--color-bg-base)",
        ["--learn-nav-height" as string]: `${LEARN_NAV_HEIGHT}px`,
      }}
    >
      <div className="relative z-10 flex flex-col h-full min-h-0 flex-1">
        <LearnPrimaryNav />
        <LearnTopicStrip />

        <main
          className={
            isLessonPage
              ? "flex-1 min-h-0 flex flex-col overflow-hidden"
              : "flex-1 overflow-y-auto"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
