/**
 * OCR (Optical Character Recognition) Types
 * 
 * Types for receipt OCR processing using Google Cloud Vision API
 * with Tesseract.js fallback for offline scenarios.
 */

/**
 * OCR provider used for processing
 */
export type OCRProvider = 'google_vision' | 'tesseract' | 'manual'

/**
 * Confidence level classification
 * - high: >= 90% confidence, auto-accept
 * - medium: 80-89% confidence, highlight for review
 * - low: < 80% confidence, require manual entry
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low'

/**
 * Confidence thresholds for OCR results
 */
export const OCR_CONFIDENCE_THRESHOLDS = {
  /** Minimum confidence for auto-accept (90%) */
  HIGH: 0.9,
  /** Minimum confidence for medium level (80%) */
  MEDIUM: 0.8,
  /** Below this requires manual review */
  REVIEW_REQUIRED: 0.8,
} as const

/**
 * Data extracted from receipt by OCR
 */
export interface ExtractedReceiptData {
  /** Extracted amount in IDR */
  amount?: number
  /** Confidence score for amount extraction (0-1) */
  amountConfidence?: number
  /** Extracted vendor/merchant name */
  vendorName?: string
  /** Confidence score for vendor extraction (0-1) */
  vendorNameConfidence?: number
  /** Extracted transaction date (ISO format YYYY-MM-DD) */
  date?: string
  /** Confidence score for date extraction (0-1) */
  dateConfidence?: number
}

/**
 * Complete OCR processing result
 */
export interface OCRResult {
  /** Raw text extracted from image */
  rawText: string
  /** Overall confidence score (0-1) */
  confidence: number
  /** Structured data extracted from receipt */
  extractedData: ExtractedReceiptData
  /** Processing time in milliseconds */
  processingTime: number
  /** Provider used for OCR */
  provider: OCRProvider
}

/**
 * OCR processing status
 */
export type OCRStatus = 'idle' | 'processing' | 'success' | 'error'

/**
 * OCR processing state for hooks
 */
export interface OCRState {
  /** Current processing status */
  status: OCRStatus
  /** Processing progress (0-1), mainly for Tesseract */
  progress: number
  /** OCR result if successful */
  result: OCRResult | null
  /** Error if processing failed */
  error: Error | null
}

/**
 * OCR API request payload
 */
export interface OCRRequest {
  /** Image file to process */
  image: File
}

/**
 * OCR API response
 */
export interface OCRResponse {
  /** Raw text extracted from image */
  rawText: string
  /** Overall confidence score (0-1) */
  confidence: number
  /** Structured data extracted from receipt */
  extractedData: ExtractedReceiptData
  /** Processing time in milliseconds */
  processingTime: number
  /** Provider used for OCR */
  provider: OCRProvider
}

/**
 * OCR API error response
 */
export interface OCRErrorResponse {
  /** Error message */
  error: string
  /** Error code for client handling */
  code?: string
}

/**
 * Google Cloud Vision API text annotation
 */
export interface VisionTextAnnotation {
  /** Detected text */
  description: string
  /** Bounding polygon */
  boundingPoly?: {
    vertices: Array<{ x: number; y: number }>
  }
  /** Confidence score */
  confidence?: number
}

/**
 * Google Cloud Vision API response structure
 */
export interface VisionAPIResponse {
  /** Full text annotation */
  fullTextAnnotation?: {
    text: string
    pages?: Array<{
      confidence?: number
    }>
  }
  /** Individual text annotations */
  textAnnotations?: VisionTextAnnotation[]
  /** Error if any */
  error?: {
    code: number
    message: string
  }
}

/**
 * Options for OCR processing
 */
export interface OCROptions {
  /** Force specific provider (skip auto-detection) */
  forceProvider?: OCRProvider
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number
  /** Skip OCR and return empty result */
  skip?: boolean
}

/**
 * Callback for OCR progress updates
 */
export type OCRProgressCallback = (progress: number) => void

/**
 * Callback for OCR completion
 */
export type OCRSuccessCallback = (result: OCRResult) => void

/**
 * Callback for OCR errors
 */
export type OCRErrorCallback = (error: Error) => void

/**
 * Helper function to determine confidence level from score
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= OCR_CONFIDENCE_THRESHOLDS.HIGH) return 'high'
  if (confidence >= OCR_CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium'
  return 'low'
}

/**
 * Helper function to check if OCR result requires manual review
 */
export function requiresManualReview(result: OCRResult): boolean {
  return result.confidence < OCR_CONFIDENCE_THRESHOLDS.REVIEW_REQUIRED
}

/**
 * Helper function to format confidence as percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}
