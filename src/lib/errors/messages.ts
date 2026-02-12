/**
 * Indonesian error messages for user-facing errors
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  network_error: 'Tidak dapat terhubung ke server. Periksa koneksi internet.',
  timeout: 'Koneksi timeout. Silakan coba lagi.',
  offline: 'Anda sedang offline. Data akan disinkron saat online.',
  
  // Auth errors
  auth_expired: 'Sesi telah berakhir. Silakan login kembali.',
  unauthorized: 'Anda tidak memiliki akses untuk melakukan ini.',
  forbidden: 'Akses ditolak.',
  
  // Sync errors
  sync_failed: 'Gagal menyinkron data. Akan dicoba lagi nanti.',
  sync_conflict: 'Terjadi konflik data. Silakan refresh halaman.',
  upload_failed: 'Gagal mengunggah struk. Silakan coba lagi.',
  
  // Validation errors
  required_field: 'Field ini wajib diisi.',
  invalid_amount: 'Jumlah tidak valid.',
  min_amount: 'Jumlah terlalu kecil.',
  max_amount: 'Jumlah terlalu besar.',
  receipt_required: 'Struk wajib dilampirkan untuk pengeluaran > Rp 500.000.',
  job_required: 'Pilih job order atau tandai sebagai overhead.',
  invalid_date: 'Tanggal tidak valid.',
  future_date: 'Tanggal tidak boleh di masa depan.',
  category_required: 'Pilih kategori pengeluaran.',
  
  // File errors
  file_too_large: 'Ukuran file terlalu besar. Maksimal 5MB.',
  invalid_file_type: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.',
  
  // OCR errors
  ocr_failed: 'Gagal membaca struk. Silakan input manual.',
  ocr_low_confidence: 'Hasil OCR kurang akurat. Silakan periksa data.',
  
  // Approval errors
  already_approved: 'Pengeluaran sudah disetujui.',
  already_rejected: 'Pengeluaran sudah ditolak.',
  cannot_approve_own: 'Tidak dapat menyetujui pengeluaran sendiri.',
  rejection_reason_required: 'Alasan penolakan wajib diisi.',
  
  // Generic errors
  unknown: 'Terjadi kesalahan. Silakan coba lagi.',
  not_found: 'Data tidak ditemukan.',
  server_error: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.unknown
}

/**
 * Get error message from Error object
 */
export function getErrorFromException(error: unknown): string {
  if (error instanceof Error) {
    // Check for known error codes in message
    const code = Object.keys(ERROR_MESSAGES).find(key => 
      error.message.toLowerCase().includes(key.replace('_', ' '))
    )
    if (code) return ERROR_MESSAGES[code]
    
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ERROR_MESSAGES.network_error
    }
    
    // Check for timeout
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.timeout
    }
  }
  
  return ERROR_MESSAGES.unknown
}
