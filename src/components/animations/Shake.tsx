"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type Props = HTMLMotionProps<"div"> & {
  /** Trigger counter — increment this to re-play the shake */
  trigger: number;
  /** Intensity — 0 = none, 1 = default, 2 = strong */
  intensity?: 0 | 1 | 2;
};

const amt = (i: number) => [0, 6, 12][i];

export const Shake = forwardRef<HTMLDivElement, Props>(
  ({ children, trigger, intensity = 1, ...rest }, ref) => {
    if (!trigger || intensity === 0) {
      return (
        <motion.div ref={ref} {...rest}>
          {children}
        </motion.div>
      );
    }

    const x = amt(intensity);
    const keyframes = [0, -x, x, -x * 0.7, x * 0.7, -x * 0.4, 0];

    return (
      <motion.div
        ref={ref}
        key={trigger}
        animate={{ x: keyframes }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);
Shake.displayName = "Shake";
