/**
 * Job Order Cache Functions
 *
 * Provides functions to cache and retrieve job orders for offline use.
 * Jobs are cached in IndexedDB and refreshed when online.
 */

import { db, type CachedJobOrder } from './index'
import { createClient } from '@/lib/supabase/client'
import type { JobOrder } from '@/types/supabase'

/**
 * Cache job orders to IndexedDB
 *
 * Saves job orders with a cachedAt timestamp for tracking freshness.
 * Uses bulkPut to upsert records (update if exists, insert if new).
 *
 * @param jobs - Array of job orders from Supabase
 */
export async function cacheJobOrders(jobs: JobOrder[]): Promise<void> {
  const cached: CachedJobOrder[] = jobs.map((job) => ({
    id: job.id,
    jobNumber: job.job_number,
    customerName: job.customer_name,
    origin: job.origin,
    destination: job.destination,
    // Note: GPS coordinates would be added here if available in job_orders table
    cachedAt: new Date().toISOString(),
  }))

  await db.jobOrders.bulkPut(cached)
}

/**
 * Get all cached job orders
 *
 * Retrieves all job orders from IndexedDB cache.
 *
 * @returns Array of cached job orders
 */
export async function getCachedJobOrders(): Promise<CachedJobOrder[]> {
  return db.jobOrders.toArray()
}

/**
 * Get a single cached job order by ID
 *
 * @param jobId - The job order ID to retrieve
 * @returns The cached job order or undefined if not found
 */
export async function getCachedJobById(
  jobId: string
): Promise<CachedJobOrder | undefined> {
  return db.jobOrders.get(jobId)
}

/**
 * Search cached job orders by job number or customer name
 *
 * Performs a case-insensitive search on job number and customer name fields.
 *
 * @param query - Search query string
 * @returns Array of matching cached job orders
 */
export async function searchCachedJobs(
  query: string
): Promise<CachedJobOrder[]> {
  if (!query.trim()) {
    return getCachedJobOrders()
  }

  const normalizedQuery = query.toLowerCase().trim()

  // Get all jobs and filter in memory (Dexie doesn't support LIKE queries)
  const allJobs = await db.jobOrders.toArray()

  return allJobs.filter(
    (job) =>
      job.jobNumber.toLowerCase().includes(normalizedQuery) ||
      job.customerName.toLowerCase().includes(normalizedQuery)
  )
}

/**
 * Refresh job cache from Supabase
 *
 * Fetches active job orders from Supabase and caches them locally.
 * Only runs when online and user is authenticated.
 *
 * @returns True if cache was refreshed, false otherwise
 */
export async function refreshJobCache(): Promise<boolean> {
  // Check if online
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false
  }

  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return false
  }

  // Fetch active jobs from Supabase
  const { data: jobs, error } = await supabase
    .from('job_orders')
    .select('*')
    .eq('status', 'active')
    .limit(100)

  if (error) {
    console.error('Failed to fetch job orders:', error)
    return false
  }

  if (jobs && jobs.length > 0) {
    await cacheJobOrders(jobs)
    return true
  }

  return false
}

/**
 * Clear all cached job orders
 *
 * Removes all job orders from the local cache.
 * Useful for logout or cache invalidation.
 */
export async function clearJobCache(): Promise<void> {
  await db.jobOrders.clear()
}

/**
 * Get the count of cached job orders
 *
 * @returns Number of cached job orders
 */
export async function getCachedJobCount(): Promise<number> {
  return db.jobOrders.count()
}

/**
 * Check if job cache is stale
 *
 * Cache is considered stale if the oldest cached job is older than the threshold.
 *
 * @param maxAgeMs - Maximum age in milliseconds (default: 24 hours)
 * @returns True if cache is stale or empty
 */
export async function isJobCacheStale(
  maxAgeMs: number = 24 * 60 * 60 * 1000
): Promise<boolean> {
  const jobs = await db.jobOrders.orderBy('cachedAt').first()

  if (!jobs) {
    return true // Empty cache is considered stale
  }

  const cachedTime = new Date(jobs.cachedAt).getTime()
  const now = Date.now()

  return now - cachedTime > maxAgeMs
}
