'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  Building2,
  User,
  Fuel,
  Route,
  ParkingCircle,
  UtensilsCrossed,
  Bed,
  Car,
  Package,
  MoreHorizontal,
  ImageIcon,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ApprovalActions } from './ApprovalActions'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
import { EXPENSE_CATEGORIES } from '@/constants/expense-categories'
import { createClient } from '@/lib/supabase/client'
import type { DisplayExpense } from '@/types/expense-filters'

/**
 * Icon mapping for expense categories
 */
const CATEGORY_ICONS = {
  fuel: Fuel,
  toll: Route,
  parking: ParkingCircle,
  food: UtensilsCrossed,
  lodging: Bed,
  transport: Car,
  supplies: Package,
  other: MoreHorizontal,
} as const

/**
 * Color classes for category badges
 */
const CATEGORY_COLORS = {
  fuel: 'bg-orange-100 text-orange-700 border-orange-200',
  toll: 'bg-blue-100 text-blue-700 border-blue-200',
  parking: 'bg-purple-100 text-purple-700 border-purple-200',
  food: 'bg-green-100 text-green-700 border-green-200',
  lodging: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  transport: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  supplies: 'bg-amber-100 text-amber-700 border-amber-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
} as const

interface DetailRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <div className="text-sm text-slate-900">{value}</div>
      </div>
    </div>
  )
}

interface PendingExpense extends DisplayExpense {
  submitterName?: string
  submitterEmail?: string
}

interface ApprovalDetailSheetProps {
  expense: PendingExpense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction?: () => void
  onError?: (error: string) => void
}

/**
 * ApprovalDetailSheet - Full detail view for expense approval
 */
export function ApprovalDetailSheet({
  expense,
  open,
  onOpenChange,
  onAction,
  onError,
}: ApprovalDetailSheetProps) {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false)

  // Load receipt image
  useEffect(() => {
    async function loadReceipt() {
      if (!expense?.receipt?.storage_path) {
        setReceiptUrl(null)
        return
      }

      setIsLoadingReceipt(true)
      try {
        const supabase = createClient()
        const { data } = supabase.storage
          .from('expense-receipts')
          .getPublicUrl(expense.receipt.storage_path)

        if (data?.publicUrl) {
          setReceiptUrl(data.publicUrl)
        }
      } catch (error) {
        console.error('Failed to load receipt:', error)
      } finally {
        setIsLoadingReceipt(false)
      }
    }

    loadReceipt()
  }, [expense?.receipt?.storage_path])

  if (!expense) return null

  const categoryConfig = EXPENSE_CATEGORIES[expense.category]
  const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal
  const categoryColors = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl" showCloseButton={false}>
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Detail Persetujuan</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-slate-500"
            >
              Tutup
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <div className="space-y-6 px-1">
            {/* Amount & Category Header */}
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-slate-900 mb-3">
                {formatCurrency(expense.amount)}
              </p>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
                  categoryColors
                )}
              >
                <Icon className="h-4 w-4" />
                {categoryConfig?.labelFull || expense.category}
              </span>
              {expense.bkkNumber && (
                <p className="mt-2 text-sm font-mono text-slate-500">
                  {expense.bkkNumber}
                </p>
              )}
            </div>

            {/* Submitter Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {expense.submitterName || 'Unknown'}
                  </p>
                  {expense.submitterEmail && (
                    <p className="text-sm text-slate-500">{expense.submitterEmail}</p>
                  )}
                  {expense.submittedAt && (
                    <p className="text-xs text-slate-400 mt-1">
                      Diajukan {formatDate(expense.submittedAt, 'relative')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Receipt Image */}
            {expense.receipt?.storage_path && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                {isLoadingReceipt ? (
                  <div className="aspect-[4/3] flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">Memuat gambar...</p>
                    </div>
                  </div>
                ) : receiptUrl ? (
                  <img
                    src={receiptUrl}
                    alt="Struk"
                    className="w-full object-contain max-h-[300px]"
                  />
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Gambar tidak tersedia</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-xl border border-slate-100 px-4">
              <DetailRow
                icon={<Calendar className="h-4 w-4" />}
                label="Tanggal"
                value={formatDate(expense.expenseDate, 'long')}
              />

              {expense.vendorName && (
                <DetailRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="Vendor"
                  value={expense.vendorName}
                />
              )}

              {expense.description && (
                <DetailRow
                  icon={<FileText className="h-4 w-4" />}
                  label="Catatan"
                  value={expense.description}
                />
              )}

              {expense.jobOrder ? (
                <DetailRow
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Job Order"
                  value={
                    <span>
                      <span className="font-medium">{expense.jobOrder.job_number}</span>
                      <span className="text-slate-500 ml-2">
                        {expense.jobOrder.customer_name}
                      </span>
                    </span>
                  }
                />
              ) : expense.isOverhead ? (
                <DetailRow
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Job Order"
                  value={<span className="text-slate-500">Overhead</span>}
                />
              ) : null}

              {expense.gpsLatitude && expense.gpsLongitude && (
                <DetailRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Lokasi"
                  value={
                    <span className="text-slate-500 text-xs">
                      {expense.gpsLatitude.toFixed(6)}, {expense.gpsLongitude.toFixed(6)}
                    </span>
                  }
                />
              )}
            </div>

            {/* Approval Actions */}
            <div className="pt-4">
              <ApprovalActions
                expenseId={expense.id}
                onAction={onAction}
                onError={onError}
              />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
