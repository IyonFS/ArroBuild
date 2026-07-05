import { Outfit } from "next/font/google";
import LearnShell from "@/components/learn/LearnShell";
import LearnThemeProvider from "@/components/learn/LearnThemeProvider";

const outfit = Outfit({
  variable: "--font-learn",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={outfit.variable}>
      <LearnThemeProvider>
        <LearnShell>{children}</LearnShell>
      </LearnThemeProvider>
    </div>
  );
}
