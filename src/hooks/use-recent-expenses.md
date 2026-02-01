# useRecentExpenses Hook

## Overview

The `useRecentExpenses` hook provides a simple way to fetch and display the most recent N expenses. It leverages the existing `useExpenses` hook to fetch all expenses and returns only the most recent items.

## Features

- ✅ Returns the most recent N expenses (default: 5)
- ✅ Expenses are already sorted by date (newest first)
- ✅ Includes loading state
- ✅ Includes error handling
- ✅ Provides refresh function
- ✅ Works offline with local data
- ✅ Merges local and server data automatically

## API

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `number` | `5` | Number of recent expenses to return |

### Return Value

```typescript
interface UseRecentExpensesReturn {
  /** Array of recent expenses (limited to N most recent) */
  recent: DisplayExpense[]
  /** Whether expenses are being loaded */
  isLoading: boolean
  /** Error from the fetch operation */
  error: Error | null
  /** Refresh the expenses list */
  refresh: () => void
}
```

## Usage

### Basic Usage

```tsx
import { useRecentExpenses } from '@/hooks/use-recent-expenses'

function RecentExpenses() {
  const { recent, isLoading } = useRecentExpenses()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {recent.map(expense => (
        <div key={expense.id}>{expense.amount}</div>
      ))}
    </div>
  )
}
```

### Custom Limit

```tsx
// Show only 3 most recent expenses
const { recent } = useRecentExpenses(3)
```

### With Error Handling

```tsx
const { recent, isLoading, error } = useRecentExpenses()

if (error) {
  return <div>Error: {error.message}</div>
}
```

### With Refresh

```tsx
const { recent, refresh } = useRecentExpenses()

return (
  <div>
    <button onClick={refresh}>Refresh</button>
    {recent.map(expense => (
      <div key={expense.id}>{expense.amount}</div>
    ))}
  </div>
)
```

## Implementation Details

### Data Flow

1. Calls `useExpenses({})` to fetch all expenses
2. Expenses are already sorted by date (newest first) from `useExpenses`
3. Uses `useMemo` to slice the array to the specified limit
4. Returns the sliced array along with loading state and error

### Performance

- Uses `useMemo` to prevent unnecessary re-slicing
- Only re-computes when `expenses` or `limit` changes
- Leverages the existing `useExpenses` hook's caching and polling

### Offline Support

The hook automatically works offline because it uses `useExpenses`, which:
- Fetches local expenses from IndexedDB
- Fetches server expenses if online
- Merges and deduplicates the results

## Related Hooks

- `useExpenses` - Fetches all expenses with filtering
- `useDashboardStats` - Calculates expense statistics by period

## Examples

See `use-recent-expenses.example.tsx` for complete examples including:
- Basic usage
- Custom limit
- Error handling
- Refresh functionality
- Dashboard integration
- Empty state handling

## Design Document Reference

This hook implements the design specified in:
- `.kiro/specs/v0.8-dashboard/design.md` - Section: "Recent Expenses Hook"
- Task: 1.3 Create useRecentExpenses hook

## Testing

To test this hook:

1. **Manual Testing**:
   - Create some expenses in the app
   - Navigate to dashboard
   - Verify the most recent 5 expenses are displayed
   - Test with different limits

2. **Edge Cases**:
   - Empty expenses list
   - Fewer expenses than limit
   - Loading state
   - Error state
   - Offline mode

## Notes

- The hook does NOT apply any filters - it returns the most recent expenses regardless of category, status, etc.
- If you need filtered recent expenses, use `useExpenses` directly with filters
- The expenses are sorted by `expense_date` (newest first), then by `created_at`
