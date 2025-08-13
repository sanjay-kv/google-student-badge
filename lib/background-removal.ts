// Removed Node.js-specific and non-browser-safe imports

export interface BackgroundRemovalOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

/**
 * Remove background from an image file or blob
 * @param imageSource - File, Blob, or string URL of the image
 * @param options - Optional configuration for progress tracking and error handling
 * @returns Promise<Blob> - The processed image with transparent background
 */
