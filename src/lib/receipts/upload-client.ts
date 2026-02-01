/**
 * Client-side receipt upload utilities for offline sync
 *
 * This module provides client-side functions for uploading receipts
 * to Supabase Storage, used by the SyncManager for background sync.
 *
 * Note: For server-side uploads (e.g., from server actions), use
 * the functions in upload.ts instead.
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Result of a client-side receipt upload
 */
export interface ClientUploadResult {
  storagePath: string
}

/**
 * Generate a unique storage path for a receipt
 *
 * Path format: {userId}/{year}/{month}/receipt-{timestamp}.{ext}
 * Example: abc123/2024/01/receipt-1704067200000.jpg
 *
 * @param userId - The user's ID
 * @param filename - Original filename to extract extension from
 * @returns Generated storage path
 */
function generateStoragePath(userId: string, filename: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const timestamp = Date.now()
  const ext = filename.split('.').pop() || 'jpg'
  return `${userId}/${year}/${month}/receipt-${timestamp}.${ext}`
}

/**
 * Upload a receipt image to Supabase Storage (client-side)
 *
 * This function is designed for use in the browser, specifically
 * for the SyncManager to upload receipts during background sync.
 *
 * @param file - The image file to upload
 * @param userId - The authenticated user's ID
 * @returns Promise resolving to the storage path
 * @throws Error if upload fails
 *
 * @example
 * ```typescript
 * const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' })
 * const { storagePath } = await uploadReceiptClient(file, userId)
 * ```
 */
export async function uploadReceiptClient(
  file: File,
  userId: string
): Promise<ClientUploadResult> {
  const supabase = createClient()

  const storagePath = generateStoragePath(userId, file.name)

  const { error } = await supabase.storage
    .from('expense-receipts')
    .upload(storagePath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload receipt: ${error.message}`)
  }

  return { storagePath }
}
