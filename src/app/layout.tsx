import type { Metadata } from "next";
import { JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/ui/Toast";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArroBuild | Generate everything before your first line of code",
  description:
    "Ubah ide produk jadi fondasi lengkap: PRD, context, plan, design system & agents. Gratis, tanpa login. 5 model AI.",
  keywords: [
    "PRD generator",
    "indie hacker tools",
    "AI documentation",
    "project foundation",
  ],
  openGraph: {
    title: "ArroBuild — Generate everything before your first line of code",
    description:
      "Generate 1–8 file dokumentasi terstruktur dari ide produk kamu. Siap untuk Cursor, Claude Code, dan AI coding agent lainnya.",
    type: "website",
    siteName: "ArroBuild",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArroBuild — Generate everything before your first line of code",
    description:
      "Generate 1–8 file dokumentasi terstruktur dari ide produk kamu. Siap untuk Cursor, Claude Code, dan AI coding agent lainnya.",
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
      data-scroll-behavior="smooth"
      className={cn("h-full", "antialiased", jetbrainsMono.variable, "font-sans", geist.variable)}
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
