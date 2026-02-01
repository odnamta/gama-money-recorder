import { DashboardContent } from './DashboardContent'

/**
 * Dashboard Page - Main landing page after login
 *
 * Shows:
 * - Greeting with user name
 * - Offline indicator (if offline)
 * - Summary cards (today, week, month)
 * - Quick actions (capture button + category shortcuts)
 * - Sync status
 * - Recent expenses
 * - Manager section (role-based)
 *
 * This is a server component that delegates to a client component
 * for interactive features.
 */
export default function DashboardPage() {
  return <DashboardContent />
}
