import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  id: string;
  children: ReactNode;
  className?: string;
  /** ID of the element that labels this section for screen readers */
  labelledBy?: string;
  /** Reduce vertical padding for compact sections */
  spacing?: "default" | "compact" | "hero";
};

const spacingClasses = {
  default: "py-20 md:py-28",
  compact: "py-14 md:py-20",
  hero: "py-24 md:py-32 lg:py-40",
} as const;

export function Section({
  id,
  children,
  className,
  labelledBy,
  spacing = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative scroll-mt-20", spacingClasses[spacing], className)}
    >
      {children}
    </section>
  );
}
