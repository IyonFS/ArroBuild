import type { Metadata } from "next";
import { JetBrains_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/ui/Toast";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ArroBuild — Satu tempat untuk belajar, planning, dan build dengan AI agent",
  description:
    "Ekosistem developer untuk vibe coders: belajar agent engineering gratis, generate dokumentasi proyek, dan export ke Cursor, Claude Code, Windsurf. 5 model AI.",
  keywords: [
    "vibe coding",
    "AI agent",
    "PRD generator",
    "developer tools",
    "agent engineering",
    "cursor rules",
    "claude md",
    "indie hacker",
  ],
  openGraph: {
    title: "ArroBuild — Belajar, planning, dan build dengan AI agent",
    description:
      "Learn Hub gratis + doc generator + export ke tools favorit kamu. Satu ekosistem untuk developer yang build dengan AI.",
    type: "website",
    siteName: "ArroBuild",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArroBuild — Belajar, planning, dan build dengan AI agent",
    description:
      "Learn Hub gratis + doc generator + export ke tools favorit kamu.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full antialiased",
        unbounded.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}
