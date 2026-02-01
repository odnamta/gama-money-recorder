# v0.8 Dashboard - Implementation Tasks

## Prerequisites
- [ ] v0.2 Expense Capture completed
- [ ] v0.5 Offline Support completed
- [ ] v0.6 History View completed

## Tasks

### Phase 1: Data Layer
- [ ] 1.1 Create useDashboardStats hook
- [ ] 1.2 Implement period calculations (today, week, month)
- [ ] 1.3 Create useRecentExpenses hook
- [ ] 1.4 Merge local and server data for stats

### Phase 2: Summary Cards
- [ ] 2.1 Create PeriodSummaryCard component
- [ ] 2.2 Create SummaryCards container
- [ ] 2.3 Add loading skeletons
- [ ] 2.4 Format currency with compact option

### Phase 3: Quick Actions
- [ ] 3.1 Create QuickActions component
- [ ] 3.2 Add main capture button
- [ ] 3.3 Add category shortcuts (fuel, toll, food)
- [ ] 3.4 Handle navigation with pre-selected category

### Phase 4: Recent Expenses
- [ ] 4.1 Create RecentExpenses component
- [ ] 4.2 Show last 5 expenses
- [ ] 4.3 Add empty state
- [ ] 4.4 Add "View All" link to history

### Phase 5: Sync Status
- [ ] 5.1 Create DashboardSyncStatus component
- [ ] 5.2 Show pending count
- [ ] 5.3 Show failed count
- [ ] 5.4 Add quick sync button

### Phase 6: Manager Section
- [ ] 6.1 Create ManagerSection component
- [ ] 6.2 Add role-based visibility
- [ ] 6.3 Create PendingApprovals component (finance)
- [ ] 6.4 Create TeamSummary component (operations)

### Phase 7: Page Assembly
- [ ] 7.1 Create dashboard page layout
- [ ] 7.2 Add header with greeting
- [ ] 7.3 Add offline indicator
- [ ] 7.4 Integrate all components
- [ ] 7.5 Add pull-to-refresh

## Verification
- [ ] Summary shows correct totals
- [ ] Period calculations are accurate
- [ ] Quick capture navigates correctly
- [ ] Category shortcuts work
- [ ] Recent expenses display correctly
- [ ] Sync status is accurate
- [ ] Manager content shows for correct roles
- [ ] Works offline with local data
