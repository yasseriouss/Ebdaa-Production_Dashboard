import { useState } from "react";

const LOGO_SOURCES = [
  "/company-logo.png",
  "/apple-touch-icon.png",
  "/favicon.svg",
] as const;

type BrandLogoProps = {
  className?: string;
  /** Shorter label for tight UI chrome */
  alt?: string;
};

export function BrandLogo({
  className = "h-10 w-auto max-w-[220px] object-contain object-left",
  alt = "Yasserious — Factory Data Hub",
}: BrandLogoProps) {
  const [srcIndex, setSrcIndex] = useState(0);
  const src = LOGO_SOURCES[srcIndex] ?? LOGO_SOURCES[LOGO_SOURCES.length - 1];

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      decoding="async"
      loading="eager"
      fetchPriority="high"
      onError={() =>
        setSrcIndex((i) => Math.min(i + 1, LOGO_SOURCES.length - 1))
      }
    />
  );
}
