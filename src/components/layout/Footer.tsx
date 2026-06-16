import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { contact } from "@/content/contact";
import { navLinks, siteConfig, socialLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FooterProps = {
  className?: string;
};

const footerSocialLinks = [
  { id: "github", label: "GitHub", href: contact.github },
  { id: "linkedin", label: "LinkedIn", href: contact.linkedin },
  ...socialLinks.filter((link) => link.id === "twitter"),
];

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-border/60 py-12", className)}>
      <Container size="wide">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{siteConfig.author}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              AI Full-Stack Engineer building intelligent, production-grade web experiences.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              © {year} {siteConfig.author}. All rights reserved.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Quick links
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
                >
                  All articles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Connect
            </p>
            <ul className="mt-4 flex flex-wrap gap-4">
              {footerSocialLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`mailto:${contact.email}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
                >
                  Email
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
