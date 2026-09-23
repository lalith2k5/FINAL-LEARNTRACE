"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { theme } = useTheme();
  const resolved =
    theme === "system" ? undefined : (theme as "light" | "dark" | undefined);

  return (
    <SonnerToaster
      position="bottom-right"
      theme={resolved}
      richColors={false}
      closeButton
      duration={3500}
      toastOptions={{
        className:
          "!bg-bg-elevated !text-text-primary !border !border-border-default !rounded-xl !shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)] !backdrop-blur-xl",
        style: {
          padding: "12px 14px",
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
        },
        classNames: {
          toast:
            "group !bg-bg-elevated !text-text-primary !border !border-border-default",
          title: "!text-text-primary !font-medium",
          description: "!text-text-tertiary !text-xs",
          closeButton:
            "!bg-bg-inset !border-border-default !text-text-tertiary hover:!text-text-primary",
          success: "!border-white/[0.12]/40",
          error: "!border-white/[0.08]/40",
          warning: "!border-white/[0.10]/40",
          info: "!border-accent/40",
        },
      }}
    />
  );
}
