import type { ReactNode } from "react";

type MarketingLayoutProps = {
  children: ReactNode;
};

/**
 * Layout for public marketing routes (portfolio pages).
 * Keeps portfolio routes separate from future app/API routes.
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return children;
}
