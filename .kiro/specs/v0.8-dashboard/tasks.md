# v0.8 Dashboard - Implementation Tasks

## Prerequisites
- [ ] v0.2 Expense Capture completed
- [ ] v0.5 Offline Support completed
- [ ] v0.6 History View completed

## Tasks

### Phase 1: Data Layer
- [x] 1.1 Create useDashboardStats hook
- [x] 1.2 Implement period calculations (today, week, month)
- [x] 1.3 Create useRecentExpenses hook
- [x] 1.4 Merge local and server data for stats

### Phase 2: Summary Cards
- [x] 2.1 Create PeriodSummaryCard component
- [x] 2.2 Create SummaryCards container
- [x] 2.3 Add loading skeletons
- [x] 2.4 Format currency with compact option

### Phase 3: Quick Actions
- [x] 3.1 Create QuickActions component
- [x] 3.2 Add main capture button
- [x] 3.3 Add category shortcuts (fuel, toll, food)
- [x] 3.4 Handle navigation with pre-selected category

### Phase 4: Recent Expenses
- [x] 4.1 Create RecentExpenses component
- [x] 4.2 Show last 5 expenses
- [x] 4.3 Add empty state
- [x] 4.4 Add "View All" link to history

### Phase 5: Sync Status
- [x] 5.1 Create DashboardSyncStatus component
- [x] 5.2 Show pending count
- [x] 5.3 Show failed count
- [x] 5.4 Add quick sync button

### Phase 6: Manager Section
- [x] 6.1 Create ManagerSection component
- [x] 6.2 Add role-based visibility
- [x] 6.3 Create PendingApprovals component (finance)
- [x] 6.4 Create TeamSummary component (operations)

### Phase 7: Page Assembly
- [x] 7.1 Create dashboard page layout
- [x] 7.2 Add header with greeting
- [x] 7.3 Add offline indicator
- [x] 7.4 Integrate all components
- [x] 7.5 Add pull-to-refresh

## Verification
- [ ] Summary shows correct totals
- [ ] Period calculations are accurate
- [ ] Quick capture navigates correctly
- [ ] Category shortcuts work
- [ ] Recent expenses display correctly
- [ ] Sync status is accurate
- [ ] Manager content shows for correct roles
- [ ] Works offline with local data
