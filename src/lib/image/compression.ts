/**
 * Image compression utility for receipt photos
 * Uses browser-native Canvas API for compression
 */

export interface CompressionOptions {
  /** Maximum width in pixels (default: 1920) */
  maxWidth?: number;
  /** Maximum height in pixels (default: 1920) */
  maxHeight?: number;
  /** JPEG quality 0-1 (default: 0.8) */
  quality?: number;
  /** Output format (default: 'image/jpeg') */
  outputFormat?: 'image/jpeg' | 'image/webp';
}

export interface CompressionResult {
  /** Compressed image as Blob */
  blob: Blob;
  /** Original file size in bytes */
  originalSize: number;
  /** Compressed file size in bytes */
  compressedSize: number;
  /** Compression ratio (original / compressed) */
  compressionRatio: number;
  /** Final width in pixels */
  width: number;
  /** Final height in pixels */
  height: number;
  /** Whether compression was applied */
  wasCompressed: boolean;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  outputFormat: 'image/jpeg',
};

/**
 * Load an image file into an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number; needsResize: boolean } {
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return {
      width: originalWidth,
      height: originalHeight,
      needsResize: false,
    };
  }

  const aspectRatio = originalWidth / originalHeight;
  let newWidth = originalWidth;
  let newHeight = originalHeight;

  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = Math.round(newWidth / aspectRatio);
  }

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = Math.round(newHeight * aspectRatio);
  }

  return {
    width: newWidth,
    height: newHeight,
    needsResize: true,
  };
}

/**
 * Compress an image file using Canvas API
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  const img = await loadImage(file);

  const { width, height, needsResize } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    opts.maxWidth,
    opts.maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to compress image'));
        }
      },
      opts.outputFormat,
      opts.quality
    );
  });

  const compressedSize = blob.size;
  const compressionRatio = originalSize / compressedSize;

  if (compressedSize >= originalSize && !needsResize) {
    return {
      blob: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      width: img.naturalWidth,
      height: img.naturalHeight,
      wasCompressed: false,
    };
  }

  return {
    blob,
    originalSize,
    compressedSize,
    compressionRatio,
    width,
    height,
    wasCompressed: true,
  };
}

/**
 * Compress image with automatic quality adjustment to meet target size
 */
export async function compressToTargetSize(
  file: File,
  targetSizeBytes: number = 1024 * 1024,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  let quality = options.quality ?? DEFAULT_OPTIONS.quality;
  const minQuality = 0.3;
  const qualityStep = 0.1;

  let result = await compressImage(file, { ...options, quality });

  while (result.compressedSize > targetSizeBytes && quality > minQuality) {
    quality -= qualityStep;
    result = await compressImage(file, { ...options, quality });
  }

  return result;
}
