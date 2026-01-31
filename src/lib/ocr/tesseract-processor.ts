/**
 * Tesseract.js OCR Processor
 * 
 * Client-side OCR fallback using Tesseract.js for offline scenarios.
 * Supports Indonesian language recognition.
 */

import type { OCRResult, OCRProgressCallback } from '@/types/ocr'
import { parseReceiptText, calculateOverallConfidence } from './parser'

// Lazy load Tesseract to reduce initial bundle size
let tesseractModule: typeof import('tesseract.js') | null = null

/**
 * Check if Tesseract.js is supported in the current environment
 */
export function isTesseractSupported(): boolean {
  return typeof window !== 'undefined' && typeof Worker !== 'undefined'
}

/**
 * Load Tesseract.js module lazily
 */
async function loadTesseract(): Promise<typeof import('tesseract.js')> {
  if (!tesseractModule) {
    tesseractModule = await import('tesseract.js')
  }
  return tesseractModule
}

/**
 * Process an image with Tesseract.js OCR
 * 
 * @param imageFile - Image file to process
 * @param onProgress - Optional callback for progress updates (0-1)
 * @returns OCR result with extracted data
 */
export async function processWithTesseract(
  imageFile: File | Blob,
  onProgress?: OCRProgressCallback
): Promise<OCRResult> {
  if (!isTesseractSupported()) {
    throw new Error('Tesseract.js is not supported in this environment')
  }
  
  const startTime = Date.now()
  
  try {
    const Tesseract = await loadTesseract()
    
    // Create worker with Indonesian language
    const worker = await Tesseract.createWorker('ind', 1, {
      logger: (m) => {
        // Report progress during recognition phase
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress)
        }
      },
    })
    
    try {
      // Recognize text from image
      const result = await worker.recognize(imageFile)
      
      // Parse the extracted text
      const rawText = result.data.text || ''
      const extractedData = parseReceiptText(rawText)
      
      // Calculate confidence
      // Tesseract provides confidence per character, we use the average
      const tesseractConfidence = result.data.confidence / 100
      const extractionConfidence = calculateOverallConfidence(extractedData)
      
      // Combined confidence: average of Tesseract confidence and extraction confidence
      const confidence = extractedData.amount 
        ? (tesseractConfidence * 0.4 + extractionConfidence * 0.6)
        : tesseractConfidence * 0.5 // Lower confidence if no amount found
      
      return {
        rawText,
        confidence: Math.min(confidence, 0.85), // Cap Tesseract confidence at 85%
        extractedData,
        processingTime: Date.now() - startTime,
        provider: 'tesseract',
      }
    } finally {
      // Always terminate the worker to free resources
      await worker.terminate()
    }
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Tesseract OCR failed: ${error.message}`)
    }
    throw new Error(`Tesseract OCR failed after ${processingTime}ms`)
  }
}
