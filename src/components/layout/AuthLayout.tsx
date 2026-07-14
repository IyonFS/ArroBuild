import ArroLogo from "@/components/ui/ArroLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="auth-app min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: "var(--app-bg-base)",
        backgroundImage: "var(--app-blueprint-texture)",
        backgroundSize: "var(--app-blueprint-size)",
      }}
    >
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <div className="mb-8">
          <ArroLogo href="/" />
        </div>
        {children}
      </div>
    </div>
  );
}
