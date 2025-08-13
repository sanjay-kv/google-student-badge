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
export async function removeImageBackground(
// Removed non-browser-safe background removal implementation

/**
 * Convert a File or Blob to a data URL for display
 * @param blob - The blob to convert
 * @returns Promise<string> - Data URL string
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Create a download link for a blob
 * @param blob - The blob to download
 * @param filename - The filename for the download
 */
export function downloadBlob(blob: Blob, filename: string = 'image-no-bg.png') {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  
  // Clean up the object URL
  URL.revokeObjectURL(url);
}

/**
 * Validate if a file is a supported image format
 * @param file - The file to validate
 * @returns boolean - True if the file is a supported image
 */
export function isValidImageFile(file: File): boolean {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return supportedTypes.includes(file.type);
}

/**
 * Get optimized image dimensions for processing
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxSize - Maximum dimension size (default: 1024)
 * @returns Object with optimized width and height
 */
export function getOptimizedDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxSize: number = 1024
): { width: number; height: number } {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;
  
  if (originalWidth > originalHeight) {
    return {
      width: maxSize,
      height: Math.round(maxSize / aspectRatio)
    };
  } else {
    return {
      width: Math.round(maxSize * aspectRatio),
      height: maxSize
    };
  }
}
