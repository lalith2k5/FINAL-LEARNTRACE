import Link from "next/link";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <GlassPanel strong className="max-w-md p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-text-secondary">
          <Compass className="h-5 w-5" />
        </div>
        <p className="label-mono mt-5">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist — or it moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">
            Go to dashboard →
          </Link>
          <Link href="/" className="btn-ghost text-xs">
            Home
          </Link>
        </div>
      </GlassPanel>
    </main>
  );
}
