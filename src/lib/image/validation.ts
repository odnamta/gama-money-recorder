/**
 * File validation utilities for receipt photos
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: ValidationErrorCode;
}

export type ValidationErrorCode =
  | 'INVALID_TYPE'
  | 'FILE_TOO_LARGE'
  | 'FILE_TOO_SMALL'
  | 'INVALID_DIMENSIONS';

export interface ValidationOptions {
  allowedTypes?: string[];
  maxSizeBytes?: number;
  minSizeBytes?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const DEFAULT_OPTIONS: Required<ValidationOptions> = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeBytes: 5 * 1024 * 1024,
  minSizeBytes: 1024,
  minWidth: 100,
  minHeight: 100,
  maxWidth: 8000,
  maxHeight: 8000,
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function validateFileType(
  file: File,
  allowedTypes: string[] = DEFAULT_OPTIONS.allowedTypes
): ValidationResult {
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map((type) => type.split('/')[1].toUpperCase())
      .join(', ');
    return {
      isValid: false,
      error: `Tipe file tidak didukung. Gunakan ${allowedExtensions}.`,
      errorCode: 'INVALID_TYPE',
    };
  }
  return { isValid: true };
}

export function validateFileSize(
  file: File,
  minSizeBytes: number = DEFAULT_OPTIONS.minSizeBytes,
  maxSizeBytes: number = DEFAULT_OPTIONS.maxSizeBytes
): ValidationResult {
  if (file.size < minSizeBytes) {
    return {
      isValid: false,
      error: `File terlalu kecil. Minimum ${formatBytes(minSizeBytes)}.`,
      errorCode: 'FILE_TOO_SMALL',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File terlalu besar. Maksimum ${formatBytes(maxSizeBytes)}.`,
      errorCode: 'FILE_TOO_LARGE',
    };
  }

  return { isValid: true };
}

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export async function validateDimensions(
  file: File,
  options: Pick<ValidationOptions, 'minWidth' | 'minHeight' | 'maxWidth' | 'maxHeight'> = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const { width, height } = await getImageDimensions(file);

    if (width < opts.minWidth || height < opts.minHeight) {
      return {
        isValid: false,
        error: `Gambar terlalu kecil. Minimum ${opts.minWidth}x${opts.minHeight} piksel.`,
        errorCode: 'INVALID_DIMENSIONS',
      };
    }

    if (width > opts.maxWidth || height > opts.maxHeight) {
      return {
        isValid: false,
        error: `Gambar terlalu besar. Maksimum ${opts.maxWidth}x${opts.maxHeight} piksel.`,
        errorCode: 'INVALID_DIMENSIONS',
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Gagal membaca gambar. Pastikan file tidak rusak.',
      errorCode: 'INVALID_TYPE',
    };
  }
}

export async function validateReceiptImage(
  file: File,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const typeResult = validateFileType(file, opts.allowedTypes);
  if (!typeResult.isValid) {
    return typeResult;
  }

  const sizeResult = validateFileSize(file, opts.minSizeBytes, opts.maxSizeBytes);
  if (!sizeResult.isValid) {
    return sizeResult;
  }

  const dimensionsResult = await validateDimensions(file, opts);
  if (!dimensionsResult.isValid) {
    return dimensionsResult;
  }

  return { isValid: true };
}
