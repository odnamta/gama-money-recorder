/**
 * Receipt Text Parser
 * 
 * Parses OCR text output to extract structured data from Indonesian receipts.
 * Handles various receipt formats including SPBU (gas stations), toll receipts,
 * restaurants, and general retail receipts.
 */

import type { ExtractedReceiptData } from '@/types/ocr'

/**
 * Indonesian month names for date parsing
 */
const INDONESIAN_MONTHS: Record<string, number> = {
  'jan': 0, 'januari': 0,
  'feb': 1, 'februari': 1,
  'mar': 2, 'maret': 2,
  'apr': 3, 'april': 3,
  'mei': 4, 'may': 4,
  'jun': 5, 'juni': 5,
  'jul': 6, 'juli': 6,
  'agu': 7, 'agustus': 7, 'aug': 7,
  'sep': 8, 'september': 8,
  'okt': 9, 'oktober': 9, 'oct': 9,
  'nov': 10, 'november': 10,
  'des': 11, 'desember': 11, 'dec': 11,
}

/**
 * Common vendor name patterns to skip (not actual vendor names)
 */
const SKIP_VENDOR_PATTERNS = [
  /^(STRUK|RECEIPT|NOTA|INVOICE|FAKTUR|KWITANSI)/i,
  /^(TANGGAL|DATE|JAM|TIME|WAKTU)/i,
  /^(KASIR|CASHIER|OPERATOR)/i,
  /^(NO\.?|NOMOR|NUMBER)/i,
  /^(TERIMA\s*KASIH|THANK\s*YOU)/i,
  /^[0-9]+$/,
  /^[0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{2,4}$/,
  /^(RP\.?|IDR|TOTAL|SUBTOTAL|GRAND)/i,
  /^(TUNAI|CASH|DEBIT|KREDIT|CREDIT)/i,
  /^(KEMBALIAN|CHANGE|BAYAR|PAYMENT)/i,
  /^\*+$/,
  /^-+$/,
  /^=+$/,
]

/**
 * Parse Indonesian number format (uses . for thousands, , for decimals)
 * Examples: "50.000" -> 50000, "1.500.000" -> 1500000
 */
export function parseIndonesianNumber(str: string): number {
  if (!str) return 0
  
  // Remove currency symbols and whitespace
  let cleaned = str.replace(/[Rp\s]/gi, '').trim()
  
  // Handle Indonesian format: dots are thousand separators
  // If there's a comma, it's likely a decimal separator
  if (cleaned.includes(',')) {
    // Format: 1.500.000,00 or 50.000,50
    const parts = cleaned.split(',')
    const integerPart = parts[0].replace(/\./g, '')
    const decimalPart = parts[1] || '0'
    return parseFloat(`${integerPart}.${decimalPart}`)
  }
  
  // No comma - dots are thousand separators
  cleaned = cleaned.replace(/\./g, '')
  
  const result = parseInt(cleaned, 10)
  return isNaN(result) ? 0 : result
}

/**
 * Parse Indonesian date formats
 * Supports: DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, DD MMMM YYYY
 */
export function parseIndonesianDate(str: string): Date | null {
  if (!str) return null
  
  const cleaned = str.trim()
  
  // Pattern 1: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const numericPattern = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/
  const numericMatch = cleaned.match(numericPattern)
  
  if (numericMatch) {
    const day = parseInt(numericMatch[1], 10)
    const month = parseInt(numericMatch[2], 10) - 1 // 0-indexed
    let year = parseInt(numericMatch[3], 10)
    
    // Handle 2-digit year
    if (year < 100) {
      year += year > 50 ? 1900 : 2000
    }
    
    const date = new Date(year, month, day)
    if (isValidDate(date)) return date
  }
  
  // Pattern 2: DD MMM YYYY or DD MMMM YYYY (Indonesian month names)
  const textPattern = /(\d{1,2})\s+([a-zA-Z]+)\s+(\d{2,4})/i
  const textMatch = cleaned.match(textPattern)
  
  if (textMatch) {
    const day = parseInt(textMatch[1], 10)
    const monthStr = textMatch[2].toLowerCase()
    let year = parseInt(textMatch[3], 10)
    
    // Handle 2-digit year
    if (year < 100) {
      year += year > 50 ? 1900 : 2000
    }
    
    // Find month number
    const month = INDONESIAN_MONTHS[monthStr]
    if (month !== undefined) {
      const date = new Date(year, month, day)
      if (isValidDate(date)) return date
    }
  }
  
  return null
}

/**
 * Check if a date is valid and not in the future
 */
function isValidDate(date: Date): boolean {
  if (isNaN(date.getTime())) return false
  
  const now = new Date()
  // Allow dates up to 1 year in the past and not in the future
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  
  return date >= oneYearAgo && date <= now
}

/**
 * Extract amount from receipt text
 * Looks for total/grand total patterns and large numbers
 */
export function extractAmount(lines: string[]): Pick<ExtractedReceiptData, 'amount' | 'amountConfidence'> {
  // Patterns for total amount (ordered by specificity)
  const totalPatterns = [
    // Explicit total patterns
    { pattern: /(?:GRAND\s*TOTAL|TOTAL\s*BAYAR|TOTAL\s*HARGA)[:\s]*(?:Rp\.?\s*)?([0-9.,]+)/i, confidence: 0.95 },
    { pattern: /(?:TOTAL)[:\s]*(?:Rp\.?\s*)?([0-9.,]+)/i, confidence: 0.90 },
    { pattern: /(?:JUMLAH)[:\s]*(?:Rp\.?\s*)?([0-9.,]+)/i, confidence: 0.85 },
    { pattern: /(?:BAYAR|TUNAI|CASH)[:\s]*(?:Rp\.?\s*)?([0-9.,]+)/i, confidence: 0.80 },
    // Amount with Rp prefix
    { pattern: /(?:Rp\.?\s*)([0-9.,]+)(?:\s*(?:TOTAL|TUNAI|CASH))?/i, confidence: 0.75 },
  ]
  
  // Search from bottom to top (totals usually at bottom)
  const reversedLines = [...lines].reverse()
  
  for (const { pattern, confidence } of totalPatterns) {
    for (const line of reversedLines) {
      const match = line.match(pattern)
      if (match) {
        const amount = parseIndonesianNumber(match[1])
        // Sanity check: amount should be reasonable (100 to 100 million IDR)
        if (amount >= 100 && amount <= 100_000_000) {
          return { amount, amountConfidence: confidence }
        }
      }
    }
  }
  
  // Fallback: look for large numbers that could be totals
  // Usually the largest number in the bottom half is the total
  const bottomHalf = reversedLines.slice(0, Math.ceil(lines.length / 2))
  let maxAmount = 0
  
  for (const line of bottomHalf) {
    // Match any large number
    const matches = line.match(/([0-9]{1,3}(?:[.,][0-9]{3})+)/g)
    if (matches) {
      for (const match of matches) {
        const amount = parseIndonesianNumber(match)
        if (amount > maxAmount && amount >= 1000 && amount <= 100_000_000) {
          maxAmount = amount
        }
      }
    }
  }
  
  if (maxAmount > 0) {
    return { amount: maxAmount, amountConfidence: 0.60 }
  }
  
  return {}
}

/**
 * Extract vendor name from receipt text
 * Usually in the first few lines of the receipt
 */
export function extractVendorName(lines: string[]): Pick<ExtractedReceiptData, 'vendorName' | 'vendorNameConfidence'> {
  // Check first 7 lines for vendor name
  const headerLines = lines.slice(0, 7)
  
  for (const line of headerLines) {
    const trimmed = line.trim()
    
    // Skip empty or very short lines
    if (trimmed.length < 3) continue
    
    // Skip very long lines (likely addresses or descriptions)
    if (trimmed.length > 50) continue
    
    // Skip lines matching known non-vendor patterns
    const shouldSkip = SKIP_VENDOR_PATTERNS.some(pattern => pattern.test(trimmed))
    if (shouldSkip) continue
    
    // Skip lines that are mostly numbers
    const digitRatio = (trimmed.match(/\d/g) || []).length / trimmed.length
    if (digitRatio > 0.5) continue
    
    // Skip lines with common receipt keywords
    if (/^(alamat|address|telp|phone|hp|fax)/i.test(trimmed)) continue
    
    // This looks like a vendor name
    // Clean up the name
    const vendorName = trimmed
      .replace(/[*\-=]+/g, '') // Remove decorative characters
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim()
    
    if (vendorName.length >= 3) {
      // Higher confidence if it's in ALL CAPS (common for vendor names)
      const isAllCaps = vendorName === vendorName.toUpperCase()
      const confidence = isAllCaps ? 0.85 : 0.70
      
      return { vendorName, vendorNameConfidence: confidence }
    }
  }
  
  return {}
}

/**
 * Extract date from receipt text
 */
export function extractDate(lines: string[]): Pick<ExtractedReceiptData, 'date' | 'dateConfidence'> {
  // Date patterns to search for
  const datePatterns = [
    // Explicit date labels
    { pattern: /(?:TANGGAL|TGL|DATE)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i, confidence: 0.95 },
    { pattern: /(?:TANGGAL|TGL|DATE)[:\s]*(\d{1,2}\s+[a-zA-Z]+\s+\d{2,4})/i, confidence: 0.95 },
    // Standalone date formats
    { pattern: /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i, confidence: 0.80 },
    { pattern: /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2})/i, confidence: 0.75 },
    { pattern: /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)[a-z]*\s+\d{2,4})/i, confidence: 0.85 },
  ]
  
  for (const { pattern, confidence } of datePatterns) {
    for (const line of lines) {
      const match = line.match(pattern)
      if (match) {
        const parsedDate = parseIndonesianDate(match[1])
        if (parsedDate) {
          return {
            date: parsedDate.toISOString().split('T')[0],
            dateConfidence: confidence
          }
        }
      }
    }
  }
  
  return {}
}

/**
 * Main parser function - extracts all data from receipt text
 */
export function parseReceiptText(text: string): ExtractedReceiptData {
  if (!text || typeof text !== 'string') {
    return {}
  }
  
  // Split into lines and clean up
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  if (lines.length === 0) {
    return {}
  }
  
  // Extract all fields
  const amountData = extractAmount(lines)
  const vendorData = extractVendorName(lines)
  const dateData = extractDate(lines)
  
  return {
    ...amountData,
    ...vendorData,
    ...dateData,
  }
}

/**
 * Calculate overall confidence from extracted data
 */
export function calculateOverallConfidence(data: ExtractedReceiptData): number {
  const confidences: number[] = []
  
  if (data.amountConfidence !== undefined) {
    confidences.push(data.amountConfidence)
  }
  if (data.vendorNameConfidence !== undefined) {
    confidences.push(data.vendorNameConfidence)
  }
  if (data.dateConfidence !== undefined) {
    confidences.push(data.dateConfidence)
  }
  
  if (confidences.length === 0) {
    return 0
  }
  
  // Weighted average - amount is most important
  if (data.amountConfidence !== undefined) {
    const amountWeight = 0.5
    const otherWeight = 0.5 / (confidences.length - 1 || 1)
    
    let weighted = data.amountConfidence * amountWeight
    if (data.vendorNameConfidence !== undefined) {
      weighted += data.vendorNameConfidence * otherWeight
    }
    if (data.dateConfidence !== undefined) {
      weighted += data.dateConfidence * otherWeight
    }
    
    return weighted
  }
  
  // Simple average if no amount
  return confidences.reduce((sum, c) => sum + c, 0) / confidences.length
}
