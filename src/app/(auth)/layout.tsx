import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-black lg:grid-cols-[1fr_1.1fr]">
      {/* Left visual panel — hidden on mobile */}
      <AuthLeftPanel />

      {/* Right form panel */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12">
        {/* Subtle glow behind form */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 40%, rgba(24,119,242,0.06), transparent 70%)",
          }}
        />

        <div className="relative w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
