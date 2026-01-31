# v0.3.1 OCR Integration - Technical Design

## Overview
Implement OCR processing for receipt images using Google Cloud Vision API with fallback to Tesseract.js for offline scenarios.

## OCR Provider Strategy

### Primary: Google Cloud Vision API
- High accuracy for Indonesian receipts
- Fast processing (2-5 seconds)
- Requires internet connection
- Cost: ~$1.50 per 1000 images

### Fallback: Tesseract.js
- Client-side processing
- Works offline
- Lower accuracy
- Slower (5-15 seconds)

## Architecture

### Processing Flow
```
[Receipt Captured] → [Compress Image]
    ↓
[Online?]
    ├─ Yes → [Google Cloud Vision API]
    └─ No  → [Tesseract.js (client)]
    ↓
[Parse OCR Response] → [Extract Fields]
    ↓
[Calculate Confidence] → [Store Results]
    ↓
[Auto-fill Form] → [Show Confidence]
```

## API Implementation

### OCR API Route
```typescript
// app/api/ocr/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ImageAnnotatorClient } from '@google-cloud/vision'

const visionClient = new ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS!)
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }
    
    // Convert to base64
    const buffer = await image.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    
    // Call Vision API
    const [result] = await visionClient.textDetection({
      image: { content: base64 }
    })
    
    const rawText = result.fullTextAnnotation?.text || ''
    const confidence = calculateOverallConfidence(result)
    
    // Parse receipt data
    const extractedData = parseReceiptText(rawText)
    
    return NextResponse.json({
      rawText,
      confidence,
      extractedData,
      processingTime: Date.now() - startTime,
      provider: 'google_vision'
    })
    
  } catch (error) {
    console.error('OCR processing failed:', error)
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 }
    )
  }
}
```

### Receipt Parser
```typescript
// lib/ocr/parser.ts
interface ExtractedData {
  amount?: number
  amountConfidence?: number
  vendorName?: string
  vendorNameConfidence?: number
  date?: string
  dateConfidence?: number
}

export function parseReceiptText(text: string): ExtractedData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  return {
    ...extractAmount(lines),
    ...extractVendorName(lines),
    ...extractDate(lines)
  }
}

function extractAmount(lines: string[]): Pick<ExtractedData, 'amount' | 'amountConfidence'> {
  // Common patterns for Indonesian receipts
  const patterns = [
    /(?:TOTAL|GRAND TOTAL|JUMLAH|BAYAR)[:\s]*(?:Rp\.?\s*)?([0-9.,]+)/i,
    /(?:Rp\.?\s*)([0-9.,]+)(?:\s*(?:TOTAL|TUNAI|CASH))/i,
    /([0-9]{1,3}(?:[.,][0-9]{3})+)(?:\s*$)/m // Large number at end of line
  ]
  
  for (const pattern of patterns) {
    for (const line of lines.reverse()) { // Start from bottom
      const match = line.match(pattern)
      if (match) {
        const amount = parseIndonesianNumber(match[1])
        if (amount > 0 && amount < 100_000_000) { // Sanity check
          return {
            amount,
            amountConfidence: 0.85 // Base confidence for pattern match
          }
        }
      }
    }
  }
  
  return {}
}

function extractVendorName(lines: string[]): Pick<ExtractedData, 'vendorName' | 'vendorNameConfidence'> {
  // Vendor usually in first few lines
  const headerLines = lines.slice(0, 5)
  
  // Skip common non-vendor text
  const skipPatterns = [
    /^(STRUK|RECEIPT|NOTA|INVOICE|FAKTUR)/i,
    /^(TANGGAL|DATE|JAM|TIME)/i,
    /^[0-9]/
  ]
  
  for (const line of headerLines) {
    if (line.length > 3 && line.length < 50) {
      const isSkip = skipPatterns.some(p => p.test(line))
      if (!isSkip) {
        return {
          vendorName: line,
          vendorNameConfidence: 0.7
        }
      }
    }
  }
  
  return {}
}

function extractDate(lines: string[]): Pick<ExtractedData, 'date' | 'dateConfidence'> {
  // Common Indonesian date formats
  const patterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,  // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s+(\d{2,4})/i
  ]
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        const date = parseIndonesianDate(match[0])
        if (date && date <= new Date()) {
          return {
            date: date.toISOString().split('T')[0],
            dateConfidence: 0.8
          }
        }
      }
    }
  }
  
  return {}
}

function parseIndonesianNumber(str: string): number {
  // Indonesian uses . for thousands, , for decimals
  return parseInt(str.replace(/[.,]/g, ''), 10)
}
```

## Client-Side Fallback (Tesseract.js)

```typescript
// lib/ocr/tesseract-processor.ts
import Tesseract from 'tesseract.js'

export async function processWithTesseract(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  const startTime = Date.now()
  
  const result = await Tesseract.recognize(
    imageFile,
    'ind', // Indonesian language
    {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress)
        }
      }
    }
  )
  
  const extractedData = parseReceiptText(result.data.text)
  
  return {
    rawText: result.data.text,
    confidence: result.data.confidence / 100,
    extractedData,
    processingTime: Date.now() - startTime,
    provider: 'tesseract'
  }
}
```

## OCR Hook

```typescript
// hooks/use-ocr.ts
import { useState, useCallback } from 'react'

interface UseOCROptions {
  onSuccess?: (result: OCRResult) => void
  onError?: (error: Error) => void
}

export function useOCR(options: UseOCROptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      let ocrResult: OCRResult
      
      if (navigator.onLine) {
        // Use Cloud Vision API
        const formData = new FormData()
        formData.append('image', file)
        
        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) throw new Error('OCR API failed')
        ocrResult = await response.json()
      } else {
        // Fallback to Tesseract
        ocrResult = await processWithTesseract(file, setProgress)
      }
      
      setResult(ocrResult)
      options.onSuccess?.(ocrResult)
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('OCR failed')
      setError(error)
      options.onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }, [options])
  
  return {
    processImage,
    isProcessing,
    progress,
    result,
    error,
    reset: () => {
      setResult(null)
      setError(null)
    }
  }
}
```

## UI Components

### OCR Status Display
```typescript
// components/ocr/OCRStatus.tsx
interface OCRStatusProps {
  isProcessing: boolean
  progress: number
  result: OCRResult | null
  error: Error | null
}

export function OCRStatus({ isProcessing, progress, result, error }: OCRStatusProps) {
  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Membaca struk... {Math.round(progress * 100)}%</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>Gagal membaca struk. Silakan isi manual.</span>
      </div>
    )
  }
  
  if (result) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span>Struk terbaca ({result.processingTime}ms)</span>
        <ConfidenceBadge confidence={result.confidence} />
      </div>
    )
  }
  
  return null
}
```

### Confidence Field Wrapper
```typescript
// components/ocr/ConfidenceField.tsx
interface ConfidenceFieldProps {
  confidence?: number
  children: React.ReactNode
}

export function ConfidenceField({ confidence, children }: ConfidenceFieldProps) {
  const isLowConfidence = confidence !== undefined && confidence < 0.8
  
  return (
    <div className={cn(
      'relative',
      isLowConfidence && 'ring-2 ring-yellow-400 rounded-md'
    )}>
      {children}
      {isLowConfidence && (
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-1 rounded">
          Perlu cek
        </span>
      )}
    </div>
  )
}
```

## Database Updates

### Store OCR Results
```typescript
// Update expense_receipts after OCR
await supabase
  .from('expense_receipts')
  .update({
    ocr_raw_text: result.rawText,
    ocr_confidence: result.confidence,
    ocr_processing_time: result.processingTime,
    ocr_provider: result.provider,
    extracted_amount: result.extractedData.amount,
    extracted_amount_confidence: result.extractedData.amountConfidence,
    extracted_vendor_name: result.extractedData.vendorName,
    extracted_vendor_confidence: result.extractedData.vendorNameConfidence,
    extracted_date: result.extractedData.date,
    extracted_date_confidence: result.extractedData.dateConfidence
  })
  .eq('id', receiptId)
```

## Testing Strategy

### Unit Tests
- Receipt text parsing
- Amount extraction patterns
- Date parsing for Indonesian formats
- Vendor name extraction

### Integration Tests
- OCR API endpoint
- Tesseract fallback
- Form auto-fill from OCR

### E2E Tests
- Complete OCR flow
- Low confidence handling
- Error recovery
