"use client";

/**
 * Fires a LearnTrace-branded celebration burst.
 * Uses the Facebook blue palette to match the theme.
 * Silently no-ops if the library fails to load.
 */
export async function celebrateSkillVerified() {
  try {
    const { default: confetti } = await import("canvas-confetti");

    const colors = ["#1877F2", "#4293F5", "#5EB8FF", "#F4F4F5", "#F4F4F5"];

    // Center burst
    confetti({
      particleCount: 80,
      spread: 70,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.55 },
      colors,
      scalar: 0.9,
      ticks: 200,
      zIndex: 9999,
    });

    // Left + right complements after a tick
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
        scalar: 0.8,
        zIndex: 9999,
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
        scalar: 0.8,
        zIndex: 9999,
      });
    }, 120);
  } catch {
    // Ignore — confetti is not critical
  }
}
