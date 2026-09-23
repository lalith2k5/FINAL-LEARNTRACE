"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Vercel/Linear-style radial glow that smoothly follows the cursor.
 * - GPU-accelerated (transform only)
 * - Lerped for a silky trail
 * - Subtle by default; disabled on touch / reduced-motion
 */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [enabled, setEnabled] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (touch || reduced) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    function onMove(e: PointerEvent) {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (el) el.style.opacity = "1";
    }
    function onLeave() {
      if (el) el.style.opacity = "0";
    }

    function loop() {
      current.current.x += (target.current.x - current.current.x) * 0.14;
      current.current.y += (target.current.y - current.current.y) * 0.14;
      if (el) {
        el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const isLight = resolvedTheme === "light";
  // Much softer than before: 0.16 → 0.06, 0.055 → 0.03
  const color = isLight
    ? "rgba(0, 0, 0, 0.03)"
    : "rgba(24, 119, 242, 0.06)";
  const mid = isLight
    ? "rgba(0, 0, 0, 0.015)"
    : "rgba(24, 119, 242, 0.025)";

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[520px] w-[520px] opacity-0 transition-opacity duration-700"
      style={{
        background: `radial-gradient(circle, ${color} 0%, ${mid} 35%, transparent 70%)`,
        mixBlendMode: isLight ? "multiply" : "screen",
        filter: "blur(60px)",
        willChange: "transform",
      }}
    />
  );
}
