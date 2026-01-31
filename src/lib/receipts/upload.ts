'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface UploadReceiptResult {
  success: boolean;
  receiptId?: string;
  storagePath?: string;
  error?: string;
}

export interface ReceiptMetadata {
  originalFileName: string;
  fileSize: number;
  contentType: string;
  width?: number;
  height?: number;
  originalFileSize?: number;
  compressionRatio?: number;
  isCompressed: boolean;
}

/**
 * Generate a unique storage path for a receipt
 */
function generateStoragePath(userId: string, fileName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  const ext = fileName.split('.').pop() || 'jpg';
  return `${userId}/${year}/${month}/receipt-${timestamp}.${ext}`;
}

/**
 * Upload a receipt image to Supabase Storage and create a record
 */
export async function uploadReceipt(
  formData: FormData
): Promise<UploadReceiptResult> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Tidak terautentikasi' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'File tidak ditemukan' };
    }

    const metadata: ReceiptMetadata = {
      originalFileName: formData.get('originalFileName') as string || file.name,
      fileSize: file.size,
      contentType: file.type,
      width: formData.get('width') ? Number(formData.get('width')) : undefined,
      height: formData.get('height') ? Number(formData.get('height')) : undefined,
      originalFileSize: formData.get('originalFileSize') ? Number(formData.get('originalFileSize')) : undefined,
      compressionRatio: formData.get('compressionRatio') ? Number(formData.get('compressionRatio')) : undefined,
      isCompressed: formData.get('isCompressed') === 'true',
    };

    const storagePath = generateStoragePath(user.id, metadata.originalFileName);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('expense-receipts')
      .upload(storagePath, file, {
        contentType: metadata.contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: 'Gagal mengunggah gambar' };
    }

    // Create receipt record
    const { data: receipt, error: insertError } = await supabase
      .from('expense_receipts')
      .insert({
        user_id: user.id,
        storage_path: storagePath,
        file_name: storagePath.split('/').pop() || 'receipt.jpg',
        original_file_name: metadata.originalFileName,
        file_size: metadata.fileSize,
        content_type: metadata.contentType,
        width: metadata.width,
        height: metadata.height,
        original_file_size: metadata.originalFileSize,
        compression_ratio: metadata.compressionRatio,
        is_compressed: metadata.isCompressed,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Receipt record error:', insertError);
      // Try to clean up uploaded file
      await supabase.storage.from('expense-receipts').remove([storagePath]);
      return { success: false, error: 'Gagal menyimpan data struk' };
    }

    revalidatePath('/capture');

    return {
      success: true,
      receiptId: receipt.id,
      storagePath,
    };
  } catch (error) {
    console.error('Upload receipt error:', error);
    return { success: false, error: 'Terjadi kesalahan saat mengunggah' };
  }
}

/**
 * Delete a receipt from storage and database
 */
export async function deleteReceipt(receiptId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Tidak terautentikasi' };
    }

    // Get receipt to find storage path
    const { data: receipt, error: fetchError } = await supabase
      .from('expense_receipts')
      .select('storage_path, user_id')
      .eq('id', receiptId)
      .single();

    if (fetchError || !receipt) {
      return { success: false, error: 'Struk tidak ditemukan' };
    }

    if (receipt.user_id !== user.id) {
      return { success: false, error: 'Tidak memiliki akses' };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('expense-receipts')
      .remove([receipt.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete record
    const { error: deleteError } = await supabase
      .from('expense_receipts')
      .delete()
      .eq('id', receiptId);

    if (deleteError) {
      return { success: false, error: 'Gagal menghapus struk' };
    }

    revalidatePath('/capture');

    return { success: true };
  } catch (error) {
    console.error('Delete receipt error:', error);
    return { success: false, error: 'Terjadi kesalahan' };
  }
}

/**
 * Get a signed URL for viewing a receipt
 */
export async function getReceiptUrl(storagePath: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.storage
      .from('expense-receipts')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
