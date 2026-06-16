"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { NavigationLinks } from "@/components/layout/NavigationLinks";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSection: string | null;
};

export function MobileMenu({ open, onOpenChange, activeSection }: MobileMenuProps) {
  const panelId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => onOpenChange(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-[60] transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          tabIndex={open ? 0 : -1}
          aria-label="Close navigation menu"
        />

        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            "absolute top-0 right-0 flex h-full w-full max-w-sm flex-col border-l border-border/60 bg-background shadow-xl",
            "transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Menu</p>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                aria-label="Close navigation menu"
              >
                <X className="size-5" aria-hidden />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <NavigationLinks
              activeSection={activeSection}
              orientation="vertical"
              onNavigate={() => onOpenChange(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
