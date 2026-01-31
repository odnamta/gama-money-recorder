'use client'

/**
 * useOCR Hook
 * 
 * React hook for OCR processing with automatic provider selection.
 * Uses Google Cloud Vision API when online, falls back to Tesseract.js offline.
 */

import { useState, useCallback, useRef } from 'react'
import type { 
  OCRResult, 
  OCRState, 
  OCROptions,
  OCRSuccessCallback,
  OCRErrorCallback,
  OCRProgressCallback,
} from '@/types/ocr'
import { processWithTesseract, isTesseractSupported } from '@/lib/ocr/tesseract-processor'

interface UseOCROptions {
  /** Callback when OCR succeeds */
  onSuccess?: OCRSuccessCallback
  /** Callback when OCR fails */
  onError?: OCRErrorCallback
  /** Callback for progress updates (mainly for Tesseract) */
  onProgress?: OCRProgressCallback
  /** Default timeout in milliseconds */
  timeout?: number
}

interface UseOCRReturn extends OCRState {
  /** Process an image file with OCR */
  processImage: (file: File, options?: OCROptions) => Promise<OCRResult | null>
  /** Reset the OCR state */
  reset: () => void
  /** Whether OCR is available (online or Tesseract supported) */
  isAvailable: boolean
  /** Current provider being used */
  currentProvider: 'google_vision' | 'tesseract' | null
}

const DEFAULT_TIMEOUT = 30000 // 30 seconds

/**
 * Hook for OCR processing with automatic provider selection
 */
export function useOCR(options: UseOCROptions = {}): UseOCRReturn {
  const { onSuccess, onError, onProgress, timeout = DEFAULT_TIMEOUT } = options
  
  const [state, setState] = useState<OCRState>({
    status: 'idle',
    progress: 0,
    result: null,
    error: null,
  })
  
  const [currentProvider, setCurrentProvider] = useState<'google_vision' | 'tesseract' | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  /**
   * Check if OCR is available
   */
  const isAvailable = typeof navigator !== 'undefined' && (
    navigator.onLine || isTesseractSupported()
  )
  
  /**
   * Process image with Google Cloud Vision API
   */
  const processWithVisionAPI = async (file: File, signal: AbortSignal): Promise<OCRResult> => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
      signal,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `OCR API failed with status ${response.status}`)
    }
    
    return response.json()
  }
  
  /**
   * Process an image file with OCR
   */
  const processImage = useCallback(async (
    file: File,
    processOptions: OCROptions = {}
  ): Promise<OCRResult | null> => {
    const { forceProvider, timeout: customTimeout, skip } = processOptions
    
    // Skip OCR if requested
    if (skip) {
      const emptyResult: OCRResult = {
        rawText: '',
        confidence: 0,
        extractedData: {},
        processingTime: 0,
        provider: 'manual',
      }
      setState(prev => ({ ...prev, status: 'success', result: emptyResult }))
      return emptyResult
    }
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal
    
    // Set up timeout
    const timeoutMs = customTimeout ?? timeout
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort()
    }, timeoutMs)
    
    // Reset state
    setState({
      status: 'processing',
      progress: 0,
      result: null,
      error: null,
    })
    
    try {
      let result: OCRResult
      
      // Determine which provider to use
      const isOnline = typeof navigator !== 'undefined' && navigator.onLine
      const useVisionAPI = forceProvider === 'google_vision' || 
        (forceProvider !== 'tesseract' && isOnline)
      
      if (useVisionAPI) {
        setCurrentProvider('google_vision')
        result = await processWithVisionAPI(file, signal)
      } else {
        // Use Tesseract.js for offline processing
        if (!isTesseractSupported()) {
          throw new Error('Tidak ada koneksi internet dan OCR offline tidak tersedia')
        }
        
        setCurrentProvider('tesseract')
        result = await processWithTesseract(file, (progress) => {
          setState(prev => ({ ...prev, progress }))
          onProgress?.(progress)
        })
      }
      
      // Update state with result
      setState({
        status: 'success',
        progress: 1,
        result,
        error: null,
      })
      
      onSuccess?.(result)
      return result
      
    } catch (error) {
      // Handle abort
      if (error instanceof Error && error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: new Error('Waktu pemrosesan habis'),
        }))
        return null
      }
      
      const err = error instanceof Error ? error : new Error('OCR gagal')
      
      setState({
        status: 'error',
        progress: 0,
        result: null,
        error: err,
      })
      
      onError?.(err)
      return null
      
    } finally {
      clearTimeout(timeoutId)
      setCurrentProvider(null)
    }
  }, [timeout, onSuccess, onError, onProgress])
  
  /**
   * Reset OCR state
   */
  const reset = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    setState({
      status: 'idle',
      progress: 0,
      result: null,
      error: null,
    })
    setCurrentProvider(null)
  }, [])
  
  return {
    ...state,
    processImage,
    reset,
    isAvailable,
    currentProvider,
  }
}
