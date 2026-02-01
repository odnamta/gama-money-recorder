'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { Loader2, Save, Plus, MapPin, MapPinOff } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { useExpenseForm, type ExpenseFormData } from '@/hooks/use-expense-form'
import { useOCR } from '@/hooks/use-ocr'
import { AmountInput } from '@/components/molecules/AmountInput'
import { CategorySelector } from '@/components/molecules/CategorySelector'
import { VendorInput, type VendorSuggestion } from '@/components/molecules/VendorInput'
import { DatePicker } from '@/components/molecules/DatePicker'
import { DescriptionInput } from '@/components/molecules/DescriptionInput'
import { ReceiptCapture } from '@/components/molecules/ReceiptCapture'
import { ReceiptWarning } from '@/components/molecules/ReceiptWarning'
import { OCRStatus, ConfidenceField, ManualReviewPrompt } from '@/components/ocr'
import { JobSelector } from '@/components/job'
import { useGPS } from '@/hooks/use-gps'
import { saveExpense } from '@/app/(auth)/capture/actions'
import { updateReceiptWithOCR } from '@/lib/receipts/upload'
import { requiresManualReview } from '@/types/ocr'
import type { ExpenseCategory } from '@/constants/expense-categories'

interface ExpenseCaptureFormProps {
  initialVendors?: VendorSuggestion[]
}

export function ExpenseCaptureForm({ initialVendors = [] }: ExpenseCaptureFormProps) {
  const [isPending, startTransition] = useTransition()
  const [showAddAnother, setShowAddAnother] = useState(false)
  const [vendorSuggestions] = useState<VendorSuggestion[]>(initialVendors)
  const [receiptId, setReceiptId] = useState<string | null>(null)
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)
  const [ocrFieldConfidences, setOcrFieldConfidences] = useState<{
    amount?: number
    vendor?: number
    date?: number
  }>({})
  
  // Job linking state
  const [jobOrderId, setJobOrderId] = useState<string | null>(null)
  const [isOverhead, setIsOverhead] = useState(false)

  // GPS capture hook
  const {
    position: gpsPosition,
    error: gpsError,
    isLoading: gpsLoading,
    capturePosition,
  } = useGPS()

  // Capture GPS position on form load (silently in background)
  useEffect(() => {
    capturePosition()
  }, [capturePosition])

  // OCR hook
  const {
    status: ocrStatus,
    progress: ocrProgress,
    result: ocrResult,
    error: ocrError,
    processImage,
    reset: resetOCR,
    currentProvider,
  } = useOCR({
    onSuccess: (result) => {
      // Auto-fill form fields from OCR result
      const { extractedData } = result
      
      if (extractedData.amount !== undefined) {
        setValue('amount', extractedData.amount, { shouldValidate: true })
        setOcrFieldConfidences(prev => ({ ...prev, amount: extractedData.amountConfidence }))
      }
      
      if (extractedData.vendorName) {
        setValue('vendorName', extractedData.vendorName)
        setOcrFieldConfidences(prev => ({ ...prev, vendor: extractedData.vendorNameConfidence }))
      }
      
      if (extractedData.date) {
        setValue('expenseDate', new Date(extractedData.date), { shouldValidate: true })
        setOcrFieldConfidences(prev => ({ ...prev, date: extractedData.dateConfidence }))
      }
      
      // Show review prompt if confidence is low
      if (requiresManualReview(result)) {
        setShowReviewPrompt(true)
      }
    },
    onError: (error) => {
      toast.error('Gagal membaca struk', {
        description: error.message,
      })
    },
  })

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

  const handleReceiptCaptured = useCallback(async (id: string) => {
    setReceiptId(id)
    setValue('receiptId', id)
    
    // Store OCR results in database if available
    if (ocrResult) {
      const { extractedData } = ocrResult
      await updateReceiptWithOCR(id, {
        rawText: ocrResult.rawText,
        confidence: ocrResult.confidence,
        processingTime: ocrResult.processingTime,
        provider: ocrResult.provider,
        extractedAmount: extractedData.amount,
        extractedAmountConfidence: extractedData.amountConfidence,
        extractedVendorName: extractedData.vendorName,
        extractedVendorConfidence: extractedData.vendorNameConfidence,
        extractedDate: extractedData.date,
        extractedDateConfidence: extractedData.dateConfidence,
      })
    }
  }, [setValue, ocrResult])

  const handleReceiptRemoved = () => {
    setReceiptId(null)
    setValue('receiptId', null)
    resetOCR()
    setOcrFieldConfidences({})
    setShowReviewPrompt(false)
  }

  // Handle image ready for OCR processing
  const handleImageReady = useCallback((file: File) => {
    processImage(file)
  }, [processImage])

  // Handle OCR retry
  const handleOCRRetry = useCallback(() => {
    // Re-trigger file selection
    toast.info('Pilih gambar lagi untuk mencoba OCR')
  }, [])

  // Handle skip OCR
  const handleSkipOCR = useCallback(() => {
    resetOCR()
    setOcrFieldConfidences({})
  }, [resetOCR])

  // Handle review confirmation
  const handleReviewConfirm = useCallback(() => {
    setShowReviewPrompt(false)
    toast.success('Data dikonfirmasi')
  }, [])

  // Handle review edit
  const handleReviewEdit = useCallback(() => {
    setShowReviewPrompt(false)
  }, [])

  const onSubmit = (data: ExpenseFormData) => {
    startTransition(async () => {
      const result = await saveExpense({
        ...data,
        receiptId,
        jobOrderId,
        isOverhead,
        gpsPosition: gpsPosition ?? null,
      })

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
    setReceiptId(null)
    setShowAddAnother(false)
    resetOCR()
    setOcrFieldConfidences({})
    setShowReviewPrompt(false)
    // Reset job linking state
    setJobOrderId(null)
    setIsOverhead(false)
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
      {/* Receipt Capture - Moved to top for OCR-first flow */}
      <ReceiptCapture
        onReceiptCaptured={handleReceiptCaptured}
        onReceiptRemoved={handleReceiptRemoved}
        onImageReady={handleImageReady}
        disabled={isPending}
      />

      {/* GPS Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {gpsLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-muted-foreground">Mendapatkan lokasi...</span>
          </>
        ) : gpsPosition ? (
          <>
            <MapPin className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">
              Lokasi tercatat ({gpsPosition.accuracy.toFixed(0)}m)
            </span>
          </>
        ) : gpsError ? (
          <>
            <MapPinOff className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">{gpsError}</span>
          </>
        ) : null}
      </div>

      {/* OCR Status */}
      <OCRStatus
        status={ocrStatus}
        progress={ocrProgress}
        result={ocrResult}
        error={ocrError}
        provider={currentProvider}
        onRetry={handleOCRRetry}
        onSkip={handleSkipOCR}
      />

      {/* Manual Review Prompt */}
      {showReviewPrompt && ocrResult && (
        <ManualReviewPrompt
          result={ocrResult}
          onConfirm={handleReviewConfirm}
          onEdit={handleReviewEdit}
        />
      )}

      {/* Amount Input - Most important */}
      <ConfidenceField
        confidence={ocrFieldConfidences.amount}
        isOCRFilled={ocrFieldConfidences.amount !== undefined}
      >
        <AmountInput
          value={amount ?? 0}
          onChange={(value) => setValue('amount', value, { shouldValidate: true })}
          error={errors.amount?.message}
          disabled={isPending}
          autoFocus={!receiptId} // Only autofocus if no receipt
        />
      </ConfidenceField>

      {/* Category Selector */}
      <CategorySelector
        value={category as ExpenseCategory | null}
        onChange={(value) => setValue('category', value, { shouldValidate: true })}
        error={errors.category?.message}
        disabled={isPending}
      />

      {/* Job Order Selector */}
      <JobSelector
        value={jobOrderId}
        onChange={setJobOrderId}
        isOverhead={isOverhead}
        onOverheadChange={setIsOverhead}
        disabled={isPending}
      />

      {/* Vendor Input */}
      <ConfidenceField
        confidence={ocrFieldConfidences.vendor}
        isOCRFilled={ocrFieldConfidences.vendor !== undefined}
      >
        <VendorInput
          value={vendorName ?? ''}
          onChange={handleVendorChange}
          suggestions={vendorSuggestions}
          error={errors.vendorName?.message}
          disabled={isPending}
        />
      </ConfidenceField>

      {/* Date Picker */}
      <ConfidenceField
        confidence={ocrFieldConfidences.date}
        isOCRFilled={ocrFieldConfidences.date !== undefined}
      >
        <DatePicker
          value={expenseDate ?? new Date()}
          onChange={(value) => setValue('expenseDate', value, { shouldValidate: true })}
          error={errors.expenseDate?.message}
          disabled={isPending}
        />
      </ConfidenceField>

      {/* Description Input */}
      <DescriptionInput
        value={description ?? ''}
        onChange={(value) => setValue('description', value)}
        error={errors.description?.message}
        disabled={isPending}
      />

      {/* Receipt Warning for high-value expenses */}
      <ReceiptWarning
        amount={amount ?? 0}
        hasReceipt={!!receiptId}
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
