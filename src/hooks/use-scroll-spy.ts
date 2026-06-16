"use client";

import { useEffect, useRef, useState } from "react";

import { NAV_SCROLL_OFFSET } from "@/lib/nav";

type UseScrollSpyOptions = {
  offset?: number;
  enabled?: boolean;
};

/**
 * Tracks the section currently visible in the viewport.
 * Uses IntersectionObserver with rAF batching to limit re-renders.
 */
export function useScrollSpy(
  sectionIds: string[],
  { offset = NAV_SCROLL_OFFSET, enabled = true }: UseScrollSpyOptions = {},
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const sectionKey = sectionIds.join("|");

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) {
      setActiveId(null);
      return;
    }

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      setActiveId(null);
      return;
    }

    const visibleSections = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleSections.set(entry.target.id, entry.intersectionRatio);
        }

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
          let nextActive: string | null = null;
          let highestRatio = 0;

          for (const [id, ratio] of visibleSections) {
            if (ratio > highestRatio) {
              highestRatio = ratio;
              nextActive = id;
            }
          }

          if (nextActive) {
            setActiveId(nextActive);
          }
        });
      },
      {
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: [0, 0.15, 0.35, 0.5, 0.75, 1],
      },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      visibleSections.clear();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, offset, sectionKey, sectionIds]);

  return activeId;
}
