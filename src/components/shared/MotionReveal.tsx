"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { defaultTransition, fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Lightweight motion wrapper for section entrances.
 * Respects prefers-reduced-motion.
 */
export function MotionReveal({ children, className, delay = 0 }: MotionRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-48px" }}
      variants={fadeInUp}
      transition={{ ...defaultTransition, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
