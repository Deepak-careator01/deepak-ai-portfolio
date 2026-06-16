"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Container } from "@/components/layout/Container";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavigationLinks } from "@/components/layout/NavigationLinks";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { siteConfig } from "@/lib/constants";
import { homeSectionIds } from "@/lib/nav";
import { cn } from "@/lib/utils";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeSection = useScrollSpy(homeSectionIds, { enabled: isHomePage });

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70",
        className,
      )}
    >
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-md px-1 py-1"
          >
            {siteConfig.name}
          </Link>

          <NavigationLinks
            activeSection={activeSection}
            orientation="horizontal"
            className="hidden md:block"
          />

          <div className="flex items-center gap-1">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <MobileMenu
              open={mobileOpen}
              onOpenChange={setMobileOpen}
              activeSection={activeSection}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
