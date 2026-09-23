"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";

type Certificate = {
  title: string;
  provider: string;
  url: string;
  why: string;
};

type Props = {
  domainName: string;
  strongSkills: string[];
  weakSkills: string[];
  attemptedCount: number;
  avgMastery: number;
};

export function CertificatePanel(props: Props) {
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/ai/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(props),
        });
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.certificates) && data.certificates.length > 0) {
          setCerts(data.certificates);
        } else {
          setFallback(true);
        }
      } catch {
        if (!cancelled) setFallback(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_#1877F2]" />
        <p className="label-mono text-accent">AI Career Advisor</p>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <GlassPanel key={i} className="h-40">
              <div className="h-3 w-1/3 animate-pulse rounded bg-bg-inset" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-bg-inset" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-bg-inset" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-bg-inset" />
            </GlassPanel>
          ))}
        </div>
      )}

      {!loading && certs && (
        <div className="grid gap-4 md:grid-cols-3">
          {certs.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <GlassPanel glow className="h-full">
                <p className="label-mono">{c.provider}</p>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  {c.title}
                </p>
                <p className="mt-3 text-xs text-text-tertiary">{c.why}</p>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost mt-4 text-xs"
                >
                  View course →
                </a>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && fallback && (
        <GlassPanel className="p-6 text-sm text-text-tertiary">
          Career recommendations are temporarily unavailable. Try again later.
        </GlassPanel>
      )}
    </section>
  );
}
