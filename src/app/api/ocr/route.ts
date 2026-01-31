import { NextRequest, NextResponse } from 'next/server'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import type { OCRResponse, OCRErrorResponse, VisionAPIResponse } from '@/types/ocr'
import { 
  getOCRRateLimiter, 
  getRequestIdentifier, 
  createRateLimitHeaders,
  type RateLimitResult 
} from '@/lib/rate-limit'
import {
  createLogger,
  generateRequestId,
  classifyOCRError,
} from '@/lib/logger'
import { parseReceiptText } from '@/lib/ocr/parser'

// Initialize Vision client with credentials from environment variable
let visionClient: ImageAnnotatorClient | null = null

// Create logger for OCR operations
const ocrLogger = createLogger({ operation: 'ocr' })

/**
 * Get or create the Vision API client
 * Throws descriptive errors for configuration issues
 */
function getVisionClient(): ImageAnnotatorClient {
  if (!visionClient) {
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS
    
    if (!credentials) {
      throw new Error('GOOGLE_CLOUD_CREDENTIALS environment variable is not set')
    }
    
    try {
      visionClient = new ImageAnnotatorClient({
        credentials: JSON.parse(credentials)
      })
    } catch {
      throw new Error('Failed to parse GOOGLE_CLOUD_CREDENTIALS: Invalid JSON')
    }
  }
  
  return visionClient
}

/**
 * Calculate overall confidence from Vision API response
 */
function calculateOverallConfidence(result: VisionAPIResponse): number {
  // Try to get confidence from fullTextAnnotation pages
  if (result.fullTextAnnotation?.pages && result.fullTextAnnotation.pages.length > 0) {
    const pageConfidences = result.fullTextAnnotation.pages
      .map(page => page.confidence)
      .filter((c): c is number => c !== undefined)
    
    if (pageConfidences.length > 0) {
      return pageConfidences.reduce((sum, c) => sum + c, 0) / pageConfidences.length
    }
  }
  
  // Fallback: if we got text, assume reasonable confidence
  if (result.fullTextAnnotation?.text && result.fullTextAnnotation.text.length > 0) {
    return 0.85 // Default confidence when text is detected
  }
  
  return 0 // No text detected
}

/**
 * POST /api/ocr
 * 
 * Process receipt image with Google Cloud Vision API
 * 
 * Request: FormData with 'image' field containing the image file
 * Response: OCRResponse with rawText, confidence, extractedData, processingTime, provider
 * 
 * Rate Limit: 10 requests per minute per user/IP
 * Returns 429 Too Many Requests when limit exceeded
 */
export async function POST(request: NextRequest): Promise<NextResponse<OCRResponse | OCRErrorResponse>> {
  const startTime = Date.now()
  const requestId = generateRequestId()
  
  // Create request-scoped logger
  const log = ocrLogger.child({ requestId })
  
  log.info('OCR request started', {
    userAgent: request.headers.get('user-agent') ?? undefined,
  })
  
  // Apply rate limiting
  const rateLimiter = getOCRRateLimiter()
  const identifier = getRequestIdentifier(request)
  const rateLimitResult: RateLimitResult = rateLimiter.check(identifier)
  
  if (!rateLimitResult.allowed) {
    log.warn('Rate limit exceeded', {
      identifier,
      remaining: rateLimitResult.remaining,
      resetAt: new Date(rateLimitResult.resetAt).toISOString(),
    })
    
    return NextResponse.json(
      { 
        error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.', 
        code: 'RATE_LIMIT_EXCEEDED' 
      },
      { 
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult)
      }
    )
  }
  
  try {
    // Parse FormData
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      log.error('Failed to parse form data', error instanceof Error ? error : new Error(String(error)))
      return NextResponse.json(
        { error: 'Invalid request format', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }
    
    const image = formData.get('image')
    
    // Validate image presence
    if (!image) {
      log.warn('No image provided in request')
      return NextResponse.json(
        { error: 'No image provided', code: 'MISSING_IMAGE' },
        { status: 400 }
      )
    }
    
    if (!(image instanceof File)) {
      log.warn('Invalid image format - not a File object')
      return NextResponse.json(
        { error: 'Invalid image format', code: 'INVALID_FORMAT' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(image.type)) {
      log.warn('Invalid image type', { 
        providedType: image.type,
        validTypes,
      })
      return NextResponse.json(
        { error: 'Invalid image type. Supported: JPEG, PNG, WebP', code: 'INVALID_TYPE' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 10MB for Vision API)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (image.size > maxSize) {
      log.warn('Image too large', {
        size: image.size,
        maxSize,
      })
      return NextResponse.json(
        { error: 'Image too large. Maximum size: 10MB', code: 'FILE_TOO_LARGE' },
        { status: 400 }
      )
    }
    
    log.debug('Image validation passed', {
      fileName: image.name,
      fileSize: image.size,
      fileType: image.type,
    })
    
    // Convert image to base64
    let base64: string
    try {
      const buffer = await image.arrayBuffer()
      base64 = Buffer.from(buffer).toString('base64')
    } catch (error) {
      log.error('Failed to process image buffer', error instanceof Error ? error : new Error(String(error)))
      return NextResponse.json(
        { error: 'Gambar tidak dapat diproses. Silakan coba dengan gambar lain.', code: 'IMAGE_PROCESSING_ERROR' },
        { status: 400 }
      )
    }
    
    // Get Vision client
    let client: ImageAnnotatorClient
    try {
      client = getVisionClient()
    } catch (error) {
      log.error('Failed to initialize Vision client', error instanceof Error ? error : new Error(String(error)))
      return NextResponse.json(
        { error: 'Layanan OCR tidak dikonfigurasi dengan benar.', code: 'SERVICE_NOT_CONFIGURED' },
        { status: 503 }
      )
    }
    
    // Call Vision API textDetection with timeout handling
    log.info('Calling Vision API')
    const visionStartTime = Date.now()
    
    let result: VisionAPIResponse
    try {
      const [apiResult] = await client.textDetection({
        image: { content: base64 }
      })
      result = apiResult as VisionAPIResponse
    } catch (error) {
      const visionDuration = Date.now() - visionStartTime
      const classified = classifyOCRError(error)
      
      log.error('Vision API call failed', error instanceof Error ? error : new Error(String(error)), {
        errorType: classified.type,
        visionDurationMs: visionDuration,
        isRetryable: classified.isRetryable,
      })
      
      // Return appropriate error response based on error type
      return NextResponse.json(
        { error: classified.message, code: classified.type },
        { status: classified.statusCode }
      )
    }
    
    const visionDuration = Date.now() - visionStartTime
    log.debug('Vision API call completed', { visionDurationMs: visionDuration })
    
    // Check for API errors in response
    if (result.error) {
      log.error('Vision API returned error', new Error(result.error.message || 'Unknown Vision API error'), {
        errorCode: result.error.code,
      })
      return NextResponse.json(
        { error: 'Layanan OCR mengalami masalah. Silakan coba lagi.', code: 'VISION_API_ERROR' },
        { status: 502 }
      )
    }
    
    // Extract raw text
    const rawText = result.fullTextAnnotation?.text || ''
    const textLength = rawText.length
    
    // Calculate confidence
    const confidence = calculateOverallConfidence(result)
    
    // Parse receipt text to extract structured data
    const extractedData = parseReceiptText(rawText)
    
    const processingTime = Date.now() - startTime
    
    log.info('OCR processing completed successfully', {
      durationMs: processingTime,
      visionDurationMs: visionDuration,
      textLength,
      confidence,
      hasText: textLength > 0,
    })
    
    const response: OCRResponse = {
      rawText,
      confidence,
      extractedData,
      processingTime,
      provider: 'google_vision'
    }
    
    return NextResponse.json(response, {
      headers: createRateLimitHeaders(rateLimitResult)
    })
    
  } catch (error) {
    // Catch-all for unexpected errors
    const processingTime = Date.now() - startTime
    const classified = classifyOCRError(error)
    
    log.error('Unexpected error during OCR processing', error instanceof Error ? error : new Error(String(error)), {
      errorType: classified.type,
      durationMs: processingTime,
      isRetryable: classified.isRetryable,
    })
    
    return NextResponse.json(
      { error: classified.message, code: classified.type },
      { status: classified.statusCode }
    )
  }
}
