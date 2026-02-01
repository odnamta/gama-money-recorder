# v0.6 History View - Implementation Tasks

## Prerequisites
- [ ] v0.2 Expense Capture completed
- [ ] v0.5 Offline Support completed

## Tasks

### Phase 1: Data Layer
- [x] 1.1 Create useExpenses hook
- [x] 1.2 Implement server expense fetching
- [x] 1.3 Implement local expense fetching
- [x] 1.4 Create merge and dedupe logic
- [x] 1.5 Define ExpenseFilters interface

### Phase 2: List Components
- [x] 2.1 Create ExpenseListItem component
- [x] 2.2 Create ExpenseList container
- [x] 2.3 Add empty state component
- [x] 2.4 Add loading skeleton

### Phase 3: Filter Components
- [x] 3.1 Create FilterSheet component
- [x] 3.2 Create DateRangeFilter component
- [x] 3.3 Create CategoryFilter component
- [x] 3.4 Create StatusFilter component
- [x] 3.5 Create SearchInput component

### Phase 4: Summary
- [x] 4.1 Create SummaryCard component
- [x] 4.2 Implement category grouping
- [x] 4.3 Add progress bars for breakdown
- [x] 4.4 Make summary responsive to filters

### Phase 5: Detail View
- [x] 5.1 Create ExpenseDetailSheet component
- [x] 5.2 Display receipt image
- [x] 5.3 Show all expense fields
- [x] 5.4 Show job order details
- [x] 5.5 Show status badges

### Phase 6: Page Assembly
- [x] 6.1 Create history page layout
- [x] 6.2 Add header with search and filter
- [x] 6.3 Integrate all components
- [x] 6.4 Handle filter state

### Phase 7: Polish
- [x] 7.1 Add pull-to-refresh
- [x] 7.2 Add infinite scroll or pagination
- [x] 7.3 Optimize for large lists
- [x] 7.4 Test filter combinations

## Verification
- [ ] History shows expense list
- [ ] Most recent first
- [ ] Can filter by date range
- [ ] Quick date filters work
- [ ] Can filter by category
- [ ] Can search by vendor/description
- [ ] Summary shows correct totals
- [ ] Category breakdown accurate
- [ ] Detail sheet shows all info
- [ ] Receipt image displays
- [ ] Sync status visible
- [ ] Approval status visible
- [ ] Works with offline data
