import type { Variants } from "framer-motion";

/** Shared motion variants — keep animations subtle and consistent */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const defaultTransition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1] as const,
};
