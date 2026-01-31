/**
 * Format a number as Indonesian Rupiah currency
 */
export function formatCurrency(
  amount: number,
  options?: {
    showSymbol?: boolean
    compact?: boolean
  }
): string {
  const { showSymbol = true, compact = false } = options ?? {}

  if (compact && amount >= 1_000_000) {
    const millions = amount / 1_000_000
    const formatted = millions.toFixed(millions % 1 === 0 ? 0 : 1)
    return showSymbol ? `Rp ${formatted} jt` : `${formatted} jt`
  }

  if (compact && amount >= 1_000) {
    const thousands = amount / 1_000
    const formatted = thousands.toFixed(thousands % 1 === 0 ? 0 : 1)
    return showSymbol ? `Rp ${formatted} rb` : `${formatted} rb`
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return showSymbol ? `Rp ${formatted}` : formatted
}

/**
 * Parse a formatted currency string back to a number
 */
export function parseCurrency(value: string): number {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')
  return parseInt(digits, 10) || 0
}
