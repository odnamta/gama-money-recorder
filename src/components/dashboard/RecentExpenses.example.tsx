/**
 * RecentExpenses Component Examples
 *
 * This file demonstrates various usage patterns for the RecentExpenses component.
 */

import { RecentExpenses } from './RecentExpenses'

/**
 * Example 1: Basic Usage
 * Simply render the component - it handles all data fetching internally
 */
export function BasicExample() {
  return (
    <div className="p-4">
      <RecentExpenses />
    </div>
  )
}

/**
 * Example 2: Dashboard Integration
 * Use as part of a complete dashboard layout
 */
export function DashboardExample() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Summary Cards */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-slate-500">Summary cards here...</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-slate-500">Quick actions here...</p>
        </div>

        {/* Recent Expenses */}
        <RecentExpenses />
      </div>
    </div>
  )
}

/**
 * Example 3: With Custom Spacing
 * Adjust spacing to fit your layout
 */
export function CustomSpacingExample() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Aktivitas Terbaru</h2>
      <RecentExpenses />
    </div>
  )
}

/**
 * Example 4: Mobile Layout
 * Component is mobile-first and works well on small screens
 */
export function MobileExample() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <RecentExpenses />
    </div>
  )
}

/**
 * Example 5: With Other Dashboard Sections
 * Combine with sync status and manager sections
 */
export function CompleteDashboardExample() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {/* Summary cards */}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4">
        {/* Quick capture buttons */}
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-lg p-4">
        <p className="text-sm">Sync status here...</p>
      </div>

      {/* Recent Expenses */}
      <RecentExpenses />

      {/* Manager Section (conditional) */}
      <div className="bg-white rounded-lg p-4">
        <p className="text-sm">Manager content here...</p>
      </div>
    </div>
  )
}

/**
 * Example 6: Testing States
 * The component handles these states automatically:
 *
 * Loading State:
 * - Shows 5 skeleton loaders
 * - Prevents layout shift
 *
 * Empty State:
 * - Receipt icon
 * - "Belum ada pengeluaran" message
 * - Encouragement to start capturing
 *
 * Loaded State:
 * - Up to 5 most recent expenses
 * - Each clickable to view details
 * - "Lihat Semua" button to history page
 */

/**
 * Example 7: Navigation Behavior
 * Component handles two types of navigation:
 */
export function NavigationExample() {
  // 1. Click "Lihat Semua" button → navigates to /history
  // 2. Click an expense → navigates to /history?id={expense.id}
  //    This opens the expense detail sheet on the history page

  return <RecentExpenses />
}

/**
 * Example 8: Responsive Design
 * Component adapts to different screen sizes
 */
export function ResponsiveExample() {
  return (
    <div className="container mx-auto px-4">
      {/* Mobile: Full width */}
      <div className="md:hidden">
        <RecentExpenses />
      </div>

      {/* Desktop: Part of grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        <RecentExpenses />
        <div className="bg-white rounded-lg p-4">
          <p>Other dashboard content</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Example 9: With Pull-to-Refresh
 * Combine with pull-to-refresh for better UX
 */
export function PullToRefreshExample() {
  // The useRecentExpenses hook automatically refreshes
  // when the underlying useExpenses hook detects changes
  // (polls every 10 seconds)

  return (
    <div className="min-h-screen">
      <RecentExpenses />
    </div>
  )
}

/**
 * Example 10: Offline Support
 * Component works offline by showing local expenses
 */
export function OfflineExample() {
  // When offline:
  // - Shows expenses from IndexedDB
  // - Displays sync status badges
  // - All navigation still works

  return (
    <div className="space-y-4">
      {/* Offline indicator */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm text-amber-800">Mode Offline</p>
      </div>

      {/* Recent expenses (shows local data) */}
      <RecentExpenses />
    </div>
  )
}
