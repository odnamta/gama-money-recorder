/**
 * SummaryCards Component Examples
 *
 * This file demonstrates various usage scenarios for the SummaryCards component.
 */

import { SummaryCards } from './SummaryCards'

/**
 * Example 1: Basic Usage
 * Standard dashboard implementation
 */
export function BasicExample() {
  return (
    <div className="p-4 bg-slate-50">
      <h2 className="text-lg font-semibold mb-4">Ringkasan Pengeluaran</h2>
      <SummaryCards />
    </div>
  )
}

/**
 * Example 2: Dashboard Page Layout
 * Full dashboard page with summary cards
 */
export function DashboardPageExample() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <p className="text-sm text-muted-foreground">Selamat datang,</p>
        <h1 className="text-xl font-bold">John Doe</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Summary Cards */}
        <SummaryCards />

        {/* Other dashboard sections would go here */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Quick Actions</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Example 3: With Section Header
 * Summary cards with a descriptive header
 */
export function WithHeaderExample() {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold">Statistik</h3>
        <p className="text-sm text-muted-foreground">
          Ringkasan pengeluaran Anda
        </p>
      </div>
      <SummaryCards />
    </div>
  )
}

/**
 * Example 4: Mobile Layout
 * Optimized for mobile screens
 */
export function MobileLayoutExample() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Pantau pengeluaran Anda
        </p>
      </div>
      <SummaryCards />
    </div>
  )
}

/**
 * Example 5: With Refresh Action
 * Summary cards with manual refresh capability
 */
export function WithRefreshExample() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Ringkasan</h3>
        <button
          className="text-sm text-blue-600 hover:text-blue-700"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
      <SummaryCards />
    </div>
  )
}

/**
 * Example 6: Compact Layout
 * Tighter spacing for dense layouts
 */
export function CompactLayoutExample() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Statistik Cepat</h3>
      <div className="scale-95 origin-top-left">
        <SummaryCards />
      </div>
    </div>
  )
}

/**
 * Example 7: With Background
 * Summary cards on colored background
 */
export function WithBackgroundExample() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
      <h3 className="text-lg font-bold mb-4 text-slate-800">
        Pengeluaran Anda
      </h3>
      <SummaryCards />
    </div>
  )
}

/**
 * Example 8: Loading State Demo
 * Shows what the component looks like while loading
 * (This is handled automatically by the component)
 */
export function LoadingStateExample() {
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground mb-3">
        Loading state (automatic):
      </p>
      {/* The component shows skeletons automatically when isLoading is true */}
      <SummaryCards />
    </div>
  )
}
