import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/**
 * LearnTrace mark — three connected nodes forming a triangle
 * (knowledge graph metaphor). Uses currentColor so it adapts to theme.
 */
export function Logo({
  size = 28,
  showWordmark = true,
  className,
}: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="text-text-primary"
      >
        <g
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.5"
        >
          <line x1="7" y1="17" x2="17" y2="17" />
          <line x1="7" y1="17" x2="12" y2="7" />
          <line x1="12" y1="7" x2="17" y2="17" />
        </g>
        <circle cx="7" cy="17" r="2" fill="currentColor" />
        <circle cx="17" cy="17" r="2" fill="currentColor" />
        <circle cx="12" cy="7" r="2.4" fill="currentColor" />
      </svg>
      {showWordmark && (
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-text-secondary">
          LearnTrace
        </span>
      )}
    </span>
  );
}
