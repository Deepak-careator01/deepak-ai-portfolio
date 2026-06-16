import type { Metadata } from "next";

import { siteConfig } from "@/lib/constants";

type CreateMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
};

export function createMetadata({
  title,
  description = siteConfig.description,
  path = "",
  noIndex = false,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
}: CreateMetadataOptions = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const url = `${siteConfig.url}${path}`;
  const keywords = tags?.length ? [...siteConfig.keywords, ...tags] : [...siteConfig.keywords];

  return {
    title: pageTitle,
    description,
    keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: path || "/",
    },
    openGraph: {
      type,
      locale: siteConfig.locale,
      url,
      title: pageTitle,
      description,
      siteName: siteConfig.name,
      ...(image ? { images: [{ url: image, alt: title ?? siteConfig.name }] } : {}),
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
      ...(type === "article" && tags?.length ? { tags } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: pageTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
