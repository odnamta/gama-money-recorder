# v0.3 Receipt Photo - Technical Design

## Overview
Implement receipt photo capture using device camera/gallery with client-side compression and Supabase Storage upload.

## Component Architecture

### New Components
```
components/
├── receipt/
│   ├── ReceiptCapture.tsx      # Main capture component
│   ├── CameraCapture.tsx       # Camera interface
│   ├── PhotoPreview.tsx        # Preview with actions
│   └── UploadProgress.tsx      # Upload indicator
```

### ReceiptCapture Component
```typescript
interface ReceiptCaptureProps {
  onCapture: (receipt: CapturedReceipt) => void
  onRemove: () => void
  currentReceipt?: CapturedReceipt
  required?: boolean
  amountThreshold?: number // Default 500000
}

interface CapturedReceipt {
  localUri: string        // Local blob URL
  file: File              // Compressed file
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed'
  storagePath?: string    // After upload
  receiptId?: string      // After DB insert
}
```

## Camera Integration

### Using Native Input
```typescript
// components/receipt/CameraCapture.tsx
'use client'

import { useRef } from 'react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onCapture(file)
    }
  }
  
  return (
    <div className="flex gap-2">
      {/* Camera capture */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
        id="camera-input"
      />
      <label
        htmlFor="camera-input"
        className="flex-1 btn btn-outline"
      >
        <Camera className="mr-2" />
        Kamera
      </label>
      
      {/* Gallery picker */}
      <input
        type="file"
        accept="image/*"
        onChange={handleCapture}
        className="hidden"
        id="gallery-input"
      />
      <label
        htmlFor="gallery-input"
        className="flex-1 btn btn-outline"
      >
        <Image className="mr-2" />
        Galeri
      </label>
    </div>
  )
}
```

## Image Compression

### Compression Utility
```typescript
// lib/utils/image-compression.ts
interface CompressionOptions {
  maxWidth: number
  maxHeight: number
  quality: number
  maxSizeKB: number
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  maxSizeKB: 1024 // 1MB
}

export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Create image element
  const img = await createImageFromFile(file)
  
  // Calculate new dimensions
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    opts.maxWidth,
    opts.maxHeight
  )
  
  // Draw to canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)
  
  // Convert to blob with quality adjustment
  let quality = opts.quality
  let blob: Blob
  
  do {
    blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b!),
        'image/jpeg',
        quality
      )
    })
    quality -= 0.1
  } while (blob.size > opts.maxSizeKB * 1024 && quality > 0.3)
  
  return new File([blob], `receipt-${Date.now()}.jpg`, {
    type: 'image/jpeg'
  })
}

function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }
  
  const ratio = Math.min(maxWidth / width, maxHeight / height)
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  }
}
```

## Upload Flow

### Storage Upload
```typescript
// lib/storage/upload-receipt.ts
import { createClient } from '@/lib/supabase/client'

interface UploadResult {
  storagePath: string
  publicUrl: string
}

export async function uploadReceipt(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const supabase = createClient()
  
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const filename = `receipt-${Date.now()}.jpg`
  const storagePath = `${userId}/${year}/${month}/${filename}`
  
  const { data, error } = await supabase.storage
    .from('expense-receipts')
    .upload(storagePath, file, {
      contentType: 'image/jpeg',
      upsert: false
    })
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('expense-receipts')
    .getPublicUrl(storagePath)
  
  return { storagePath, publicUrl }
}
```

### Receipt Record Creation
```typescript
// lib/storage/create-receipt-record.ts
export async function createReceiptRecord(
  userId: string,
  storagePath: string,
  file: File,
  imageInfo: { width: number; height: number }
): Promise<string> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('expense_receipts')
    .insert({
      user_id: userId,
      storage_path: storagePath,
      original_filename: file.name,
      file_size: file.size,
      mime_type: file.type,
      image_width: imageInfo.width,
      image_height: imageInfo.height,
      sync_status: 'synced'
    })
    .select('id')
    .single()
  
  if (error) throw error
  return data.id
}
```

## UI Flow

### Capture Flow
```
[No Receipt State]
┌─────────────────────────┐
│  📷 Foto Struk          │
│  ┌─────────┬─────────┐  │
│  │ Kamera  │ Galeri  │  │
│  └─────────┴─────────┘  │
└─────────────────────────┘
         ↓ (capture)
[Preview State]
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │                   │  │
│  │   [Receipt Image] │  │
│  │                   │  │
│  └───────────────────┘  │
│  ┌─────────┬─────────┐  │
│  │ Ulangi  │ Gunakan │  │
│  └─────────┴─────────┘  │
└─────────────────────────┘
         ↓ (accept)
[Uploading State]
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │   [Receipt Image] │  │
│  │   ████████░░ 80%  │  │
│  └───────────────────┘  │
│  Mengunggah...          │
└─────────────────────────┘
         ↓ (complete)
[Uploaded State]
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │   [Receipt Image] │  │
│  │        ✓          │  │
│  └───────────────────┘  │
│  [Hapus]                │
└─────────────────────────┘
```

### High-Value Warning
```typescript
// components/receipt/ReceiptWarning.tsx
interface ReceiptWarningProps {
  amount: number
  threshold: number
  onProceed: () => void
  onAddReceipt: () => void
}

export function ReceiptWarning({
  amount,
  threshold,
  onProceed,
  onAddReceipt
}: ReceiptWarningProps) {
  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Struk Disarankan</AlertTitle>
      <AlertDescription>
        Pengeluaran di atas {formatCurrency(threshold)} sebaiknya 
        dilampirkan struk untuk keperluan audit.
      </AlertDescription>
      <div className="flex gap-2 mt-3">
        <Button variant="outline" onClick={onProceed}>
          Lanjut Tanpa Struk
        </Button>
        <Button onClick={onAddReceipt}>
          Tambah Struk
        </Button>
      </div>
    </Alert>
  )
}
```

## Database Updates

### Link Receipt to Expense
```typescript
// When saving expense with receipt
const { data: expense } = await supabase
  .from('expense_drafts')
  .insert({
    // ... expense data
    receipt_id: receiptId, // From createReceiptRecord
  })
```

## Testing Strategy

### Unit Tests
- Image compression logic
- Dimension calculations
- File type validation

### Integration Tests
- Camera/gallery input handling
- Upload to Supabase Storage
- Receipt record creation

### E2E Tests
- Complete capture flow
- High-value warning display
- Upload progress indication
