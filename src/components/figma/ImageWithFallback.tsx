import { useEffect, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";

type ImageWithFallbackProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src?: string;
  fallbackSrc?: string;
};

export function ImageWithFallback({
  src,
  fallbackSrc,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleError: ComponentPropsWithoutRef<"img">["onError"] = (event) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }

    onError?.(event);
  };

  return <img src={currentSrc} onError={handleError} {...props} />;
}
