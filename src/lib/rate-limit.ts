/**
 * Simple in-memory rate limiter for API routes
 * 
 * Uses a sliding window approach to track requests per user/IP.
 * Designed for serverless environments - state is per-instance.
 * 
 * Note: In production with multiple instances, consider using
 * Redis or a distributed cache for shared state.
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Number of remaining requests in the current window */
  remaining: number
  /** Timestamp when the rate limit resets (ms since epoch) */
  resetAt: number
  /** Total requests allowed per window */
  limit: number
}

interface RateLimitEntry {
  /** Timestamps of requests within the current window */
  timestamps: number[]
  /** When this entry was last accessed (for cleanup) */
  lastAccess: number
}

/**
 * In-memory rate limiter using sliding window algorithm
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: RateLimitConfig) {
    this.config = config
    // Start cleanup interval to prevent memory leaks
    this.startCleanup()
  }

  /**
   * Check if a request is allowed for the given identifier
   * @param identifier - Unique identifier (user ID, IP address, etc.)
   * @returns Rate limit result with allowed status and metadata
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get or create entry for this identifier
    let entry = this.store.get(identifier)
    
    if (!entry) {
      entry = { timestamps: [], lastAccess: now }
      this.store.set(identifier, entry)
    }

    // Remove timestamps outside the current window (sliding window)
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart)
    entry.lastAccess = now

    // Calculate remaining requests
    const currentCount = entry.timestamps.length
    const remaining = Math.max(0, this.config.maxRequests - currentCount)
    const resetAt = entry.timestamps.length > 0 
      ? entry.timestamps[0] + this.config.windowMs 
      : now + this.config.windowMs

    // Check if request is allowed
    const allowed = currentCount < this.config.maxRequests

    if (allowed) {
      // Record this request
      entry.timestamps.push(now)
    }

    return {
      allowed,
      remaining: allowed ? remaining - 1 : 0,
      resetAt,
      limit: this.config.maxRequests
    }
  }

  /**
   * Reset rate limit for a specific identifier
   * Useful for testing or admin overrides
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get current stats for monitoring
   */
  getStats(): { totalEntries: number; oldestEntry: number | null } {
    let oldestEntry: number | null = null
    
    for (const entry of this.store.values()) {
      if (entry.timestamps.length > 0) {
        const oldest = Math.min(...entry.timestamps)
        if (oldestEntry === null || oldest < oldestEntry) {
          oldestEntry = oldest
        }
      }
    }

    return {
      totalEntries: this.store.size,
      oldestEntry
    }
  }

  /**
   * Start periodic cleanup of stale entries
   */
  private startCleanup(): void {
    // Clean up every 5 minutes
    const cleanupIntervalMs = 5 * 60 * 1000
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)

    // Don't prevent Node.js from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Remove stale entries that haven't been accessed recently
   */
  private cleanup(): void {
    const now = Date.now()
    // Remove entries not accessed in the last 10 minutes
    const staleThreshold = 10 * 60 * 1000

    for (const [identifier, entry] of this.store.entries()) {
      if (now - entry.lastAccess > staleThreshold) {
        this.store.delete(identifier)
      }
    }
  }

  /**
   * Stop the cleanup interval (for testing)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

/**
 * Default rate limiter configurations
 */
export const RATE_LIMIT_CONFIGS = {
  /** OCR API: 10 requests per minute per user */
  OCR: {
    maxRequests: 10,
    windowMs: 60 * 1000 // 1 minute
  },
  /** General API: 100 requests per minute */
  GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000
  },
  /** Strict: 5 requests per minute (for expensive operations) */
  STRICT: {
    maxRequests: 5,
    windowMs: 60 * 1000
  }
} as const

/**
 * Singleton rate limiter instance for OCR API
 * Using module-level singleton to persist across requests in the same instance
 */
let ocrRateLimiter: RateLimiter | null = null

export function getOCRRateLimiter(): RateLimiter {
  if (!ocrRateLimiter) {
    ocrRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.OCR)
  }
  return ocrRateLimiter
}

/**
 * Extract identifier from request for rate limiting
 * Prefers user ID from auth, falls back to IP address
 */
export function getRequestIdentifier(request: Request, userId?: string): string {
  // Prefer authenticated user ID
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Get the first IP in the chain (client IP)
    const clientIp = forwardedFor.split(',')[0].trim()
    return `ip:${clientIp}`
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return `ip:${realIp}`
  }

  // Last resort: use a generic identifier
  // This shouldn't happen in production but prevents errors
  return 'ip:unknown'
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
    'Retry-After': result.allowed 
      ? '0' 
      : Math.ceil((result.resetAt - Date.now()) / 1000).toString()
  }
}
