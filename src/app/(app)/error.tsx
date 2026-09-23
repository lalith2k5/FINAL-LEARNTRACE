"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassPanel strong className="max-w-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03] text-text-tertiary">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-text-primary">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          We hit an unexpected error loading this page. Try refreshing, or go
          back to the dashboard.
        </p>
        {error.digest && (
          <p className="mt-3 text-[10px] text-text-quaternary">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="btn-primary text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
          <Link href="/dashboard" className="btn-ghost text-xs">
            <Home className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        </div>
      </GlassPanel>
    </div>
  );
}
