import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/providers/Toaster";
import { CursorSpotlight } from "@/components/animations/CursorSpotlight";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://learntrace.app";
const TAGLINE = "Built on evidence, not completion.";
const STORY =
  "Every learning platform tracks what you clicked. None of them track what you actually know.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `LearnTrace — ${TAGLINE}`,
    template: "%s · LearnTrace",
  },
  description: STORY,
  applicationName: "LearnTrace",
  keywords: [
    "adaptive learning",
    "knowledge graph",
    "knowledge tracing",
    "skill gap detection",
    "personalized learning",
    "mastery tracking",
  ],
  authors: [{ name: "LearnTrace" }],
  creator: "LearnTrace",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "LearnTrace",
    title: `LearnTrace — ${TAGLINE}`,
    description: STORY,
  },
  twitter: {
    card: "summary_large_image",
    title: `LearnTrace — ${TAGLINE}`,
    description: STORY,
    creator: "@learntrace",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <CursorSpotlight />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
