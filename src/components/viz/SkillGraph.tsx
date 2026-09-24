"use client";

import {
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  Network,
  Code2,
  Database,
  TrendingUp,
  Brain,
  Rocket,
} from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { cn } from "@/lib/utils";

export type GraphNode = {
  id: string;
  slug: string;
  name: string;
  mastery: number;
  difficulty: number;
  description?: string | null;
  verified?: boolean;
  parents: string[];
  children: string[];
};

export type GraphEdge = { parentId: string; childId: string };

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

const BANDS = [
  {
    id: "foundations",
    label: "Foundations",
    description: "Math & programming basics",
    tone: "sky" as const,
    icon: Code2,
    slugs: [
      "python-programming",
      "linear-algebra",
      "calculus",
      "probability-and-statistics",
      "data-structures-and-algorithms",
    ],
  },
  {
    id: "data",
    label: "Data",
    description: "Cleaning, exploring, and shaping data",
    tone: "accent" as const,
    icon: Database,
    slugs: [
      "numpy-fundamentals",
      "pandas-data-manipulation",
      "data-visualization",
      "exploratory-data-analysis",
      "data-preprocessing",
      "feature-engineering",
    ],
  },
  {
    id: "core-ml",
    label: "Core ML",
    description: "Classical models & evaluation",
    tone: "emerald" as const,
    icon: TrendingUp,
    slugs: [
      "linear-and-logistic-regression",
      "supervised-learning-basics",
      "decision-trees-and-ensembles",
      "support-vector-machines",
      "clustering-algorithms",
      "dimensionality-reduction-and-pca",
      "unsupervised-learning",
      "model-evaluation-metrics",
      "cross-validation-and-hyperparameter-tuning",
    ],
  },
  {
    id: "deep-learning",
    label: "Deep Learning",
    description: "Neural architectures",
    tone: "amber" as const,
    icon: Brain,
    slugs: [
      "deep-learning-fundamentals",
      "neural-network-architectures",
      "convolutional-neural-networks",
      "recurrent-neural-networks",
      "transformers-and-attention",
    ],
  },
  {
    id: "deployment",
    label: "Deployment",
    description: "Shipping models to production",
    tone: "rose" as const,
    icon: Rocket,
    slugs: [
      "docker-and-containerization",
      "mlops-and-model-registry",
      "model-deployment-api",
      "ml-system-design-and-monitoring",
      "model-optimization-and-quantization",
    ],
  },
];

type BandTone = (typeof BANDS)[number]["tone"];

/* Neutral white shades — one per band, progressively subtler */
const TONES: Record<
  BandTone,
  { border: string; bg: string; text: string; glow: string }
> = {
  accent: {
    border: "border-border-default",
    bg: "bg-accent/[0.04]",
    text: "text-accent",
    glow: "rgba(24,119,242,0.5)",
  },
  sky: {
    border: "border-border-default",
    bg: "bg-sky/[0.04]",
    text: "text-sky",
    glow: "rgba(56,189,248,0.5)",
  },
  emerald: {
    border: "border-border-default",
    bg: "bg-emerald/[0.04]",
    text: "text-emerald",
    glow: "rgba(16,185,129,0.5)",
  },
  amber: {
    border: "border-border-default",
    bg: "bg-amber/[0.04]",
    text: "text-amber",
    glow: "rgba(245,158,11,0.5)",
  },
  rose: {
    border: "border-border-default",
    bg: "bg-rose/[0.04]",
    text: "text-rose",
    glow: "rgba(244,63,94,0.5)",
  },
};

function masteryTone(m: number) {
  if (m >= 0.75) return { border: "#10B981", glow: "#10B98166", pct: Math.round(m * 100) };
  if (m >= 0.5) return { border: "#F59E0B", glow: "#F59E0B66", pct: Math.round(m * 100) };
  if (m > 0) return { border: "#F43F5E", glow: "#F43F5E66", pct: Math.round(m * 100) };
  return { border: "var(--color-border-default)", glow: "transparent", pct: 0 };
}

export function SkillGraph({ nodes, edges }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number; w: number; h: number }>
  >({});

  const bySlug = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of nodes) m.set(n.slug, n);
    return m;
  }, [nodes]);

  const bands = useMemo(
    () =>
      BANDS.map((band) => ({
        ...band,
        items: band.slugs
          .map((s) => bySlug.get(s))
          .filter(Boolean) as GraphNode[],
      })),
    [bySlug]
  );

  const focusId = hoveredId ?? selectedId;
  const focusNode = focusId
    ? nodes.find((n) => n.id === focusId) ?? null
    : null;

  const connectedIds = useMemo(() => {
    if (!focusId) return null;
    const s = new Set<string>([focusId]);
    for (const e of edges) {
      if (e.parentId === focusId) s.add(e.childId);
      if (e.childId === focusId) s.add(e.parentId);
    }
    return s;
  }, [focusId, edges]);

  const activeEdges = useMemo(() => {
    if (!focusId) return [];
    return edges.filter(
      (e) => e.parentId === focusId || e.childId === focusId
    );
  }, [focusId, edges]);

  // --- Rendered edges with spread exit/entry points ---
  const renderedEdges = useMemo(() => {
    if (!focusId) return [];

    // Group active edges by parent and by child for spreading
    const byParent = new Map<string, GraphEdge[]>();
    const byChild = new Map<string, GraphEdge[]>();
    for (const e of activeEdges) {
      if (!byParent.has(e.parentId)) byParent.set(e.parentId, []);
      byParent.get(e.parentId)!.push(e);
      if (!byChild.has(e.childId)) byChild.set(e.childId, []);
      byChild.get(e.childId)!.push(e);
    }

    // Sort siblings by the x position of the other endpoint so lines don't cross
    for (const list of byParent.values()) {
      list.sort((a, b) => {
        const pa = positions[a.childId];
        const pb = positions[b.childId];
        if (!pa || !pb) return 0;
        return pa.x + pa.w / 2 - (pb.x + pb.w / 2);
      });
    }
    for (const list of byChild.values()) {
      list.sort((a, b) => {
        const pa = positions[a.parentId];
        const pb = positions[b.parentId];
        if (!pa || !pb) return 0;
        return pa.x + pa.w / 2 - (pb.x + pb.w / 2);
      });
    }

    return activeEdges
      .map((e) => {
        const from = positions[e.parentId];
        const to = positions[e.childId];
        if (!from || !to) return null;

        const outSiblings = byParent.get(e.parentId) ?? [];
        const outIdx = outSiblings.indexOf(e);
        const outCount = outSiblings.length;
        const exitX =
          from.x +
          from.w *
            (outCount <= 1 ? 0.5 : 0.2 + (0.6 * outIdx) / (outCount - 1));
        const exitY = from.y + from.h;

        const inSiblings = byChild.get(e.childId) ?? [];
        const inIdx = inSiblings.indexOf(e);
        const inCount = inSiblings.length;
        const entryX =
          to.x +
          to.w * (inCount <= 1 ? 0.5 : 0.2 + (0.6 * inIdx) / (inCount - 1));
        const entryY = to.y;

        // Short, smooth vertical-tangent bezier
        const dy = Math.max(18, Math.abs(entryY - exitY) * 0.5);
        const d = `M ${exitX} ${exitY} C ${exitX} ${exitY + dy}, ${entryX} ${
          entryY - dy
        }, ${entryX} ${entryY}`;

        return {
          key: `${e.parentId}-${e.childId}`,
          d,
          isForward: e.parentId === focusId,
        };
      })
      .filter(Boolean) as { key: string; d: string; isForward: boolean }[];
  }, [activeEdges, positions, focusId]);

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cRect = canvas.getBoundingClientRect();
    const next: typeof positions = {};
    for (const id in nodeRefs.current) {
      const el = nodeRefs.current[id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      next[id] = {
        x: r.left - cRect.left + canvas.scrollLeft,
        y: r.top - cRect.top + canvas.scrollTop,
        w: r.width,
        h: r.height,
      };
    }
    setPositions(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const t1 = setTimeout(measure, 60);
    const t2 = setTimeout(measure, 250);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
    };
  }, [bands, measure]);

  function registerRef(id: string, el: HTMLDivElement | null) {
    if (el) nodeRefs.current[id] = el;
    else delete nodeRefs.current[id];
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div
        ref={canvasRef}
        className="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated/20 p-5"
        onMouseLeave={() => setHoveredId(null)}
      >
        <div className="space-y-5">
          {bands.map((band) => (
            <BandSection
              key={band.id}
              band={band}
              selectedId={selectedId}
              connectedIds={connectedIds}
              focusId={focusId}
              onSelect={setSelectedId}
              onHover={setHoveredId}
              registerRef={registerRef}
            />
          ))}
        </div>

        {/* SVG edge overlay with arrowheads */}
        <svg
          className="pointer-events-none absolute inset-0"
          width="100%"
          height="100%"
          style={{ zIndex: 8 }}
        >
          <defs>
            <marker
              id="lt-arrow-forward"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--color-accent)" />
            </marker>
            <marker
              id="lt-arrow-back"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--color-sky)" />
            </marker>
          </defs>

          <AnimatePresence>
            {renderedEdges.map(({ key, d, isForward }) => {
              const color = isForward
                ? "var(--color-accent)"
                : "var(--color-sky)";
              const marker = isForward
                ? "url(#lt-arrow-forward)"
                : "url(#lt-arrow-back)";
              const glow = isForward
                ? "rgba(244,244,245,0.75)"
                : "rgba(244,244,245,0.75)";
              return (
                <motion.path
                  key={key}
                  d={d}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  stroke={color}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray="4 5"
                  markerEnd={marker}
                  style={{
                    filter: `drop-shadow(0 0 5px ${glow})`,
                  }}
                />
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      <div>
        {focusNode ? (
          <GlassPanel strong className="sticky top-20">
            <p className="label-mono">
              Skill · Difficulty {focusNode.difficulty}/5
            </p>
            <h3 className="mt-1 text-lg font-medium text-text-primary">
              {focusNode.name}
            </h3>
            <p className="mt-2 text-xs text-text-tertiary">
              {focusNode.description ?? "No description."}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="num rounded-md border border-border-default bg-bg-inset px-2 py-0.5 text-sm text-text-primary">
                {Math.round(focusNode.mastery * 100)}%
              </div>
              <span className="label-mono">effective mastery</span>
            </div>

            {focusNode.parents.length > 0 && (
              <div className="mt-5">
                <p className="label-mono mb-2">
                  Prerequisites · {focusNode.parents.length}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {focusNode.parents.slice(0, 8).map((p) => {
                    const parent = nodes.find((n) => n.id === p);
                    return (
                      <button
                        key={p}
                        onClick={() => setSelectedId(p)}
                        className="rounded-md border border-border-default bg-bg-inset px-2 py-0.5 text-xs text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
                      >
                        {parent?.name ?? p}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {focusNode.children.length > 0 && (
              <div className="mt-4">
                <p className="label-mono mb-2">
                  Unlocks · {focusNode.children.length}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {focusNode.children.slice(0, 8).map((c) => {
                    const child = nodes.find((n) => n.id === c);
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedId(c)}
                        className="rounded-md border border-border-default bg-bg-inset px-2 py-0.5 text-xs text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
                      >
                        {child?.name ?? c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Link
              href={`/learn/${focusNode.id}`}
              className="btn-primary mt-6 w-full justify-center"
            >
              Learn this →
            </Link>
          </GlassPanel>
        ) : (
          <GlassPanel className="sticky top-20 text-sm text-text-tertiary">
            <p className="label-mono mb-2">Tip</p>
            Hover any skill to highlight its prerequisites and unlocks. The
            rest of the graph dims so connections stand out.
          </GlassPanel>
        )}
      </div>
    </div>
  );
}

type BandProps = {
  band: (typeof BANDS)[number] & { items: GraphNode[] };
  selectedId: string | null;
  connectedIds: Set<string> | null;
  focusId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
};

function BandSection({
  band,
  selectedId,
  connectedIds,
  focusId,
  onSelect,
  onHover,
  registerRef,
}: BandProps) {
  const tone = TONES[band.tone];
  const Icon = band.icon;

  const attempted = band.items.filter((s) => s.mastery > 0);
  const avg =
    attempted.length > 0
      ? attempted.reduce((a, s) => a + s.mastery, 0) / attempted.length
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative rounded-xl border bg-bg-elevated/40 p-4 backdrop-blur-sm",
        tone.border,
        tone.bg
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md border",
              tone.border,
              tone.bg,
              tone.text
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {band.label}
            </p>
            <p className="text-[10px] text-text-quaternary">
              {band.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="label-mono">
            {attempted.length} / {band.items.length} attempted
          </span>
          {attempted.length > 0 && (
            <span className={cn("num font-medium", tone.text)}>
              {Math.round(avg * 100)}% avg
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {band.items.map((node, i) => {
          const isConnected = !connectedIds || connectedIds.has(node.id);
          return (
            <SkillCard
              key={node.id}
              node={node}
              index={i}
              selected={selectedId === node.id}
              focused={focusId === node.id}
              blurred={!isConnected}
              onSelect={() =>
                onSelect(selectedId === node.id ? null : node.id)
              }
              onHover={(h) => onHover(h ? node.id : null)}
              registerRef={(el) => registerRef(node.id, el)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

type CardProps = {
  node: GraphNode;
  index: number;
  selected: boolean;
  focused: boolean;
  blurred: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
  registerRef: (el: HTMLDivElement | null) => void;
};

function SkillCard({
  node,
  index,
  selected,
  focused,
  blurred,
  onSelect,
  onHover,
  registerRef,
}: CardProps) {
  const tier = masteryTone(node.mastery);
  const isDimmedDefault = node.mastery === 0 && !node.verified && !focused;

  return (
    <motion.div
      ref={registerRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.02 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border bg-bg-elevated/70 p-3",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        focused && "scale-[1.02] z-10",
        selected && "ring-2 ring-accent ring-offset-2 ring-offset-bg-base"
      )}
      style={{
        borderColor: focused || selected ? tier.border : `${tier.border}66`,
        boxShadow:
          focused || selected ? `0 0 24px -6px ${tier.glow}` : "none",
        filter: blurred ? "blur(6px)" : "none",
        opacity: blurred ? 0.28 : 1,
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-0.5"
        style={{
          backgroundColor: tier.border,
          boxShadow:
            tier.glow !== "transparent" ? `0 0 8px ${tier.glow}` : "none",
        }}
      />

      <div className="flex items-start gap-3 pl-1">
        <div className="shrink-0">
          <MiniRing value={node.mastery} size={36} stroke={3} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <p
              className={cn(
                "line-clamp-2 text-[13px] font-medium leading-snug",
                isDimmedDefault ? "text-text-tertiary" : "text-text-primary"
              )}
            >
              {node.name}
            </p>
            {node.verified && (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-primary" />
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-text-quaternary">
            <span className="num">D{node.difficulty}</span>
            {node.mastery > 0 && (
              <>
                <span>·</span>
                <span className="num">{tier.pct}%</span>
              </>
            )}
            {node.parents.length > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Lock className="h-2.5 w-2.5" />
                  {node.parents.length}
                </span>
              </>
            )}
            {node.children.length > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Network className="h-2.5 w-2.5" />
                  {node.children.length}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniRing({
  value,
  size = 36,
  stroke = 3,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  const offset = c * (1 - pct);
  const color =
    pct >= 0.75
      ? "#F4F4F5"
      : pct >= 0.5
      ? "rgba(244,244,245,0.55)"
      : pct > 0
      ? "rgba(244,244,245,0.28)"
      : "var(--color-border-default)";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--color-border-subtle)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}
