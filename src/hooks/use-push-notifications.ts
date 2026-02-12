'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscription,
} from '@/lib/notifications/client'

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission | 'unsupported'
  isSubscribed: boolean
  isLoading: boolean
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check support and current state on mount
  useEffect(() => {
    const checkState = async () => {
      const supported = isPushSupported()
      setIsSupported(supported)
      
      if (supported) {
        setPermission(getNotificationPermission())
        const subscription = await getPushSubscription()
        setIsSubscribed(!!subscription)
      }
      
      setIsLoading(false)
    }

    checkState()
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false
    
    setIsLoading(true)
    try {
      const subscription = await subscribeToPush()
      if (subscription) {
        setIsSubscribed(true)
        setPermission('granted')
        
        // TODO: Save subscription to server/database
        // await saveSubscriptionToServer(subscription)
        
        return true
      }
      setPermission(getNotificationPermission())
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false
    
    setIsLoading(true)
    try {
      const success = await unsubscribeFromPush()
      if (success) {
        setIsSubscribed(false)
        
        // TODO: Remove subscription from server/database
        // await removeSubscriptionFromServer()
        
        return true
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  }
}
