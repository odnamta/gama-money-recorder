/**
 * Format a date in Indonesian locale
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium'
): string {
  const d = typeof date === 'string' ? new Date(date) : date

  switch (format) {
    case 'short':
      // 15/01/24
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })

    case 'medium':
      // 15 Jan 2024
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })

    case 'long':
      // Senin, 15 Januari 2024
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

    case 'relative':
      return formatRelativeDate(d)
  }
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`

  return formatDate(date, 'medium')
}

/**
 * Format time in 24-hour format
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date, 'medium')}, ${formatTime(date)}`
}

/**
 * Convert date to YYYY-MM-DD format for input[type="date"]
 */
export function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Parse YYYY-MM-DD string to Date
 */
export function fromDateInputValue(value: string): Date {
  return new Date(value + 'T00:00:00')
}
