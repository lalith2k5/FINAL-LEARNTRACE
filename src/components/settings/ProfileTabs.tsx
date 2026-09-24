"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Palette,
  Activity as ActivityIcon,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "account" | "appearance" | "activity" | "danger";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "activity", label: "Activity", icon: ActivityIcon },
  { id: "danger", label: "Data", icon: AlertTriangle },
];

export function ProfileTabs({
  account,
  appearance,
  activity,
  danger,
}: {
  account: React.ReactNode;
  appearance: React.ReactNode;
  activity: React.ReactNode;
  danger: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>("account");

  const panels: Record<TabId, React.ReactNode> = {
    account,
    appearance,
    activity,
    danger,
  };

  return (
    <div className="max-w-4xl">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="relative flex items-center gap-1 border-b border-border-subtle"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {isActive && (
                <motion.span
                  layoutId="profile-tab-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {panels[active]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
