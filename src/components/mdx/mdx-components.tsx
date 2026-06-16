import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type MDXHeadingProps = ComponentPropsWithoutRef<"h2">;
type MDXParagraphProps = ComponentPropsWithoutRef<"p">;
type MDXAnchorProps = ComponentPropsWithoutRef<"a">;
type MDXListProps = ComponentPropsWithoutRef<"ul">;
type MDXCodeProps = ComponentPropsWithoutRef<"code">;
type MDXPreProps = ComponentPropsWithoutRef<"pre">;
type MDXImageProps = ComponentPropsWithoutRef<"img">;

export const mdxComponents = {
  h2: ({ className, ...props }: MDXHeadingProps) => (
    <h2
      className={cn(
        "mt-12 scroll-mt-24 border-b border-border/40 pb-3 text-2xl font-semibold tracking-tight text-foreground first:mt-0 md:text-3xl",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: MDXHeadingProps) => (
    <h3
      className={cn("mt-8 text-lg font-semibold tracking-tight text-foreground md:text-xl", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: MDXParagraphProps) => (
    <p className={cn("mt-4 text-base leading-relaxed text-muted-foreground", className)} {...props} />
  ),
  ul: ({ className, ...props }: MDXListProps) => (
    <ul
      className={cn("mt-4 list-disc space-y-2 pl-6 text-muted-foreground", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={cn("mt-4 list-decimal space-y-2 pl-6 text-muted-foreground", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className={cn("leading-relaxed", className)} {...props} />
  ),
  a: ({ className, href, ...props }: MDXAnchorProps) => {
    const isExternal = href?.startsWith("http");

    if (isExternal) {
      return (
        <a
          href={href}
          className={cn("font-medium text-foreground underline-offset-4 hover:underline", className)}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      );
    }

    return (
      <Link
        href={href ?? "#"}
        className={cn("font-medium text-foreground underline-offset-4 hover:underline", className)}
        {...props}
      />
    );
  },
  blockquote: ({ className, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={cn(
        "mt-6 border-l-2 border-border pl-4 text-muted-foreground italic",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: MDXPreProps) => (
    <pre
      className={cn(
        "mt-6 overflow-x-auto rounded-xl border border-border/60 bg-muted/30 p-4 text-sm",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, children, ...props }: MDXCodeProps) => {
    const isBlock = className?.includes("language-");

    if (isBlock) {
      return (
        <code className={cn("font-mono text-sm text-foreground", className)} {...props}>
          {children}
        </code>
      );
    }

    return (
      <code
        className={cn(
          "rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-sm text-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  img: ({ className, alt = "", src }: MDXImageProps) => {
    if (!src || typeof src !== "string") return null;

    return (
      <span className="my-8 block overflow-hidden rounded-xl border border-border/60">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={630}
          className={cn("h-auto w-full object-cover", className)}
        />
      </span>
    );
  },
};
