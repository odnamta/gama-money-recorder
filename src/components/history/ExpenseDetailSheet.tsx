'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  Building2,
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
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge'
import { ApprovalStatusBadge } from './ApprovalStatusBadge'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
import { EXPENSE_CATEGORIES } from '@/constants/expense-categories'
import { getLocalReceipt, createReceiptImageUrl } from '@/lib/db/operations'
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

/**
 * DetailRow - A single row in the detail view
 */
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

interface ExpenseDetailSheetProps {
  /** The expense to display */
  expense: DisplayExpense | null
  /** Whether the sheet is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
}

/**
 * ExpenseDetailSheet - Full detail view for an expense
 *
 * Displays:
 * - Amount and category
 * - Receipt image (from local storage or server)
 * - All expense fields
 * - Job order details
 * - Sync and approval status
 */
export function ExpenseDetailSheet({
  expense,
  open,
  onOpenChange,
}: ExpenseDetailSheetProps) {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false)

  // Load receipt image when expense changes
  useEffect(() => {
    let objectUrl: string | null = null
    const receiptLocalId = expense?.receiptLocalId
    const receiptStoragePath = expense?.receipt?.storage_path

    async function loadReceipt() {
      if (!expense) {
        setReceiptUrl(null)
        return
      }

      setIsLoadingReceipt(true)

      try {
        // Try to load from local storage first
        if (receiptLocalId) {
          const localReceipt = await getLocalReceipt(receiptLocalId)
          if (localReceipt) {
            objectUrl = createReceiptImageUrl(localReceipt)
            setReceiptUrl(objectUrl)
            setIsLoadingReceipt(false)
            return
          }
        }

        // Fall back to server storage
        if (receiptStoragePath) {
          const supabase = createClient()
          const { data } = supabase.storage
            .from('expense-receipts')
            .getPublicUrl(receiptStoragePath)

          if (data?.publicUrl) {
            setReceiptUrl(data.publicUrl)
          }
        }
      } catch (error) {
        console.error('Failed to load receipt:', error)
      } finally {
        setIsLoadingReceipt(false)
      }
    }

    loadReceipt()

    // Cleanup object URL on unmount or expense change
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [expense, expense?.id, expense?.receiptLocalId, expense?.receipt?.storage_path])

  if (!expense) return null

  const categoryConfig = EXPENSE_CATEGORIES[expense.category]
  const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal
  const categoryColors = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other

  const hasReceipt = expense.receiptLocalId || expense.receipt?.storage_path

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl" showCloseButton={false}>
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Detail Pengeluaran</SheetTitle>
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
            </div>

            {/* Receipt Image */}
            {hasReceipt && (
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
              {/* Date */}
              <DetailRow
                icon={<Calendar className="h-4 w-4" />}
                label="Tanggal"
                value={
                  <span>
                    {formatDate(expense.expenseDate, 'long')}
                    {expense.expenseTime && (
                      <span className="text-slate-500 ml-2">
                        {expense.expenseTime}
                      </span>
                    )}
                  </span>
                }
              />

              {/* Vendor */}
              {expense.vendorName && (
                <DetailRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="Vendor"
                  value={expense.vendorName}
                />
              )}

              {/* Description */}
              {expense.description && (
                <DetailRow
                  icon={<FileText className="h-4 w-4" />}
                  label="Catatan"
                  value={expense.description}
                />
              )}

              {/* Job Order */}
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
                  value={<span className="text-slate-500">Overhead (tidak terkait job)</span>}
                />
              ) : null}

              {/* GPS Location */}
              {expense.gpsLatitude && expense.gpsLongitude && (
                <DetailRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Lokasi"
                  value={
                    <span className="text-slate-500 text-xs">
                      {expense.gpsLatitude.toFixed(6)}, {expense.gpsLongitude.toFixed(6)}
                      {expense.gpsAccuracy && (
                        <span className="ml-2">(±{Math.round(expense.gpsAccuracy)}m)</span>
                      )}
                    </span>
                  }
                />
              )}
            </div>

            {/* Status Section */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Status</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Sinkronisasi</span>
                <SyncStatusBadge status={expense.syncStatus} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Persetujuan</span>
                <ApprovalStatusBadge status={expense.approvalStatus} showLabel />
              </div>

              {expense.ocrConfidence !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Akurasi OCR</span>
                  <span className="text-sm text-slate-900">
                    {Math.round(expense.ocrConfidence * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="text-xs text-slate-400 text-center space-y-1">
              <p>Dibuat: {formatDate(expense.createdAt, 'medium')}</p>
              {expense.source === 'local' && (
                <p className="text-amber-600">Data lokal (belum tersinkron)</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
