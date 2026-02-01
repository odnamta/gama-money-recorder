'use client'

import { useState, useEffect } from 'react'
import { AppSettings, DEFAULT_SETTINGS, getSettings, saveSettings } from '@/lib/settings/storage'

/**
 * Hook for managing app settings
 * Provides reactive settings state with localStorage persistence
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const currentSettings = getSettings()
        setSettings(currentSettings)
      } catch (error) {
        console.error('Failed to load settings:', error)
        setSettings(DEFAULT_SETTINGS)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  /**
   * Update settings and persist to localStorage
   */
  const updateSettings = (updates: Partial<AppSettings>) => {
    try {
      // Save to localStorage
      saveSettings(updates)
      
      // Update state
      setSettings(prev => ({ ...prev, ...updates }))
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  /**
   * Reset settings to defaults
   */
  const resetSettings = () => {
    try {
      saveSettings(DEFAULT_SETTINGS)
      setSettings(DEFAULT_SETTINGS)
    } catch (error) {
      console.error('Failed to reset settings:', error)
    }
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading
  }
}