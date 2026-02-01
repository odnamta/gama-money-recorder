# RecentExpenses Component

## Overview
The `RecentExpenses` component displays the most recent 5 expenses on the dashboard, providing users with a quick overview of their latest spending activity.

## Features
- **Recent Expenses**: Shows the last 5 expenses using the `useRecentExpenses` hook
- **Loading State**: Displays skeleton loaders while fetching data
- **Empty State**: Shows a friendly message with Receipt icon when no expenses exist
- **Navigation**: "Lihat Semua" button navigates to the full history page
- **Expense Details**: Uses `ExpenseListItem` component for consistent display

## Usage

```tsx
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <RecentExpenses />
    </div>
  )
}
```

## Component Structure

```
RecentExpenses
├── Header
│   ├── Title ("Terbaru")
│   └── "Lihat Semua" Button
└── Content
    ├── Loading Skeletons (5 items)
    ├── Empty State (when no expenses)
    └── Expense List (ExpenseListItem × N)
```

## States

### Loading State
Shows 5 skeleton placeholders while expenses are being fetched:
- Circular skeleton for category icon
- Two line skeletons for name and date
- Rectangular skeleton for amount

### Empty State
Displayed when user has no expenses:
- Large Receipt icon (gray)
- "Belum ada pengeluaran" heading
- "Mulai catat pengeluaran Anda" subtext

### Loaded State
Shows up to 5 most recent expenses:
- Each expense rendered with `ExpenseListItem`
- Clickable to view details
- Separated by dividers

## Navigation

### View All Button
- Located in the header
- Text: "Lihat Semua" with chevron icon
- Navigates to `/history` page
- Styled with blue accent color

### Expense Click
- Clicking an expense navigates to `/history?id={expense.id}`
- Opens the expense detail sheet on the history page

## Styling

### Container
- White background with rounded corners
- Border for subtle separation
- Divided sections (header and content)

### Header
- Padding: 16px
- Bottom border
- Flex layout with space-between

### Content
- Padding: 16px (loading/empty states)
- Divided list items with subtle borders

## Dependencies
- `useRecentExpenses` hook (limit: 5)
- `ExpenseListItem` component
- `Button` component (shadcn/ui)
- `Skeleton` component (shadcn/ui)
- `lucide-react` icons (Receipt, ChevronRight)
- Next.js `useRouter` for navigation

## Data Flow

```
useRecentExpenses(5)
  ↓
useExpenses({})
  ↓
Fetch local + server expenses
  ↓
Merge and deduplicate
  ↓
Sort by date (newest first)
  ↓
Slice to 5 items
  ↓
Display in RecentExpenses
```

## Accessibility
- Semantic HTML structure
- Clickable buttons with proper hover states
- Clear visual hierarchy
- Descriptive empty state message

## Performance
- Uses memoized `useRecentExpenses` hook
- Efficient re-rendering with React keys
- Skeleton loading prevents layout shift

## Related Components
- `ExpenseListItem` - Individual expense display
- `SummaryCards` - Dashboard summary statistics
- `QuickActions` - Quick capture buttons

## Related Hooks
- `useRecentExpenses` - Fetches recent expenses
- `useExpenses` - Base expense fetching hook

## Design Decisions

### Why 5 expenses?
- Provides enough context without overwhelming
- Fits well on mobile screens
- Matches common dashboard patterns

### Why ExpenseListItem?
- Reuses existing component for consistency
- Maintains familiar UI across history and dashboard
- Reduces code duplication

### Why separate empty state?
- Guides new users to take action
- More engaging than blank space
- Consistent with app's friendly tone
