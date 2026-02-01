'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { getReceiptStorageSize } from '@/lib/db/storage-utils'

export interface StorageUsage {
  expenses: number
  receipts: number
  jobCache: number
  total: number
}

/**
 * Hook for calculating IndexedDB storage usage
 */
export function useStorageUsage() {
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const calculateUsage = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Count records
        const expenseCount = await db.expenses.count()
        const receiptCount = await db.receipts.count()
        const jobCount = await db.jobOrders.count()

        // Estimate sizes (rough approximation)
        // Average expense record: ~500 bytes
        // Average job cache: ~200 bytes
        const expenseSize = expenseCount * 500
        const jobSize = jobCount * 200

        // Get actual receipt storage size
        const receiptSize = await getReceiptStorageSize()

        const totalSize = expenseSize + receiptSize + jobSize

        setUsage({
          expenses: expenseSize,
          receipts: receiptSize,
          jobCache: jobSize,
          total: totalSize
        })
      } catch (err) {
        console.error('Failed to calculate storage usage:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setUsage(null)
      } finally {
        setIsLoading(false)
      }
    }

    calculateUsage()
  }, [])

  /**
   * Refresh storage usage calculation
   */
  const refresh = async () => {
    setIsLoading(true)
    try {
      const expenseCount = await db.expenses.count()
      const receiptCount = await db.receipts.count()
      const jobCount = await db.jobOrders.count()

      const expenseSize = expenseCount * 500
      const jobSize = jobCount * 200
      const receiptSize = await getReceiptStorageSize()

      setUsage({
        expenses: expenseSize,
        receipts: receiptSize,
        jobCache: jobSize,
        total: expenseSize + receiptSize + jobSize
      })
    } catch (err) {
      console.error('Failed to refresh storage usage:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    usage,
    isLoading,
    error,
    refresh
  }
}