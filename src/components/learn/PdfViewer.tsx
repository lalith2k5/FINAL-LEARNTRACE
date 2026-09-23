"use client";

import { useState } from "react";
import { FileText, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  title: string;
  compact?: boolean;
};

export function PdfViewer({ url, title, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border-subtle bg-bg-inset",
          compact ? "h-64" : "h-[600px]"
        )}
      >
        <div className="flex items-center justify-between border-b border-border-subtle bg-bg-inset/60 px-3 py-1.5">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="label-mono truncate">{title}</span>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="btn-ghost text-xs"
            title="Open in fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <iframe
          src={`${url}#toolbar=0`}
          className="h-[calc(100%-34px)] w-full border-0 bg-[#0A0A0C]"
          title={title}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border-default bg-bg-overlay shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)]"
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
              <iframe
                src={`${url}#toolbar=0`}
                className="h-full w-full border-0 bg-[#0A0A0C]"
                title={title}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
