# v0.6 History View - Implementation Tasks

## Prerequisites
- [ ] v0.2 Expense Capture completed
- [ ] v0.5 Offline Support completed

## Tasks

### Phase 1: Data Layer
- [ ] 1.1 Create useExpenses hook
- [ ] 1.2 Implement server expense fetching
- [ ] 1.3 Implement local expense fetching
- [ ] 1.4 Create merge and dedupe logic
- [ ] 1.5 Define ExpenseFilters interface

### Phase 2: List Components
- [ ] 2.1 Create ExpenseListItem component
- [ ] 2.2 Create ExpenseList container
- [ ] 2.3 Add empty state component
- [ ] 2.4 Add loading skeleton

### Phase 3: Filter Components
- [ ] 3.1 Create FilterSheet component
- [ ] 3.2 Create DateRangeFilter component
- [ ] 3.3 Create CategoryFilter component
- [ ] 3.4 Create StatusFilter component
- [ ] 3.5 Create SearchInput component

### Phase 4: Summary
- [ ] 4.1 Create SummaryCard component
- [ ] 4.2 Implement category grouping
- [ ] 4.3 Add progress bars for breakdown
- [ ] 4.4 Make summary responsive to filters

### Phase 5: Detail View
- [ ] 5.1 Create ExpenseDetailSheet component
- [ ] 5.2 Display receipt image
- [ ] 5.3 Show all expense fields
- [ ] 5.4 Show job order details
- [ ] 5.5 Show status badges

### Phase 6: Page Assembly
- [ ] 6.1 Create history page layout
- [ ] 6.2 Add header with search and filter
- [ ] 6.3 Integrate all components
- [ ] 6.4 Handle filter state

### Phase 7: Polish
- [ ] 7.1 Add pull-to-refresh
- [ ] 7.2 Add infinite scroll or pagination
- [ ] 7.3 Optimize for large lists
- [ ] 7.4 Test filter combinations

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
