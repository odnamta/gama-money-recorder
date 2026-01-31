# GAMA Money Recorder - Formatting Standards

## Currency Formatting (IDR)

### Standard Format
Indonesian Rupiah uses period (.) as thousand separator, no decimal places for whole amounts.

```typescript
// lib/utils/format-currency.ts
export function formatCurrency(
  amount: number,
  options?: {
    showSymbol?: boolean
    compact?: boolean
  }
): string {
  const { showSymbol = true, compact = false } = options ?? {}
  
  if (compact && amount >= 1_000_000) {
    // 1.5 jt, 2.3 jt
    const millions = amount / 1_000_000
    const formatted = millions.toFixed(millions % 1 === 0 ? 0 : 1)
    return showSymbol ? `Rp ${formatted} jt` : `${formatted} jt`
  }
  
  if (compact && amount >= 1_000) {
    // 500 rb, 750 rb
    const thousands = amount / 1_000
    const formatted = thousands.toFixed(thousands % 1 === 0 ? 0 : 1)
    return showSymbol ? `Rp ${formatted} rb` : `${formatted} rb`
  }
  
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
  
  return showSymbol ? `Rp ${formatted}` : formatted
}
```

### Examples
| Amount | Standard | Compact |
|--------|----------|---------|
| 50000 | Rp 50.000 | Rp 50 rb |
| 500000 | Rp 500.000 | Rp 500 rb |
| 1500000 | Rp 1.500.000 | Rp 1.5 jt |
| 25000000 | Rp 25.000.000 | Rp 25 jt |

### Input Formatting
For amount input fields, format as user types:

```typescript
// hooks/use-currency-input.ts
export function useCurrencyInput(initialValue = 0) {
  const [rawValue, setRawValue] = useState(initialValue)
  const [displayValue, setDisplayValue] = useState(
    formatCurrency(initialValue, { showSymbol: false })
  )
  
  const handleChange = (input: string) => {
    // Remove non-digits
    const digits = input.replace(/\D/g, '')
    const numericValue = parseInt(digits, 10) || 0
    
    setRawValue(numericValue)
    setDisplayValue(formatCurrency(numericValue, { showSymbol: false }))
  }
  
  return { rawValue, displayValue, handleChange }
}
```

---

## Date Formatting (Indonesian Locale)

### Standard Formats

```typescript
// lib/utils/format-date.ts
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
        year: '2-digit'
      })
    
    case 'medium':
      // 15 Jan 2024
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    
    case 'long':
      // Senin, 15 Januari 2024
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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
```

### Time Formatting

```typescript
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date, 'medium')}, ${formatTime(date)}`
}
```

### Examples
| Input | Short | Medium | Long |
|-------|-------|--------|------|
| 2024-01-15 | 15/01/24 | 15 Jan 2024 | Senin, 15 Januari 2024 |
| 2024-03-08 | 08/03/24 | 8 Mar 2024 | Jumat, 8 Maret 2024 |

---

## Number Formatting

### General Numbers

```typescript
export function formatNumber(
  value: number,
  options?: {
    decimals?: number
    compact?: boolean
  }
): string {
  const { decimals = 0, compact = false } = options ?? {}
  
  if (compact) {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}jt`
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}rb`
    }
  }
  
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}
```

### Percentage

```typescript
export function formatPercentage(
  value: number,
  decimals = 0
): string {
  return `${(value * 100).toFixed(decimals)}%`
}
```

### Distance (for GPS)

```typescript
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}
```

---

## OCR Confidence Display

### Confidence Levels

```typescript
// lib/utils/format-confidence.ts
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.9) return 'high'
  if (confidence >= 0.8) return 'low'
  return 'low'
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}
```

### Visual Indicators

```typescript
// components/atoms/ConfidenceBadge.tsx
const confidenceStyles: Record<ConfidenceLevel, string> = {
  high: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-red-100 text-red-800 border-red-200'
}

const confidenceLabels: Record<ConfidenceLevel, string> = {
  high: 'Akurat',
  medium: 'Perlu Cek',
  low: 'Manual'
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const level = getConfidenceLevel(confidence)
  
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
      confidenceStyles[level]
    )}>
      {confidenceLabels[level]} ({formatConfidence(confidence)})
    </span>
  )
}
```

### Confidence Thresholds
| Range | Level | Display | Action |
|-------|-------|---------|--------|
| ≥90% | High | Green "Akurat" | Auto-accept |
| 80-89% | Medium | Yellow "Perlu Cek" | Highlight for review |
| <80% | Low | Red "Manual" | Require manual entry |

---

## Expense Category Display

### Category Labels & Icons

```typescript
// constants/expense-categories.ts
export const EXPENSE_CATEGORIES = {
  fuel: {
    label: 'BBM',
    labelFull: 'Bahan Bakar',
    icon: 'Fuel',
    color: 'orange'
  },
  toll: {
    label: 'Tol',
    labelFull: 'Tol',
    icon: 'Route',
    color: 'blue'
  },
  parking: {
    label: 'Parkir',
    labelFull: 'Parkir',
    icon: 'ParkingCircle',
    color: 'purple'
  },
  food: {
    label: 'Makan',
    labelFull: 'Makan & Minum',
    icon: 'UtensilsCrossed',
    color: 'green'
  },
  lodging: {
    label: 'Penginapan',
    labelFull: 'Penginapan',
    icon: 'Bed',
    color: 'indigo'
  },
  transport: {
    label: 'Transport',
    labelFull: 'Transport Lokal',
    icon: 'Car',
    color: 'cyan'
  },
  supplies: {
    label: 'Perlengkapan',
    labelFull: 'Perlengkapan',
    icon: 'Package',
    color: 'amber'
  },
  other: {
    label: 'Lainnya',
    labelFull: 'Lainnya',
    icon: 'MoreHorizontal',
    color: 'gray'
  }
} as const

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES
```

### Category Badge Component

```typescript
// components/atoms/CategoryBadge.tsx
export function CategoryBadge({ 
  category,
  size = 'md' 
}: { 
  category: ExpenseCategory
  size?: 'sm' | 'md' | 'lg'
}) {
  const config = EXPENSE_CATEGORIES[category]
  const Icon = Icons[config.icon]
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full',
      `bg-${config.color}-100 text-${config.color}-800`,
      sizeClasses[size]
    )}>
      <Icon className={iconSizeClasses[size]} />
      {config.label}
    </span>
  )
}
```

---

## Sync Status Display

### Status Labels

```typescript
// constants/sync-status.ts
export const SYNC_STATUS = {
  pending: {
    label: 'Menunggu',
    icon: 'Clock',
    color: 'yellow'
  },
  syncing: {
    label: 'Menyinkron...',
    icon: 'RefreshCw',
    color: 'blue',
    animate: true
  },
  synced: {
    label: 'Tersinkron',
    icon: 'CheckCircle',
    color: 'green'
  },
  failed: {
    label: 'Gagal',
    icon: 'AlertCircle',
    color: 'red'
  }
} as const
```

### Sync Status Indicator

```typescript
// components/atoms/SyncStatusIndicator.tsx
export function SyncStatusIndicator({ 
  status,
  showLabel = true 
}: { 
  status: SyncStatus
  showLabel?: boolean
}) {
  const config = SYNC_STATUS[status]
  const Icon = Icons[config.icon]
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1',
      `text-${config.color}-600`
    )}>
      <Icon className={cn(
        'h-4 w-4',
        config.animate && 'animate-spin'
      )} />
      {showLabel && <span className="text-sm">{config.label}</span>}
    </span>
  )
}
```

---

## Approval Status Display

```typescript
export const APPROVAL_STATUS = {
  draft: {
    label: 'Draft',
    color: 'gray'
  },
  pending_approval: {
    label: 'Menunggu Persetujuan',
    color: 'yellow'
  },
  approved: {
    label: 'Disetujui',
    color: 'green'
  },
  rejected: {
    label: 'Ditolak',
    color: 'red'
  }
} as const
```

---

## Form Validation Messages

Use Indonesian for all user-facing validation messages:

```typescript
export const VALIDATION_MESSAGES = {
  required: 'Wajib diisi',
  invalidAmount: 'Jumlah tidak valid',
  minAmount: (min: number) => `Minimal ${formatCurrency(min)}`,
  maxAmount: (max: number) => `Maksimal ${formatCurrency(max)}`,
  receiptRequired: 'Struk wajib dilampirkan untuk pengeluaran > Rp 500.000',
  jobOrderRequired: 'Pilih job order atau tandai sebagai overhead',
  invalidDate: 'Tanggal tidak valid',
  futureDate: 'Tanggal tidak boleh di masa depan',
  categoryRequired: 'Pilih kategori pengeluaran'
}
```
