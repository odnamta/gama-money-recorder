/**
 * Example usage of PeriodSummaryCard component
 * This file demonstrates how to use the component in the dashboard
 */

import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import { PeriodSummaryCard } from './PeriodSummaryCard'

export function PeriodSummaryCardExample() {
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {/* Today's summary */}
      <PeriodSummaryCard
        title="Hari Ini"
        total={150000}
        count={3}
        icon={Calendar}
        color="blue"
      />

      {/* This week's summary */}
      <PeriodSummaryCard
        title="Minggu Ini"
        total={1500000}
        count={12}
        icon={CalendarDays}
        color="green"
      />

      {/* This month's summary */}
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

/**
 * Example with zero values
 */
export function PeriodSummaryCardEmptyExample() {
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      <PeriodSummaryCard
        title="Hari Ini"
        total={0}
        count={0}
        icon={Calendar}
        color="blue"
      />

      <PeriodSummaryCard
        title="Minggu Ini"
        total={0}
        count={0}
        icon={CalendarDays}
        color="green"
      />

      <PeriodSummaryCard
        title="Bulan Ini"
        total={0}
        count={0}
        icon={CalendarRange}
        color="purple"
      />
    </div>
  )
}

/**
 * Example with large amounts (compact formatting)
 */
export function PeriodSummaryCardLargeAmountsExample() {
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      <PeriodSummaryCard
        title="Hari Ini"
        total={750000}
        count={5}
        icon={Calendar}
        color="blue"
      />

      <PeriodSummaryCard
        title="Minggu Ini"
        total={3500000}
        count={28}
        icon={CalendarDays}
        color="green"
      />

      <PeriodSummaryCard
        title="Bulan Ini"
        total={25000000}
        count={120}
        icon={CalendarRange}
        color="purple"
      />
    </div>
  )
}
