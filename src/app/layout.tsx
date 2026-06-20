import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArroBuild — Generate everything before your first line of code",
  description:
    "AI-powered project documentation generator for vibe coders, indie hackers, and solo developers. Generate PRD, design system, tech stack, tasks, and roadmap — all from your product idea.",
  keywords: [
    "AI project planning",
    "vibe coding",
    "cursor rules generator",
    "PRD generator",
    "indie hacker tools",
    "AI documentation",
    "project foundation",
  ],
  openGraph: {
    title: "ArroBuild — Generate everything before your first line of code",
    description:
      "Turn your product idea into 10+ structured documentation files. Ready for Cursor, Claude Code, and any AI coding agent.",
    type: "website",
    siteName: "ArroBuild",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArroBuild — Generate everything before your first line of code",
    description:
      "Turn your product idea into 10+ structured documentation files. Ready for Cursor, Claude Code, and any AI coding agent.",
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
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
