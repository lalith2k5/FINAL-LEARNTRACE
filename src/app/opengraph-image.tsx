import { ImageResponse } from "next/og";

export const alt = "LearnTrace — Built on evidence, not completion.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#08080A",
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(24,119,242,0.22), transparent 70%)",
          padding: 80,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top — brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: "#1877F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px -6px rgba(24,119,242,0.8)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <g
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.6"
              >
                <line x1="7" y1="17" x2="17" y2="17" />
                <line x1="7" y1="17" x2="12" y2="7" />
                <line x1="12" y1="7" x2="17" y2="17" />
              </g>
              <circle cx="7" cy="17" r="2" fill="#fff" />
              <circle cx="17" cy="17" r="2" fill="#fff" />
              <circle cx="12" cy="7" r="2.4" fill="#fff" />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.6)",
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            LearnTrace
          </div>
        </div>

        {/* Middle — tagline + story */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "#fff",
              fontSize: 88,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              maxWidth: 950,
            }}
          >
            <span>Built on evidence,</span>
            <span style={{ color: "#5EB8FF" }}>not completion.</span>
          </div>
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.5)",
              fontSize: 26,
              lineHeight: 1.4,
              maxWidth: 820,
              letterSpacing: "-0.01em",
            }}
          >
            Every learning platform tracks what you clicked. None of them
            track what you actually know.
          </div>
        </div>

        {/* Bottom — footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "rgba(255,255,255,0.35)",
            fontSize: 18,
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.1em",
          }}
        >
          <span>learntrace.app</span>
          <span>Adaptive learning, traced.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
