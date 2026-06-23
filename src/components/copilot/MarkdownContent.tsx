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
    <div className={cn("prose-copilot text-sm text-foreground/95", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h1: ({ className: headingClassName, ...props }: ComponentPropsWithoutRef<"h1">) => (
          <h1
            className={cn("mt-5 mb-2 text-base font-semibold tracking-tight text-foreground first:mt-0", headingClassName)}
            {...props}
          />
        ),
        h2: ({ className: headingClassName, ...props }: ComponentPropsWithoutRef<"h2">) => (
          <h2
            className={cn("mt-5 mb-2 text-sm font-semibold tracking-tight text-foreground first:mt-0", headingClassName)}
            {...props}
          />
        ),
        h3: ({ className: headingClassName, ...props }: ComponentPropsWithoutRef<"h3">) => (
          <h3
            className={cn("mt-4 mb-1.5 text-sm font-semibold text-foreground first:mt-0", headingClassName)}
            {...props}
          />
        ),
        p: ({ className: paragraphClassName, ...props }: ComponentPropsWithoutRef<"p">) => (
          <p
            className={cn("mb-3 text-sm leading-[1.7] last:mb-0", paragraphClassName)}
            {...props}
          />
        ),
        ul: ({ className: listClassName, ...props }: ComponentPropsWithoutRef<"ul">) => (
          <ul
            className={cn("mb-3 list-disc space-y-1.5 pl-5 text-sm last:mb-0", listClassName)}
            {...props}
          />
        ),
        ol: ({ className: listClassName, ...props }: ComponentPropsWithoutRef<"ol">) => (
          <ol
            className={cn("mb-3 list-decimal space-y-1.5 pl-5 text-sm last:mb-0", listClassName)}
            {...props}
          />
        ),
        li: ({ className: itemClassName, ...props }: ComponentPropsWithoutRef<"li">) => (
          <li className={cn("leading-[1.65]", itemClassName)} {...props} />
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
                  "font-medium text-foreground underline underline-offset-2 hover:text-foreground/80",
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
                "font-medium text-foreground underline underline-offset-2 hover:text-foreground/80",
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
                className={cn("font-mono text-[13px] text-foreground", codeClassName)}
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code
              className={cn(
                "rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[13px]",
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
              "my-3 overflow-x-auto rounded-md border border-border bg-muted/40 p-3.5 text-[13px] leading-relaxed",
              preClassName,
            )}
            {...props}
          />
        ),
        blockquote: ({ className: quoteClassName, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
          <blockquote
            className={cn(
              "my-3 border-l-2 border-border pl-4 text-muted-foreground",
              quoteClassName,
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
