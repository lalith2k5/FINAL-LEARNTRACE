"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  LayoutGrid,
  LayoutDashboard,
  Network,
  Target,
  Map as MapIcon,
  FlaskConical,
  FileText,
  ClipboardCheck,
  Code2,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Learn",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/assessment", label: "Assessment", icon: ClipboardCheck },
      { href: "/graph", label: "Knowledge Graph", icon: Network },
    ],
  },
  {
    label: "Progress",
    items: [
      { href: "/gaps", label: "Skill Gaps", icon: Target },
      { href: "/roadmap", label: "Roadmap", icon: MapIcon },
      { href: "/practice", label: "Practice", icon: Code2 },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/simulator", label: "Simulator", icon: FlaskConical },
      { href: "/report", label: "Report", icon: FileText },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/domains", label: "Domains", icon: LayoutGrid },
      { href: "/profile", label: "Profile", icon: UserCircle },
    ],
  },
];

const itemContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.025, delayChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

// Shared spring for the sliding pill + bar
const pillSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 34,
  mass: 0.8,
};

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col overflow-hidden border-r border-border-subtle bg-bg-elevated/60 backdrop-blur-xl">
      {/* ---------- Brand ---------- */}
      <Link
        href="/dashboard"
        className="group flex items-center gap-2 px-5 py-5"
      >
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-text-secondary transition-colors group-hover:text-text-primary">
          LearnTrace
        </span>
      </Link>

      {/* ---------- Nav ---------- */}
      <nav
        className="mt-1 flex-1 space-y-6 overflow-y-auto overscroll-contain px-3 pb-4"
        data-lenis-prevent
      >
        {groups.map((group) => (
          <motion.div
            key={group.label}
            initial="hidden"
            animate="visible"
            variants={itemContainer}
          >
            <p className="label-mono mb-2 px-3 text-[10px] text-text-quaternary">
              {group.label}
            </p>

            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = path === href || path.startsWith(href + "/");

                return (
                  <motion.div key={href} variants={itemVariants}>
                    <Link
                      href={href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none",
                        "transition-colors duration-200",
                        active
                          ? "text-text-primary" // no hover on active
                          : "text-text-secondary hover:bg-bg-inset/40 hover:text-text-primary"
                      )}
                    >
                      {/* Sliding active pill */}
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          transition={pillSpring}
                          className="absolute inset-0 rounded-lg bg-bg-inset shadow-[inset_0_0_0_1px_var(--color-border-default)]"
                          style={{ zIndex: 0 }}
                        />
                      )}

                      {/* Left glow bar — travels with the pill */}
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-bar"
                          transition={pillSpring}
                          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_rgba(244,244,245, 0.9)]"
                          style={{ zIndex: 2 }}
                        />
                      )}

                      {/* Icon */}
                      <Icon
                        className={cn(
                          "relative h-4 w-4 shrink-0 transition-all duration-300",
                          "group-hover:scale-110",
                          active ? "text-accent" : "text-current"
                        )}
                        style={{ zIndex: 1 }}
                      />

                      {/* Label */}
                      <span
                        className="relative truncate"
                        style={{ zIndex: 1 }}
                      >
                        {label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </nav>

      {/* ---------- Footer ---------- */}
      <div className="border-t border-border-subtle px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="label-mono">v0.1</p>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-lt-pulse-dot" />
            <span className="label-mono text-text-primary">ML Track</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
