import webpush from 'web-push'
import type { NotificationType, PushSubscriptionData } from './types'
import { NOTIFICATION_TEMPLATES } from './types'

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@gama-group.co'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

/**
 * Send push notification to a subscription
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  type: NotificationType,
  data?: Record<string, unknown>
): Promise<boolean> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('VAPID keys not configured')
    return false
  }

  const template = NOTIFICATION_TEMPLATES[type]
  const payload = {
    type,
    ...template(data),
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    )
    return true
  } catch (error) {
    console.error('Failed to send push notification:', error)
    return false
  }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendPushNotificationBatch(
  subscriptions: PushSubscriptionData[],
  type: NotificationType,
  data?: Record<string, unknown>
): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, type, data))
  )

  return {
    success: results.filter((r) => r.status === 'fulfilled' && r.value).length,
    failed: results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value)).length,
  }
}
