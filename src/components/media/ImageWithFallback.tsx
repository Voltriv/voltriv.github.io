import { useState } from "react";
import type { ComponentPropsWithoutRef } from "react";

type ImageWithFallbackProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "alt" | "src"
> & {
  alt: string;
  src?: string;
  fallbackSrc?: string;
};

export function ImageWithFallback({
  alt,
  src,
  fallbackSrc,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const currentSrc = src && failedSrc === src ? fallbackSrc : src;

  const handleError: ComponentPropsWithoutRef<"img">["onError"] = (event) => {
    if (src && fallbackSrc && currentSrc === src) {
      setFailedSrc(src);
    }

    onError?.(event);
  };

  return (
    <img alt={alt} src={currentSrc} onError={handleError} {...props} />
  );
}
