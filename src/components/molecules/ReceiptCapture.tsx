'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { compressToTargetSize, type CompressionResult } from '@/lib/image/compression';
import { validateReceiptImage } from '@/lib/image/validation';
import { uploadReceipt } from '@/lib/receipts/upload';

interface ReceiptCaptureProps {
  onReceiptCaptured?: (receiptId: string, storagePath: string) => void;
  onReceiptRemoved?: () => void;
  className?: string;
  disabled?: boolean;
}

type CaptureState = 'idle' | 'preview' | 'uploading' | 'uploaded';

export function ReceiptCapture({
  onReceiptCaptured,
  onReceiptRemoved,
  className,
  disabled = false,
}: ReceiptCaptureProps) {
  const [state, setState] = useState<CaptureState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Validate file
    const validation = await validateReceiptImage(file);
    if (!validation.isValid) {
      setError(validation.error || 'File tidak valid');
      return;
    }

    // Compress image
    try {
      const result = await compressToTargetSize(file, 1024 * 1024); // 1MB target
      setCompressionResult(result);
      setSelectedFile(new File([result.blob], file.name, { type: result.blob.type }));
      
      // Create preview URL
      const url = URL.createObjectURL(result.blob);
      setPreviewUrl(url);
      setState('preview');
    } catch (err) {
      console.error('Compression error:', err);
      setError('Gagal memproses gambar');
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !compressionResult) return;

    setState('uploading');
    setUploadProgress(0);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('originalFileName', selectedFile.name);
      formData.append('width', String(compressionResult.width));
      formData.append('height', String(compressionResult.height));
      formData.append('originalFileSize', String(compressionResult.originalSize));
      formData.append('compressionRatio', String(compressionResult.compressionRatio));
      formData.append('isCompressed', String(compressionResult.wasCompressed));

      const result = await uploadReceipt(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.receiptId) {
        setState('uploaded');
        onReceiptCaptured?.(result.receiptId, result.storagePath || '');
      } else {
        setError(result.error || 'Gagal mengunggah');
        setState('preview');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Gagal mengunggah gambar');
      setState('preview');
    }
  }, [selectedFile, compressionResult, onReceiptCaptured]);

  const handleRetake = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setCompressionResult(null);
    setError(null);
    setUploadProgress(0);
    setState('idle');
    onReceiptRemoved?.();
  }, [previewUrl, onReceiptRemoved]);

  const openCamera = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const openGallery = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-gray-700">
        Foto Struk
      </label>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Idle state - capture buttons */}
      {state === 'idle' && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={openCamera}
            disabled={disabled}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-2 p-4',
              'border-2 border-dashed border-gray-300 rounded-lg',
              'hover:border-blue-400 hover:bg-blue-50 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Camera className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">Kamera</span>
          </button>
          <button
            type="button"
            onClick={openGallery}
            disabled={disabled}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-2 p-4',
              'border-2 border-dashed border-gray-300 rounded-lg',
              'hover:border-blue-400 hover:bg-blue-50 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">Galeri</span>
          </button>
        </div>
      )}

      {/* Preview state */}
      {(state === 'preview' || state === 'uploading' || state === 'uploaded') && previewUrl && (
        <div className="relative">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview struk"
              className="w-full h-full object-contain"
            />
            
            {/* Upload progress overlay */}
            {state === 'uploading' && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-white text-sm mt-2">Mengunggah...</span>
              </div>
            )}

            {/* Uploaded checkmark */}
            {state === 'uploaded' && (
              <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Compression info */}
          {compressionResult && state !== 'uploading' && (
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
              <span>
                {compressionResult.width} × {compressionResult.height} px
              </span>
              <span>
                {formatSize(compressionResult.compressedSize)}
                {compressionResult.wasCompressed && (
                  <span className="text-green-600 ml-1">
                    (-{Math.round((1 - 1/compressionResult.compressionRatio) * 100)}%)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Action buttons */}
          {state === 'preview' && (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleRetake}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 px-4',
                  'border border-gray-300 rounded-lg text-gray-700',
                  'hover:bg-gray-50 transition-colors'
                )}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi</span>
              </button>
              <button
                type="button"
                onClick={handleUpload}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 px-4',
                  'bg-blue-600 text-white rounded-lg',
                  'hover:bg-blue-700 transition-colors'
                )}
              >
                <Check className="w-4 h-4" />
                <span>Gunakan</span>
              </button>
            </div>
          )}

          {/* Remove button for uploaded state */}
          {state === 'uploaded' && (
            <button
              type="button"
              onClick={handleRetake}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2 px-4 mt-3',
                'border border-gray-300 rounded-lg text-gray-700',
                'hover:bg-gray-50 transition-colors'
              )}
            >
              <X className="w-4 h-4" />
              <span>Hapus & Ganti</span>
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Optional hint */}
      {state === 'idle' && (
        <p className="text-xs text-gray-500">
          Foto struk akan dikompresi otomatis. Maks 5MB.
        </p>
      )}
    </div>
  );
}
