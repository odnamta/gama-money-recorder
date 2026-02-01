/**
 * Settings storage utilities for GAMA Money Recorder
 * Handles app settings persistence in localStorage
 */

export interface AppSettings {
  autoSync: boolean
  syncInterval: 5 | 15 | 30 | 0 // 0 = manual
  wifiOnly: boolean
  lastSyncAt: string | null
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoSync: true,
  syncInterval: 15,
  wifiOnly: false,
  lastSyncAt: null
}

const SETTINGS_KEY = 'gama-app-settings'

/**
 * Get current app settings from localStorage
 * Returns default settings if none exist or on server
 */
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return DEFAULT_SETTINGS
    
    const parsed = JSON.parse(stored)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch (error) {
    console.warn('Failed to parse settings from localStorage:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Save settings to localStorage
 * Merges with existing settings
 */
export function saveSettings(updates: Partial<AppSettings>): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getSettings()
    const updated = { ...current, ...updates }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error)
  }
}

/**
 * Clear all settings from localStorage
 */
export function clearSettings(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(SETTINGS_KEY)
  } catch (error) {
    console.error('Failed to clear settings from localStorage:', error)
  }
}

/**
 * Update last sync timestamp
 */
export function updateLastSync(): void {
  saveSettings({ lastSyncAt: new Date().toISOString() })
}