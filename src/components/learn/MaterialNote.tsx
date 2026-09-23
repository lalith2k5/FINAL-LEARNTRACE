"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Props = {
  body: string;
  className?: string;
};

/**
 * Renders a markdown note with the LearnTrace design system applied.
 * Custom element mapping keeps content readable inside glass panels.
 */
export function MaterialNote({ body, className }: Props) {
  return (
    <div className={cn("material-note", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-6 mb-3 text-xl font-semibold tracking-tight text-text-primary first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-2 text-lg font-semibold tracking-tight text-text-primary first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 text-base font-medium text-text-primary first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-3 text-sm leading-relaxed text-text-secondary first:mt-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-5 text-sm text-text-secondary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 leading-relaxed marker:text-text-quaternary">
              {children}
            </li>
          ),
          code: ({ children, className }) => {
            const isBlock = (className ?? "").startsWith("language-");
            if (isBlock) {
              return (
                <code className="block rounded-lg border border-border-subtle bg-bg-inset px-3 py-2 text-xs text-text-primary">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-bg-inset px-1 py-0.5 text-[12px] text-text-primary">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg border border-border-subtle bg-bg-inset p-3 text-xs leading-relaxed">
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline decoration-accent/30 transition-colors hover:decoration-accent"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-l-accent/50 bg-accent/5 py-1 pl-3 text-sm italic text-text-secondary">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-text-primary">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-text-secondary">{children}</em>
          ),
          hr: () => <hr className="my-4 border-border-subtle" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border-subtle bg-bg-inset/60 px-3 py-2 text-left font-medium text-text-primary">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border-subtle px-3 py-2 text-text-secondary last:border-0">
              {children}
            </td>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
