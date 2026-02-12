# Changelog

All notable changes to GAMA Money Recorder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Push notifications for sync and approval status
- Splash screen assets
- Virtual scrolling for large lists

---

## [1.0.0] - 2026-02-01

### Added
- PWA install prompt with `usePWAInstall` hook
- `InstallBanner` component with iOS instructions
- `InstallPromptSettings` component for settings page
- `InstallSection` in settings page
- `ErrorBoundary` component for crash recovery
- Indonesian error messages (`lib/errors/messages.ts`)
- `ErrorState` component for inline errors
- `EmptyState` component for empty lists
- App version display in settings (v1.0.0)
- Push notification infrastructure with VAPID keys
- `usePushNotifications` hook for subscription management
- `NotificationSection` in settings page
- Service worker push event handlers
- Notification templates for sync and approval events
- `web-push` library for server-side notifications

### Changed
- Updated manifest.ts with full PWA configuration
- Updated app icons to PNG format (192x192, 512x512)
- Updated button touch targets to 44px minimum (accessibility)
- Added active states to all button variants
- Added success button variant
- Updated app description to Indonesian
- Updated root layout with ErrorBoundary wrapper

### Fixed
- Button whitespace-nowrap typo in class

---

## [0.9.0] - 2026-02-01

### Added
- ERP Integration with BKK record creation
- BKK number generator (format: BKK-YYYYMM-XXXX)
- `submitForApproval` function with BKK record linking
- `approveExpense` and `rejectExpense` functions for finance roles
- `resubmitExpense` function for rejected expenses
- API routes for expense approval workflow:
  - `POST /api/expenses/[id]/submit`
  - `POST /api/expenses/[id]/approve`
  - `POST /api/expenses/[id]/reject`
  - `POST /api/expenses/[id]/resubmit`
- `SubmitButton` component for expense submission
- `RejectionInfo` component with resubmit action
- Enhanced `ApprovalStatusBadge` with tooltip details
- Approval page (`/approval`) for finance roles
- `ApprovalList` component with pending expenses
- `ApprovalItem` component with submitter info
- `ApprovalDetailSheet` with receipt viewer
- `ApprovalActions` component (approve/reject buttons)
- `usePendingApprovals` hook for approval page
- `usePendingCount` hook for badge display
- Pending count badge in bottom navigation
- Role-based navigation (approval link for finance roles)
- Approval status filter in history page
- BKK number display in expense detail
- Rejection reason display with resubmit option

### Changed
- Updated `ExpenseDetailSheet` with submit button and rejection info
- Updated `BottomNav` with conditional approval link
- Updated `PendingApprovals` dashboard component to link to approval page
- Added ERP fields to `DisplayExpense` type

---

## [0.8.0] - 2026-02-01

### Added
- Dashboard page with comprehensive expense overview
- `useDashboardStats` hook with period calculations (today, week, month)
- `useRecentExpenses` hook with local/server data merging
- `PeriodSummaryCard` component with compact currency display
- `SummaryCards` container with loading skeletons
- `QuickActions` component with main capture button
- Category shortcuts (BBM, Tol, Makan) for quick expense entry
- Pre-selected category navigation from shortcuts
- `RecentExpenses` component showing last 5 expenses
- Empty state for no recent expenses
- "Lihat Semua" link to history page
- `DashboardSyncStatus` component with pending/failed counts
- Quick sync button integration
- `ManagerSection` with role-based visibility
- `PendingApprovals` component for finance roles
- `TeamSummary` component for operations managers
- Dashboard header with time-based greeting (Selamat Pagi/Siang/Sore/Malam)
- Offline indicator integration
- Pull-to-refresh functionality

---

## [0.7.0] - 2026-02-01

### Added
- Settings page with comprehensive app configuration
- `ProfileSection` with user avatar and role badge
- `UserAvatar` component with initials fallback
- `RoleBadge` component for role display
- `SyncSection` with auto-sync toggle and interval selector
- WiFi-only sync option
- Last sync timestamp display
- `PendingSyncSection` with pending/failed counts
- Manual sync button integration
- Retry failed items functionality
- `StorageSection` with usage breakdown
- Storage usage calculation hook (`useStorageUsage`)
- Clear synced data button
- Clear all cache button with warning
- `AppInfoSection` with version and links
- Support and privacy policy links
- `LogoutSection` with pending data warning
- Settings storage utilities with localStorage
- `useSettings` hook for reactive settings
- Avatar and Select UI components from shadcn/ui
- Storage management utilities (`clearSyncedData`, `clearAllCache`)

## [0.6.0] - 2026-02-01

### Added
- History page with expense list view
- `useExpenses` hook with hybrid local/server data fetching
- `ExpenseListItem` component with category icons and status badges
- `FilterSheet` with date range, category, and status filters
- `DateRangeFilter` with quick filters (Hari Ini, Minggu Ini, Bulan Ini)
- `CategoryFilter` with multi-select and count display
- `StatusFilter` for sync and approval status
- `SearchInput` with debounce for vendor/description search
- `SummaryCard` with total, count, and category breakdown
- `ExpenseDetailSheet` with receipt image display
- `ApprovalStatusBadge` component
- Pull-to-refresh functionality (`usePullToRefresh` hook)
- Pagination with "Load More" button
- Sheet and Progress UI components from shadcn/ui
- `ExpenseFilters` and `DisplayExpense` types

## [0.5.0] - 2026-01-31

### Added
- Dexie.js IndexedDB integration for offline storage
- `LocalExpense` and `LocalReceipt` database tables
- Sync queue management with retry logic
- `SyncManager` for background synchronization
- `useOnlineStatus` hook for network detection
- `usePendingSync` hook for sync queue monitoring
- `OfflineIndicator` component in header
- `SyncStatusBadge` component
- `PendingSyncList` component for settings page
- `ManualSyncButton` for manual sync trigger
- `SyncNotificationProvider` for toast notifications
- Job order caching for offline access
- `JobCacheInitializer` provider
- Receipt storage utilities for IndexedDB blobs
- Auto-sync on network reconnection

## [0.4.0] - 2026-01-30

### Added
- Job order search with Supabase query
- `JobSearchDialog` with search input and results
- `JobSelector` component for expense form
- `RecentJobsList` with quick selection
- `JobCard` component for job display
- `useJob` hook for job order fetching
- `useJobSearch` hook with debounce
- `useRecentJobs` hook for recent selections
- GPS capture with `useGps` hook
- Location validation against job coordinates
- `LocationWarning` component for distance alerts
- `useJobLocation` hook for validation logic
- Geo utilities (haversine distance calculation)
- Overhead toggle for non-job expenses

## [0.3.1] - 2026-01-29

### Added
- Tesseract.js integration for client-side OCR
- Receipt text parsing with regex patterns
- Amount extraction from Indonesian receipt formats
- Vendor name extraction
- Date extraction with multiple format support
- `OCRStatus` component with processing states
- `ConfidenceBadge` component
- `ConfidenceField` wrapper for form fields
- `ManualReviewPrompt` for low confidence results
- OCR API route for server-side processing
- OCR types and interfaces

## [0.3.0] - 2026-01-28

### Added
- Camera capture with device camera API
- Gallery image selection
- Image compression (max 1MB, 1200px width)
- Image validation (type, size, dimensions)
- `ReceiptCapture` component with preview
- `ReceiptWarning` for required receipt notice
- Supabase Storage upload utilities
- Receipt upload client for browser
- Server-side upload handler

## [0.2.0] - 2026-01-27

### Added
- `ExpenseCaptureForm` organism component
- `AmountInput` with IDR formatting
- `CategorySelector` with 8 expense categories
- `VendorInput` with autocomplete suggestions
- `DatePicker` component
- `DescriptionInput` for notes
- Form validation with Zod schema
- `useExpenseForm` hook for form state
- Expense categories constant file
- Currency formatting utilities
- Date formatting utilities

## [0.1.0] - 2026-01-26

### Added
- Next.js 15 project setup with App Router
- TypeScript strict mode configuration
- PWA configuration with Serwist
- Supabase authentication integration
- Google OAuth for @gama-group.co domain
- Role-based access control setup
- Bottom navigation component
- Auth layout with protected routes
- Public layout for login
- Dashboard page placeholder
- Capture page placeholder
- History page placeholder
- Settings page placeholder
- Login page with Google sign-in
- Access denied page
- Supabase server and client utilities
- shadcn/ui component setup (button, input, label, dialog, switch, scroll-area)
- TailwindCSS configuration
- ESLint configuration

---

## Roadmap

### v0.9 - ERP Integration ✅
- [x] Create bkk_records drafts on sync
- [x] Approval status tracking
- [x] Finance approval page
- [x] Rejection handling with resubmit

### v1.0 - Polish & PWA ✅
- [x] PWA install prompt
- [x] Error boundary and messages
- [x] Accessibility improvements
- [ ] Push notifications (deferred)
- [ ] Production deployment
