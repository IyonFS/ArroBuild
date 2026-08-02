import ArroLogo from "@/components/ui/ArroLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div 
      className="min-h-[100dvh] flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden w-full"
      style={{
        background: "var(--app-bg-base)",
        color: "var(--app-text-primary)",
      }}
    >
      {/* Left Visual Section */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col p-12 relative overflow-hidden"
        style={{
          background: "var(--lp-bg-base)", // Clear distinction
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div className="relative z-20">
          <ArroLogo href="/" />
        </div>
        
        {/* Massive Decorative Centerpiece */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative w-96 h-96">
            <div className="absolute inset-0 rounded-full border border-[rgba(255,176,32,0.1)] animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-[rgba(56,189,248,0.1)] animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute inset-12 rounded-full border border-[rgba(157,78,221,0.1)] animate-[spin_20s_linear_infinite]" />
            
            {/* Glowing Core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-[rgba(255,176,32,0.05)] shadow-[0_0_80px_rgba(255,176,32,0.2)] backdrop-blur-md border border-[rgba(255,176,32,0.2)] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FFB020] to-[#38BDF8] opacity-20 blur-md" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-20 max-w-md mt-auto mb-8">
          <h2 style={{ fontFamily: "var(--font-unbounded)", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
            Build Serious<br/>
            <span style={{ color: "var(--lp-amber)", textShadow: "0 0 30px rgba(255,176,32,0.4)" }}>AI Applications.</span>
          </h2>
          <p style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            Bergabung dengan ArroBuild untuk mengelola project, merancang arsitektur, dan merealisasikan ide aplikasi AI Anda hingga tahap production.
          </p>
        </div>

        {/* Ambient background effects — Pro Max Style (Stronger) */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "80%", height: "80%", background: "radial-gradient(circle, rgba(255, 176, 32, 0.15) 0%, transparent 60%)", pointerEvents: "none", filter: "blur(60px)", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "90%", height: "90%", background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 60%)", pointerEvents: "none", filter: "blur(80px)", zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, backgroundSize: "40px 40px", backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)", WebkitMaskImage: "radial-gradient(ellipse 200% 200% at 50% 50%, black, transparent)", maskImage: "radial-gradient(ellipse 200% 200% at 50% 50%, black, transparent)", pointerEvents: "none", zIndex: 0 }} />
      </div>

      {/* Right Form Section */}
      <div className="w-full h-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative z-10 overflow-y-auto" style={{ background: "#04060A" }}>
        <div className="lg:hidden w-full flex justify-center mb-12">
          <ArroLogo href="/" />
        </div>
        <div className="w-full max-w-[480px] relative">
          <div 
            className="absolute -inset-4 bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-transparent opacity-50 blur-2xl pointer-events-none rounded-3xl"
          />
          <div 
            className="relative w-full rounded-3xl p-6 sm:p-10"
            style={{
              background: "rgba(16, 22, 35, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
