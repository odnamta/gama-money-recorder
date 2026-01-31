'use client'

import { useState, useTransition } from 'react'
import { Loader2, Save, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { useExpenseForm, type ExpenseFormData } from '@/hooks/use-expense-form'
import { AmountInput } from '@/components/molecules/AmountInput'
import { CategorySelector } from '@/components/molecules/CategorySelector'
import { VendorInput, type VendorSuggestion } from '@/components/molecules/VendorInput'
import { DatePicker } from '@/components/molecules/DatePicker'
import { DescriptionInput } from '@/components/molecules/DescriptionInput'
import { saveExpense } from '@/app/(auth)/capture/actions'
import type { ExpenseCategory } from '@/constants/expense-categories'

interface ExpenseCaptureFormProps {
  initialVendors?: VendorSuggestion[]
}

export function ExpenseCaptureForm({ initialVendors = [] }: ExpenseCaptureFormProps) {
  const [isPending, startTransition] = useTransition()
  const [showAddAnother, setShowAddAnother] = useState(false)
  const [vendorSuggestions] = useState<VendorSuggestion[]>(initialVendors)

  const {
    watch,
    setValue,
    handleSubmit,
    resetForm,
    formState: { errors },
  } = useExpenseForm()

  const amount = watch('amount')
  const category = watch('category')
  const vendorName = watch('vendorName')
  const expenseDate = watch('expenseDate')
  const description = watch('description')

  const onSubmit = (data: ExpenseFormData) => {
    startTransition(async () => {
      const result = await saveExpense(data)

      if (result.success) {
        toast.success('Pengeluaran tersimpan', {
          description: 'Data berhasil disimpan ke database',
        })
        setShowAddAnother(true)
      } else {
        toast.error('Gagal menyimpan', {
          description: result.error,
        })
      }
    })
  }

  const handleAddAnother = () => {
    resetForm()
    setShowAddAnother(false)
  }

  const handleVendorChange = (value: string, vendorId?: string) => {
    setValue('vendorName', value)
    setValue('vendorId', vendorId ?? null)
  }

  if (showAddAnother) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="rounded-full bg-green-100 p-4">
          <Save className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Tersimpan!</h2>
          <p className="mt-1 text-gray-600">Pengeluaran berhasil dicatat</p>
        </div>
        <button
          type="button"
          onClick={handleAddAnother}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Tambah Lagi
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount Input - Most important, at top */}
      <AmountInput
        value={amount ?? 0}
        onChange={(value) => setValue('amount', value, { shouldValidate: true })}
        error={errors.amount?.message}
        disabled={isPending}
        autoFocus
      />

      {/* Category Selector */}
      <CategorySelector
        value={category as ExpenseCategory | null}
        onChange={(value) => setValue('category', value, { shouldValidate: true })}
        error={errors.category?.message}
        disabled={isPending}
      />

      {/* Vendor Input */}
      <VendorInput
        value={vendorName ?? ''}
        onChange={handleVendorChange}
        suggestions={vendorSuggestions}
        error={errors.vendorName?.message}
        disabled={isPending}
      />

      {/* Date Picker */}
      <DatePicker
        value={expenseDate ?? new Date()}
        onChange={(value) => setValue('expenseDate', value, { shouldValidate: true })}
        error={errors.expenseDate?.message}
        disabled={isPending}
      />

      {/* Description Input */}
      <DescriptionInput
        value={description ?? ''}
        onChange={(value) => setValue('description', value)}
        error={errors.description?.message}
        disabled={isPending}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-lg py-4 text-lg font-semibold transition-colors',
          'bg-blue-600 text-white hover:bg-blue-700',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            Simpan
          </>
        )}
      </button>
    </form>
  )
}
