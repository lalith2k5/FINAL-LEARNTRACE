import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/**
 * LearnTrace mark — three connected dots forming a triangle.
 * Represents a knowledge graph (nodes + edges).
 * Uses currentColor so it adapts to any context.
 */
export function Logo({
  size = 28,
  showWordmark = true,
  className,
}: Props) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      {showWordmark && (
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-text-secondary">
          LearnTrace
        </span>
      )}
    </span>
  );
}
