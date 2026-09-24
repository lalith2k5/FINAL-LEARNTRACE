"use client";

import { useState } from "react";
import { Play, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  title: string;
  compact?: boolean;
};

/**
 * Detect YouTube / Vimeo and return an embed URL.
 * Returns null if the URL isn't a supported video platform.
 */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    // YouTube — youtube.com/watch?v=ID  or  youtu.be/ID
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      // Playlist — youtube.com/playlist?list=ID
      const list = u.searchParams.get("list");
      if (u.pathname === "/playlist" && list) {
        return `https://www.youtube.com/embed/videoseries?list=${list}`;
      }
      // Already an embed URL
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Vimeo — vimeo.com/ID
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/^\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }

    return null;
  } catch {
    return null;
  }
}

export function VideoEmbed({ url, title, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const embedUrl = toEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="btn-ghost text-xs"
      >
        <Play className="h-3.5 w-3.5" />
        Watch on {new URL(url).hostname.replace("www.", "")}
      </a>
    );
  }

  const aspect = "aspect-video";

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-inset">
        <div className="flex items-center justify-between border-b border-border-subtle bg-bg-inset/60 px-3 py-1.5">
          <div className="flex items-center gap-2">
            <Play className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="label-mono truncate">{title}</span>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="btn-ghost text-xs"
            title="Open fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className={cn("w-full", aspect)}>
          <iframe
            src={embedUrl}
            className="h-full w-full border-0"
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border-default bg-bg-overlay shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                <span className="label-mono truncate">{title}</span>
                <button
                  onClick={() => setExpanded(false)}
                  className="btn-ghost"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  className="h-full w-full border-0"
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
