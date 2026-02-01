/**
 * QuickActions Component Examples
 * 
 * This file demonstrates usage patterns for the QuickActions component.
 */

import { QuickActions } from './QuickActions'

// Example 1: Basic usage in dashboard
export function DashboardExample() {
  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-semibold">Aksi Cepat</h2>
      <QuickActions />
    </div>
  )
}

// Example 2: In a card container
export function CardContainerExample() {
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="font-semibold mb-3">Catat Pengeluaran</h3>
      <QuickActions />
    </div>
  )
}

// Example 3: With other dashboard sections
export function FullDashboardExample() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="px-4 py-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Summary cards here */}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg">
          {/* Recent expenses list here */}
        </div>
      </div>
    </div>
  )
}

// Example 4: Testing navigation behavior
export function NavigationTestExample() {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm text-blue-800 mb-2">
          Click the main button to navigate to /capture
        </p>
        <p className="text-sm text-blue-800 mb-4">
          Click a category shortcut to navigate to /capture?category=fuel (etc.)
        </p>
        <QuickActions />
      </div>
    </div>
  )
}
