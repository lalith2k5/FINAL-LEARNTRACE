"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { ThemeToggle } from "./ThemeToggle";

export function AppearanceSection() {
  return (
    <GlassPanel>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-inset text-text-secondary">
          <Sun className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="label-mono">Appearance</p>
          <p className="mt-1 text-sm text-text-secondary">
            Choose how LearnTrace looks. <span className="text-text-tertiary">System</span>{" "}
            follows your macOS setting.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
