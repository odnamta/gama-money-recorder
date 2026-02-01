'use client'

import { useRouter } from 'next/navigation'
import { Camera, Fuel, Route, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { ExpenseCategory } from '@/constants/expense-categories'

interface QuickCategory {
  category: ExpenseCategory
  label: string
  icon: LucideIcon
  color: string
}

const QUICK_CATEGORIES: QuickCategory[] = [
  { category: 'fuel', label: 'BBM', icon: Fuel, color: 'orange' },
  { category: 'toll', label: 'Tol', icon: Route, color: 'blue' },
  { category: 'food', label: 'Makan', icon: UtensilsCrossed, color: 'green' },
]

const COLOR_CLASSES: Record<string, { hover: string; text: string }> = {
  orange: {
    hover: 'hover:bg-orange-50',
    text: 'text-orange-600',
  },
  blue: {
    hover: 'hover:bg-blue-50',
    text: 'text-blue-600',
  },
  green: {
    hover: 'hover:bg-green-50',
    text: 'text-green-600',
  },
}

export function QuickActions() {
  const router = useRouter()

  const handleCapture = (category?: ExpenseCategory) => {
    const url = category ? `/capture?category=${category}` : '/capture'
    router.push(url)
  }

  return (
    <div className="space-y-3">
      {/* Main Capture Button */}
      <Button
        size="lg"
        className="w-full h-14 text-lg"
        onClick={() => handleCapture()}
      >
        <Camera className="h-6 w-6 mr-2" />
        Catat Pengeluaran
      </Button>

      {/* Category Shortcuts */}
      <div className="grid grid-cols-3 gap-2">
        {QUICK_CATEGORIES.map(({ category, label, icon: Icon, color }) => {
          const colors = COLOR_CLASSES[color]
          
          return (
            <Button
              key={category}
              variant="outline"
              className={cn(
                'flex-col h-16 gap-1',
                colors.hover
              )}
              onClick={() => handleCapture(category)}
            >
              <Icon className={cn('h-5 w-5', colors.text)} />
              <span className="text-xs">{label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
