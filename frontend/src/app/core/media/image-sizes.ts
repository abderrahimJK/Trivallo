import { ImageLoaderConfig } from '@angular/common';

/**
 * Uploaded images are stored in three widths next to each other (backend ImageSize):
 * <id>-sm.jpg (640 px), <id>-md.jpg (1280 px) and <id>-lg.jpg (1920 px). The API returns the -lg URL.
 */
export const IMAGE_WIDTHS = { sm: 640, md: 1280, lg: 1920 } as const;
export type ImageSizeName = keyof typeof IMAGE_WIDTHS;

const LARGE = /-lg\.(jpg|png)$/;

/** The URL of another size; URLs that were not resized (older uploads) are returned unchanged. */
export function sizedImageUrl(url: string, size: ImageSizeName): string {
  return LARGE.test(url) ? url.replace(LARGE, `-${size}.$1`) : url;
}

/** NgOptimizedImage loader: picks the smallest stored size at least as wide as requested. */
export function resizedImageLoader(config: ImageLoaderConfig): string {
  const width = config.width;
  if (!width) return config.src;
  const size: ImageSizeName =
    width <= IMAGE_WIDTHS.sm ? 'sm' : width <= IMAGE_WIDTHS.md ? 'md' : 'lg';
  return sizedImageUrl(config.src, size);
}
