# QuickActions Component

## Overview
Provides quick access buttons for expense capture with category shortcuts.

## Features
- Large primary "Catat Pengeluaran" button
- Three category shortcut buttons (BBM, Tol, Makan)
- Navigation to capture page with pre-selected category
- Color-coded category buttons

## Usage

```tsx
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function DashboardPage() {
  return (
    <div>
      <QuickActions />
    </div>
  )
}
```

## Component Structure

### Main Capture Button
- Large button with Camera icon
- Navigates to `/capture` without pre-selection
- Full width, prominent placement

### Category Shortcuts
- Grid of 3 buttons (fuel, toll, food)
- Each button shows category icon and label
- Navigates to `/capture?category={category}`
- Color-coded hover states matching category colors

## Navigation Behavior

When a category shortcut is clicked:
1. Navigates to `/capture` page
2. Passes category as URL parameter
3. ExpenseCaptureForm auto-selects the category
4. User can still change category if needed

## Styling
- Uses shadcn/ui Button component
- Color classes for category-specific styling
- Responsive grid layout
- Touch-friendly button sizes

## Related Components
- `ExpenseCaptureForm` - Receives the pre-selected category
- `CategorySelector` - Shows the selected category in the form
