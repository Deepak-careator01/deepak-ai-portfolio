import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContactLinkCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
  className?: string;
};

export function ContactLinkCard({
  title,
  description,
  href,
  icon,
  external = false,
  className,
}: ContactLinkCardProps) {
  const linkProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" as const }
    : {};

  return (
    <a
      href={href}
      {...linkProps}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60",
        "bg-gradient-to-br from-card/80 to-muted/15 p-6 shadow-sm",
        "transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gradient-hero-start)_0%,_transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/60">
          {icon}
        </div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}
