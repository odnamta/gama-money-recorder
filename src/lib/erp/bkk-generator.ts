import { createClient } from '@/lib/supabase/server'

/**
 * BKK Number Generator
 * 
 * Generates unique BKK (Bukti Kas Keluar) numbers in format: BKK-YYYYMM-XXXX
 * Example: BKK-202602-0001
 */

/**
 * Generate a new BKK number for the current month
 * Format: BKK-YYYYMM-XXXX (e.g., BKK-202602-0001)
 */
export async function generateBKKNumber(): Promise<string> {
  const supabase = await createClient()
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `BKK-${year}${month}`

  // Get the last BKK number for this month
  const { data, error } = await supabase
    .from('bkk_records')
    .select('record_number')
    .like('record_number', `${prefix}-%`)
    .order('record_number', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(`Failed to get last BKK number: ${error.message}`)
  }

  let sequence = 1
  if (data && data.length > 0) {
    // Extract sequence from last number (BKK-YYYYMM-XXXX -> XXXX)
    const lastNumber = data[0].record_number
    const parts = lastNumber.split('-')
    if (parts.length === 3) {
      const lastSequence = parseInt(parts[2], 10)
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1
      }
    }
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`
}

/**
 * Validate BKK number format
 */
export function isValidBKKNumber(bkkNumber: string): boolean {
  const pattern = /^BKK-\d{6}-\d{4}$/
  return pattern.test(bkkNumber)
}

/**
 * Parse BKK number into components
 */
export function parseBKKNumber(bkkNumber: string): {
  year: number
  month: number
  sequence: number
} | null {
  if (!isValidBKKNumber(bkkNumber)) {
    return null
  }

  const parts = bkkNumber.split('-')
  const yearMonth = parts[1]
  const sequence = parseInt(parts[2], 10)

  return {
    year: parseInt(yearMonth.substring(0, 4), 10),
    month: parseInt(yearMonth.substring(4, 6), 10),
    sequence,
  }
}
