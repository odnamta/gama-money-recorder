# PeriodSummaryCard Component

## Overview
A compact card component that displays expense summary statistics for a specific time period (today, week, or month).

## Features
- Color-coded styling (blue, green, purple)
- Compact currency formatting for large amounts
- Icon support via Lucide React
- Transaction count display
- Responsive design

## Usage

```tsx
import { Calendar } from 'lucide-react'
import { PeriodSummaryCard } from '@/components/dashboard/PeriodSummaryCard'

function Dashboard() {
  return (
    <PeriodSummaryCard
      title="Hari Ini"
      total={150000}
      count={3}
      icon={Calendar}
      color="blue"
    />
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | Yes | Period title (e.g., "Hari Ini", "Minggu Ini") |
| `total` | `number` | Yes | Total amount for the period in IDR |
| `count` | `number` | Yes | Number of transactions |
| `icon` | `LucideIcon` | Yes | Icon component from lucide-react |
| `color` | `'blue' \| 'green' \| 'purple'` | Yes | Color variant for the card |
| `className` | `string` | No | Additional CSS classes |

## Color Variants

### Blue
- Background: `bg-blue-50`
- Icon: `text-blue-600`
- Amount: `text-blue-700`
- **Use for**: Today's summary

### Green
- Background: `bg-green-50`
- Icon: `text-green-600`
- Amount: `text-green-700`
- **Use for**: This week's summary

### Purple
- Background: `bg-purple-50`
- Icon: `text-purple-600`
- Amount: `text-purple-700`
- **Use for**: This month's summary

## Currency Formatting

The component uses `formatCurrency` with `compact: true` option:

| Amount | Display |
|--------|---------|
| 50,000 | Rp 50 rb |
| 500,000 | Rp 500 rb |
| 1,500,000 | Rp 1.5 jt |
| 25,000,000 | Rp 25 jt |

## Examples

### Standard Usage (Dashboard)
```tsx
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import { PeriodSummaryCard } from '@/components/dashboard/PeriodSummaryCard'

function SummaryCards() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <PeriodSummaryCard
        title="Hari Ini"
        total={150000}
        count={3}
        icon={Calendar}
        color="blue"
      />
      <PeriodSummaryCard
        title="Minggu Ini"
        total={1500000}
        count={12}
        icon={CalendarDays}
        color="green"
      />
      <PeriodSummaryCard
        title="Bulan Ini"
        total={5500000}
        count={45}
        icon={CalendarRange}
        color="purple"
      />
    </div>
  )
}
```

### Empty State
```tsx
<PeriodSummaryCard
  title="Hari Ini"
  total={0}
  count={0}
  icon={Calendar}
  color="blue"
/>
// Displays: "Rp 0" and "0 transaksi"
```

### Large Amounts
```tsx
<PeriodSummaryCard
  title="Bulan Ini"
  total={25000000}
  count={120}
  icon={CalendarRange}
  color="purple"
/>
// Displays: "Rp 25 jt" and "120 transaksi"
```

## Design Specifications

### Layout
- Padding: `p-4` (16px)
- Border radius: `rounded-lg` (8px)
- Background: Color-specific (50 shade)

### Typography
- Title: `text-sm font-medium text-slate-600`
- Amount: `text-xl font-bold` + color-specific
- Count: `text-xs text-slate-500`

### Icon
- Size: `h-4 w-4` (16px)
- Color: Color-specific (600 shade)

### Spacing
- Icon-title gap: `gap-2` (8px)
- Title-amount margin: `mb-2` (8px)

## Accessibility

- Semantic HTML structure
- Color is not the only indicator (text labels present)
- Readable contrast ratios for all text

## Related Components

- `SummaryCards` - Container that uses three PeriodSummaryCard instances
- `useDashboardStats` - Hook that provides data for these cards

## File Location
`src/components/dashboard/PeriodSummaryCard.tsx`

## Dependencies
- `lucide-react` - Icon components
- `@/lib/utils/cn` - Class name utility
- `@/lib/utils/format-currency` - Currency formatting
