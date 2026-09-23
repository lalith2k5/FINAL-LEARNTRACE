"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LogOut,
  ChevronDown,
  Search,
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
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };
type Group = { label: string; items: NavItem[] };

const GROUPS: Group[] = [
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
      { href: "/profile/history", label: "History", icon: History },
    ],
  },
];

const TITLE_MAP: Record<string, string> = {
  "/domains": "Domains",
  "/dashboard": "Dashboard",
  "/assessment": "Assessment",
  "/graph": "Knowledge Graph",
  "/gaps": "Skill Gaps",
  "/roadmap": "Roadmap",
  "/practice": "Practice",
  "/simulator": "What-If Simulator",
  "/report": "Report",
  "/profile": "Profile",
  "/profile/history": "History",
};

function initials(name?: string | null, email?: string | null) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

export function Topbar() {
  const path = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const navRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const title = TITLE_MAP[path] ?? "LearnTrace";
  const user = session?.user;
  const displayName = user?.name ?? user?.email ?? "Account";
  const avatar = initials(user?.name, user?.email);

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return GROUPS;
    const q = query.toLowerCase();
    return GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  // Flat list for arrow-key navigation
  const flat = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups]
  );

  // Reset highlight when query changes
  useEffect(() => setActiveIndex(0), [query]);

  // Focus search when opening
  useEffect(() => {
    if (navOpen) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
      setActiveIndex(0);
    }
  }, [navOpen]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setNavOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ⌘K / Ctrl+K opens, Esc closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setNavOpen((v) => !v);
      } else if (e.key === "Escape" && navOpen) {
        setNavOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const closeNav = useCallback(() => setNavOpen(false), []);

  function handleNavKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[activeIndex];
      if (item) {
        router.push(item.href);
        closeNav();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeNav();
    }
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  // Find current index for the "highlight current page" effect
  const isCurrent = (href: string) =>
    path === href || path.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-base/70 px-6 backdrop-blur-xl">
      {/* ---------- Breadcrumb dropdown ---------- */}
      <div className="flex items-center gap-3">
        <Logo size={22} showWordmark={false} />
        <div ref={navRef} className="relative">
        <button
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          className={cn(
            "flex h-8 items-center gap-2 rounded-lg px-2 transition-colors duration-200",
            "hover:bg-bg-inset/60",
            navOpen && "bg-bg-inset"
          )}
          aria-expanded={navOpen}
          aria-haspopup="menu"
        >
          <span className="label-mono">Overview</span>
          <span className="text-text-quaternary">/</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={title}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="text-sm font-medium text-text-primary"
            >
              {title}
            </motion.span>
          </AnimatePresence>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-text-tertiary transition-transform duration-300",
              navOpen && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border-default bg-bg-overlay/95 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
              role="menu"
            >
              {/* Search bar */}
              <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleNavKey}
                  placeholder="Search pages…"
                  className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-quaternary"
                />
                <kbd className="shrink-0 rounded border border-border-default bg-bg-inset px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
                  esc
                </kbd>
              </div>

              {/* Grouped items */}
              <div className="max-h-80 overflow-y-auto p-1.5">
                {filteredGroups.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-text-tertiary">
                    No pages match &quot;{query}&quot;
                  </p>
                ) : (
                  filteredGroups.map((g) => (
                    <div key={g.label} className="mb-1">
                      <p className="label-mono px-2 py-1.5 text-[10px] text-text-quaternary">
                        {g.label}
                      </p>
                      {g.items.map((item) => {
                        const Icon = item.icon;
                        const idx = flat.indexOf(item);
                        const isActive = idx === activeIndex;
                        const isCurrentPage = isCurrent(item.href);
                        return (
                          <button
                            key={item.href}
                            role="menuitem"
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => {
                              router.push(item.href);
                              closeNav();
                            }}
                            className={cn(
                              "relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-150",
                              isActive
                                ? "bg-bg-inset text-text-primary"
                                : "text-text-secondary hover:text-text-primary"
                            )}
                          >
                            {isCurrentPage && (
                              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_rgba(244,244,245,0.9)]" />
                            )}
                            <Icon className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                            <span className="truncate">{item.label}</span>
                            {isCurrentPage && (
                              <span className="ml-auto shrink-0 text-[10px] text-text-quaternary">
                                current
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between border-t border-border-subtle bg-bg-base/50 px-3 py-2 text-[10px] text-text-quaternary">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border-default bg-bg-inset px-1 py-0.5 font-mono">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border-default bg-bg-inset px-1 py-0.5 font-mono">
                    ↵
                  </kbd>
                  open
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border-default bg-bg-inset px-1 py-0.5 font-mono">
                    ⌘K
                  </kbd>
                  toggle
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      {/* ---------- Right side: shortcut hint + user menu ---------- */}
      <div className="flex items-center gap-2">
        {/* ⌘K hint chip */}
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="hidden h-8 items-center gap-1.5 rounded-lg border border-border-default bg-bg-elevated/40 px-2.5 text-[11px] text-text-tertiary transition-colors hover:border-border-strong hover:text-text-secondary md:flex"
        >
          <Search className="h-3 w-3" />
          <span>Quick jump</span>
          <kbd className="ml-0.5 rounded border border-border-default bg-bg-inset px-1 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex h-8 items-center gap-2 rounded-full border border-border-default bg-bg-elevated/60 pl-1 pr-3 transition-all duration-200 hover:border-border-strong",
              menuOpen && "border-border-strong"
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan text-[10px] font-semibold text-white">
              {status === "loading" ? "··" : avatar}
            </span>
            <span className="max-w-[140px] truncate text-xs text-text-secondary">
              {status === "loading" ? "Loading..." : displayName}
            </span>
            <ChevronDown
              className={cn(
                "h-3 w-3 text-text-tertiary transition-transform duration-300",
                menuOpen && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {menuOpen && user && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border-default bg-bg-overlay/95 p-1 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
              >
                <div className="px-3 py-2">
                  <p className="truncate text-xs font-medium text-text-primary">
                    {user.name ?? "Learner"}
                  </p>
                  <p className="truncate text-[11px] text-text-tertiary">
                    {user.email}
                  </p>
                </div>
                <div className="my-1 h-px bg-border-subtle" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-inset hover:text-text-primary"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click-outside for user menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}
    </header>
  );
}
