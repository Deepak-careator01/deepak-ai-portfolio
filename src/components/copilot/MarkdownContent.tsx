import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("prose-copilot", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h1: ({ className: headingClassName, ...props }: ComponentPropsWithoutRef<"h1">) => (
          <h1
            className={cn("mt-4 mb-2 text-base font-semibold text-foreground", headingClassName)}
            {...props}
          />
        ),
        h2: ({ className: headingClassName, ...props }: ComponentPropsWithoutRef<"h2">) => (
          <h2
            className={cn("mt-4 mb-2 text-sm font-semibold text-foreground", headingClassName)}
            {...props}
          />
        ),
        h3: ({ className: headingClassName, ...props }: ComponentPropsWithoutRef<"h3">) => (
          <h3
            className={cn("mt-3 mb-1.5 text-sm font-semibold text-foreground", headingClassName)}
            {...props}
          />
        ),
        p: ({ className: paragraphClassName, ...props }: ComponentPropsWithoutRef<"p">) => (
          <p
            className={cn("mb-2 text-sm leading-relaxed last:mb-0", paragraphClassName)}
            {...props}
          />
        ),
        ul: ({ className: listClassName, ...props }: ComponentPropsWithoutRef<"ul">) => (
          <ul
            className={cn("mb-2 list-disc space-y-1 pl-5 text-sm last:mb-0", listClassName)}
            {...props}
          />
        ),
        ol: ({ className: listClassName, ...props }: ComponentPropsWithoutRef<"ol">) => (
          <ol
            className={cn("mb-2 list-decimal space-y-1 pl-5 text-sm last:mb-0", listClassName)}
            {...props}
          />
        ),
        li: ({ className: itemClassName, ...props }: ComponentPropsWithoutRef<"li">) => (
          <li className={cn("leading-relaxed", itemClassName)} {...props} />
        ),
        a: ({ className: anchorClassName, href, ...props }: ComponentPropsWithoutRef<"a">) => {
          const isExternal = href?.startsWith("http");

          if (isExternal) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "font-medium text-foreground underline underline-offset-4",
                  anchorClassName,
                )}
                {...props}
              />
            );
          }

          return (
            <Link
              href={href ?? "#"}
              className={cn(
                "font-medium text-foreground underline underline-offset-4",
                anchorClassName,
              )}
              {...props}
            />
          );
        },
        code: ({ className: codeClassName, children, ...props }: ComponentPropsWithoutRef<"code">) => {
          const isBlock = codeClassName?.includes("language-");

          if (isBlock) {
            return (
              <code
                className={cn("font-mono text-xs text-foreground", codeClassName)}
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code
              className={cn(
                "rounded-md border border-border/60 bg-muted/50 px-1 py-0.5 font-mono text-xs",
                codeClassName,
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ className: preClassName, ...props }: ComponentPropsWithoutRef<"pre">) => (
          <pre
            className={cn(
              "my-2 overflow-x-auto rounded-lg border border-border/60 bg-muted/30 p-3 text-xs",
              preClassName,
            )}
            {...props}
          />
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
