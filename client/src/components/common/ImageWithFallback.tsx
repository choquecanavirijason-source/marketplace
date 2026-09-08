"use client";

import React, { useState } from "react";
import { FALLBACK_PRODUCT_IMAGE_DATA_URI } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

export interface ImageWithFallbackProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "Producto",
  className,
  fallbackSrc = FALLBACK_PRODUCT_IMAGE_DATA_URI,
  onError,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
    }
    if (onError) {
      onError(e);
    }
  };

  const effectiveSrc = !src || typeof src !== "string" || !src.trim() || hasError ? fallbackSrc : src;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={cn("object-cover", className)}
      onError={handleError}
      {...rest}
    />
  );
};

export default ImageWithFallback;
