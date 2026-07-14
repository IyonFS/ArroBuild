import NavbarV3 from "@/components/marketing/landing/NavbarV3";
import HeroSection from "@/components/marketing/landing/HeroSection";
import ProblemSection from "@/components/marketing/landing/ProblemSection";
import KnowledgeModelSection from "@/components/marketing/landing/KnowledgeModelSection";
import FileListingSection from "@/components/marketing/landing/FileListingSection";
import HowItWorksSection from "@/components/marketing/landing/HowItWorksSection";
import EcosystemSection from "@/components/marketing/landing/EcosystemSection";
import MiniToolsSection from "@/components/marketing/landing/MiniToolsSection";
import PricingSectionV3 from "@/components/marketing/landing/PricingSectionV3";
import FAQSection from "@/components/marketing/landing/FAQSection";
import CTAFinalSection from "@/components/marketing/landing/CTAFinalSection";

export default function HomePage() {
  return (
    <div style={{ background: "var(--lp-bg-base)", minHeight: "100vh", color: "var(--lp-text-primary)" }}>
      <NavbarV3 />

      <main>
        {/* 1. Hero — bg-base */}
        <HeroSection />

        {/* 2. Masalah — bg-surface */}
        <ProblemSection />

        {/* 3. Knowledge Model — bg-blueprint (1× di seluruh halaman) */}
        <KnowledgeModelSection />

        {/* 4. Isi Paket — bg-surface */}
        <FileListingSection />

        {/* 5. Cara Kerja — bg-base */}
        <HowItWorksSection />

        {/* 6. Ekosistem — bg-surface */}
        <EcosystemSection />

        {/* 7. Mini Tools — bg-base */}
        <MiniToolsSection />

        {/* 8. Harga — bg-base */}
        <PricingSectionV3 />

        {/* 9. FAQ — bg-surface */}
        <FAQSection />

        {/* 10. CTA Final + Footer — bg-base */}
        <CTAFinalSection />
      </main>
    </div>
  );
}
