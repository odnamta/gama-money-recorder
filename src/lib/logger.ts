/**
 * Structured Logger Utility
 * 
 * Provides consistent, structured logging with timestamps and context.
 * Uses console methods for output (no external logging service).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  /** Unique request/operation identifier */
  requestId?: string
  /** User identifier (anonymized if needed) */
  userId?: string
  /** Operation being performed */
  operation?: string
  /** Duration in milliseconds */
  durationMs?: number
  /** Additional metadata */
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
}

/**
 * Format a log entry as a structured JSON string
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry)
}

/**
 * Create a log entry with common fields
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error & { code?: string }
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: error.code,
    }
  }

  return entry
}

/**
 * Logger class for structured logging
 */
class Logger {
  private context: LogContext

  constructor(context: LogContext = {}) {
    this.context = context
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext })
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'development') return
    
    const entry = createLogEntry('debug', message, { ...this.context, ...context })
    console.debug(formatLogEntry(entry))
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    const entry = createLogEntry('info', message, { ...this.context, ...context })
    console.info(formatLogEntry(entry))
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    const entry = createLogEntry('warn', message, { ...this.context, ...context })
    console.warn(formatLogEntry(entry))
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error & { code?: string }, context?: LogContext): void {
    const entry = createLogEntry('error', message, { ...this.context, ...context }, error)
    console.error(formatLogEntry(entry))
  }
}

/**
 * Create a new logger instance
 */
export function createLogger(context?: LogContext): Logger {
  return new Logger(context)
}

/**
 * Default logger instance
 */
export const logger = createLogger()

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * OCR-specific error types for better error handling
 */
export enum OCRErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  IMAGE_PROCESSING_ERROR = 'IMAGE_PROCESSING_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  VISION_API_ERROR = 'VISION_API_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for OCR-specific errors
 */
export class OCRError extends Error {
  public readonly type: OCRErrorType
  public readonly code: string
  public readonly statusCode: number
  public readonly isRetryable: boolean

  constructor(
    message: string,
    type: OCRErrorType,
    options?: {
      statusCode?: number
      isRetryable?: boolean
      cause?: Error
    }
  ) {
    super(message)
    this.name = 'OCRError'
    this.type = type
    this.code = type
    this.statusCode = options?.statusCode ?? 500
    this.isRetryable = options?.isRetryable ?? false
    
    if (options?.cause) {
      this.cause = options.cause
    }
  }
}

/**
 * Classify an error into an OCRErrorType
 */
export function classifyOCRError(error: unknown): {
  type: OCRErrorType
  message: string
  statusCode: number
  isRetryable: boolean
} {
  if (error instanceof OCRError) {
    return {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      isRetryable: error.isRetryable,
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      name.includes('networkerror')
    ) {
      return {
        type: OCRErrorType.NETWORK_ERROR,
        message: 'Koneksi jaringan gagal. Silakan periksa koneksi internet Anda.',
        statusCode: 503,
        isRetryable: true,
      }
    }

    // Timeout errors
    if (
      message.includes('timeout') ||
      message.includes('etimedout') ||
      message.includes('deadline exceeded') ||
      name.includes('timeouterror')
    ) {
      return {
        type: OCRErrorType.TIMEOUT_ERROR,
        message: 'Waktu pemrosesan habis. Silakan coba lagi.',
        statusCode: 504,
        isRetryable: true,
      }
    }

    // Credential errors
    if (
      message.includes('credential') ||
      message.includes('authentication') ||
      message.includes('unauthorized') ||
      message.includes('permission denied') ||
      message.includes('google_cloud_credentials')
    ) {
      return {
        type: OCRErrorType.INVALID_CREDENTIALS,
        message: 'Layanan OCR tidak dikonfigurasi dengan benar.',
        statusCode: 503,
        isRetryable: false,
      }
    }

    // Image processing errors
    if (
      message.includes('image') ||
      message.includes('decode') ||
      message.includes('corrupt') ||
      message.includes('invalid format')
    ) {
      return {
        type: OCRErrorType.IMAGE_PROCESSING_ERROR,
        message: 'Gambar tidak dapat diproses. Silakan coba dengan gambar lain.',
        statusCode: 400,
        isRetryable: false,
      }
    }

    // Rate limit errors
    if (
      message.includes('rate limit') ||
      message.includes('quota') ||
      message.includes('too many requests')
    ) {
      return {
        type: OCRErrorType.RATE_LIMIT_ERROR,
        message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
        statusCode: 429,
        isRetryable: true,
      }
    }

    // Vision API specific errors
    if (
      message.includes('vision') ||
      message.includes('annotate')
    ) {
      return {
        type: OCRErrorType.VISION_API_ERROR,
        message: 'Layanan OCR mengalami masalah. Silakan coba lagi.',
        statusCode: 502,
        isRetryable: true,
      }
    }
  }

  // Unknown error
  return {
    type: OCRErrorType.UNKNOWN_ERROR,
    message: 'Terjadi kesalahan. Silakan coba lagi.',
    statusCode: 500,
    isRetryable: true,
  }
}
