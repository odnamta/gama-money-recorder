/**
 * Push notification types
 */

export type NotificationType =
  | 'sync_complete'
  | 'sync_failed'
  | 'approval_approved'
  | 'approval_rejected'
  | 'pending_reminder'
  | 'new_expense_pending'

export interface NotificationPayload {
  type: NotificationType
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  url?: string
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Notification message templates (Indonesian)
 */
export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  (data?: Record<string, unknown>) => Omit<NotificationPayload, 'type'>
> = {
  sync_complete: (data) => ({
    title: 'Sinkronisasi Selesai',
    body: `${data?.count || 0} pengeluaran berhasil disinkron`,
    icon: '/icons/icon-192.png',
    tag: 'sync',
    url: '/history',
  }),
  sync_failed: (data) => ({
    title: 'Sinkronisasi Gagal',
    body: `${data?.count || 0} pengeluaran gagal disinkron. Tap untuk coba lagi.`,
    icon: '/icons/icon-192.png',
    tag: 'sync-failed',
    url: '/settings',
  }),
  approval_approved: (data) => ({
    title: 'Pengeluaran Disetujui',
    body: `${data?.amount || ''} - ${data?.category || 'Pengeluaran'} telah disetujui`,
    icon: '/icons/icon-192.png',
    tag: `approval-${data?.id}`,
    url: '/history',
  }),
  approval_rejected: (data) => ({
    title: 'Pengeluaran Ditolak',
    body: `${data?.amount || ''} ditolak. Tap untuk detail.`,
    icon: '/icons/icon-192.png',
    tag: `approval-${data?.id}`,
    url: '/history',
  }),
  pending_reminder: (data) => ({
    title: 'Pengeluaran Menunggu',
    body: `${data?.count || 0} pengeluaran belum disinkron`,
    icon: '/icons/icon-192.png',
    tag: 'pending-reminder',
    url: '/settings',
  }),
  new_expense_pending: (data) => ({
    title: 'Pengeluaran Baru',
    body: `${data?.count || 1} pengeluaran baru menunggu persetujuan`,
    icon: '/icons/icon-192.png',
    tag: 'new-expense',
    url: '/approval',
  }),
}
