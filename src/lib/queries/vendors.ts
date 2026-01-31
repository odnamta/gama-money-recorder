import { createClient } from '@/lib/supabase/server'

export interface VendorSuggestion {
  id?: string
  name: string
}

/**
 * Get user's recently used vendors (last 10 unique)
 */
export async function getRecentVendors(userId: string): Promise<VendorSuggestion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expense_drafts')
    .select('vendor_name, vendor_id')
    .eq('user_id', userId)
    .not('vendor_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch recent vendors:', error)
    return []
  }

  // Deduplicate by vendor_name and take first 10
  const seen = new Set<string>()
  const unique: VendorSuggestion[] = []

  for (const item of data) {
    if (item.vendor_name && !seen.has(item.vendor_name.toLowerCase())) {
      seen.add(item.vendor_name.toLowerCase())
      unique.push({
        id: item.vendor_id ?? undefined,
        name: item.vendor_name,
      })
      if (unique.length >= 10) break
    }
  }

  return unique
}

/**
 * Search vendors table by name
 */
export async function searchVendors(
  searchTerm: string,
  limit = 5
): Promise<VendorSuggestion[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vendors')
    .select('id, name')
    .ilike('name', `%${searchTerm}%`)
    .limit(limit)

  if (error) {
    console.error('Failed to search vendors:', error)
    return []
  }

  return data.map((v) => ({
    id: v.id,
    name: v.name,
  }))
}
