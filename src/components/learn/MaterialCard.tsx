"use client";

import { useTransition, useState, useRef } from "react";
import {
  Check,
  ExternalLink,
  FileText,
  Play,
  BookOpen,
  Circle,
  Upload,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { MaterialNote } from "./MaterialNote";
import { PdfViewer } from "./PdfViewer";
import { VideoEmbed } from "./VideoEmbed";
import { cn } from "@/lib/utils";
import { toggleMaterialComplete } from "@/app/(app)/learn/[skillId]/actions";
import { notify } from "@/lib/toast";

type Material = {
  id: string;
  title: string;
  type: string;
  url: string | null;
  body: string | null;
  pdfUrl: string | null;
};

type Props = {
  material: Material;
  skillId: string;
  completed: boolean;
  index: number;
};

const ICONS = {
  note: FileText,
  link: ExternalLink,
  video: Play,
  pdf: FileText,
  default: BookOpen,
};

function isEmbeddableVideo(url: string | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      u.hostname.includes("youtube.com") ||
      u.hostname === "youtu.be" ||
      u.hostname.includes("vimeo.com")
    );
  } catch {
    return false;
  }
}

export function MaterialCard({ material, skillId, completed, index }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticComplete, setOptimisticComplete] = useState(completed);
  const [noteOpen, setNoteOpen] = useState(material.type === "note");
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(material.pdfUrl);
  const [videoOpen, setVideoOpen] = useState(
    material.type === "video" && isEmbeddableVideo(material.url)
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const Icon =
    (ICONS as Record<string, typeof FileText>)[material.type] ?? ICONS.default;
  const embeddableVideo = isEmbeddableVideo(material.url);

  function handleToggle() {
    const next = !optimisticComplete;
    setOptimisticComplete(next);
    startTransition(async () => {
      try {
        await toggleMaterialComplete(material.id, next, skillId);
        if (next) {
          notify.success("Material completed", material.title);
        } else {
          notify.info("Marked as incomplete", material.title);
        }
      } catch {
        setOptimisticComplete(!next);
        notify.error("Couldn't update", "Please try again.");
      }
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`/api/materials/${material.id}/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed");
        notify.error("Upload failed", data.error ?? undefined);
        setUploading(false);
        return;
      }

      setPdfUrl(data.pdfUrl);
      setPdfOpen(true);
      notify.success("PDF uploaded", material.title);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <GlassPanel
        glow
        className={cn(
          "relative overflow-hidden",
          optimisticComplete && "border-white/[0.12]/30"
        )}
      >
        {optimisticComplete && (
          <div className="absolute left-0 top-0 h-full w-0.5 bg-white/[0.08] shadow-[0_0_8px_#F4F4F5]" />
        )}

        <div className="flex items-start justify-between gap-4 pl-2">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                optimisticComplete
                  ? "border-white/[0.12]/40 bg-white/[0.06] text-text-primary"
                  : "border-border-default bg-bg-inset text-text-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="label-mono">
                {material.type}
                {pdfUrl ? " · PDF" : ""}
                {embeddableVideo ? " · Embed" : ""}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-medium transition-colors",
                  optimisticComplete
                    ? "text-text-secondary line-through decoration-white/30"
                    : "text-text-primary"
                )}
              >
                {material.title}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Video: inline toggle */}
            {embeddableVideo && (
              <button
                onClick={() => setVideoOpen((v) => !v)}
                className="btn-ghost text-xs"
                title={videoOpen ? "Hide video" : "Play video"}
              >
                <Play className="h-3.5 w-3.5" />
                {videoOpen ? "Hide" : "Play"}
              </button>
            )}

            {/* External link (only when NOT embeddable, so we don't duplicate) */}
            {material.url && !embeddableVideo && (
              <a
                href={material.url}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost text-xs"
                title="Open external resource"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {/* PDF */}
            {pdfUrl ? (
              <button
                onClick={() => setPdfOpen((v) => !v)}
                className="btn-ghost text-xs"
                title={pdfOpen ? "Hide PDF" : "Show PDF"}
              >
                <FileText className="h-3.5 w-3.5" />
                {pdfOpen ? "Hide" : "Open"}
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={cn(
                  "btn-ghost text-xs",
                  uploading && "cursor-wait opacity-60"
                )}
                title="Upload a PDF"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {uploading ? "Uploading..." : "Upload PDF"}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              className="hidden"
            />

            <button
              onClick={handleToggle}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all",
                optimisticComplete
                  ? "border-white/[0.12]/40 bg-white/[0.06] text-text-primary"
                  : "border-border-default bg-bg-inset/40 text-text-secondary hover:border-border-strong hover:text-text-primary",
                isPending && "opacity-60"
              )}
            >
              {optimisticComplete ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  Mark complete
                </>
              )}
            </button>
          </div>
        </div>

        {uploadError && (
          <p className="mt-3 pl-2 text-xs text-text-tertiary">{uploadError}</p>
        )}

        {/* Video embed */}
        <AnimatePresence>
          {embeddableVideo && videoOpen && material.url && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden border-t border-border-subtle pt-4"
            >
              <VideoEmbed url={material.url} title={material.title} compact />
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF viewer */}
        <AnimatePresence>
          {pdfUrl && pdfOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden border-t border-border-subtle pt-4"
            >
              <PdfViewer url={pdfUrl} title={material.title} compact />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Markdown body for notes */}
        {material.type === "note" && material.body && (
          <>
            <button
              onClick={() => setNoteOpen((v) => !v)}
              className="mt-4 flex items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
            >
              {noteOpen ? "Hide note" : "Show note"}
            </button>
            {noteOpen && (
              <div className="mt-4 border-t border-border-subtle pt-4">
                <MaterialNote body={material.body} />
              </div>
            )}
          </>
        )}

        {material.type === "note" && !material.body && (
          <p className="mt-4 text-xs italic text-text-quaternary">
            No content yet — will be generated.
          </p>
        )}
      </GlassPanel>
    </motion.div>
  );
}
