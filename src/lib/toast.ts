"use client";

import { toast } from "sonner";

/**
 * Thin wrapper around sonner with LearnTrace defaults.
 * Keeps a single place to tune tone, wording, and icons.
 */
export const notify = {
  success(message: string, description?: string) {
    toast.success(message, { description });
  },
  error(message: string, description?: string) {
    toast.error(message, { description });
  },
  info(message: string, description?: string) {
    toast.info(message, { description });
  },
  warn(message: string, description?: string) {
    toast.warning(message, { description });
  },
  /** Loading → Success pattern for async work */
  promise<T>(
    promise: Promise<T>,
    opts: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) {
    return toast.promise(promise, opts);
  },
};
