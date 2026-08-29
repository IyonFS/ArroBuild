import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/ui/Toast";

const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
  fallback: ["system-ui", "Arial"],
});

const unbounded = localFont({
  src: "../../node_modules/@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2",
  variable: "--font-unbounded",
  display: "swap",
  weight: "200 900",
  fallback: ["Arial", "sans-serif"],
});

const jetbrainsMono = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: "100 800",
  fallback: ["ui-monospace", "Cascadia Code", "monospace"],
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
        inter.variable,
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
