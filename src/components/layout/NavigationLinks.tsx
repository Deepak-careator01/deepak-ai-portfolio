"use client";

import Link from "next/link";

import type { NavItem } from "@/types/portfolio";

import { navLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";

type NavigationLinksProps = {
  activeSection: string | null;
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  listClassName?: string;
};

function isActive(link: NavItem, activeSection: string | null): boolean {
  return Boolean(link.sectionId && activeSection === link.sectionId);
}

export function NavigationLinks({
  activeSection,
  onNavigate,
  orientation = "horizontal",
  className,
  listClassName,
}: NavigationLinksProps) {
  return (
    <nav className={className} aria-label={orientation === "vertical" ? "Mobile menu" : undefined}>
      <ul
        className={cn(
          orientation === "horizontal"
            ? "flex items-center gap-1"
            : "flex flex-col gap-1",
          listClassName,
        )}
      >
        {navLinks.map((link) => {
          const active = isActive(link, activeSection);

          return (
            <li key={link.id}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  orientation === "vertical" && "block w-full px-4 py-3 text-base",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                aria-current={active ? "true" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
