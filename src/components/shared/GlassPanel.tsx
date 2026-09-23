import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
  glow?: boolean;
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, strong, glow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        strong ? "glass-strong" : "glass",
        glow && "glow-ring",
        "p-5",
        className
      )}
      {...props}
    />
  )
);
GlassPanel.displayName = "GlassPanel";