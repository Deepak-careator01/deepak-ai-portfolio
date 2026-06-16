import type { SectionId } from "@/types/portfolio";

import { navLinks } from "@/lib/constants";

/** Section IDs used for homepage scroll spy and anchor navigation. */
export const homeSectionIds: SectionId[] = navLinks
  .map((link) => link.sectionId)
  .filter((id): id is SectionId => Boolean(id));

/** Pixel offset matching sticky navbar + scroll-margin (h-16 + scroll-mt-20). */
export const NAV_SCROLL_OFFSET = 80;
