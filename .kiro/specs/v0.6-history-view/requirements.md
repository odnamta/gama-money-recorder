# v0.6 History View - Requirements

## Overview
Provide users with a view of their expense history, including filtering, search, and status tracking.

## User Stories

### US-1: View Expense History
As a user, I want to see a list of my past expenses so that I can review what I've recorded.

#### Acceptance Criteria
- [ ] AC-1.1: History page shows expense list
- [ ] AC-1.2: Most recent expenses first
- [ ] AC-1.3: Shows amount, category, date, vendor
- [ ] AC-1.4: Shows sync status indicator
- [ ] AC-1.5: Shows approval status

### US-2: Filter by Date Range
As a user, I want to filter expenses by date range so that I can find expenses from a specific period.

#### Acceptance Criteria
- [ ] AC-2.1: Date range picker (from/to)
- [ ] AC-2.2: Quick filters: Today, This Week, This Month
- [ ] AC-2.3: Filter applies immediately
- [ ] AC-2.4: Clear filter option

### US-3: Filter by Category
As a user, I want to filter expenses by category so that I can see specific types of expenses.

#### Acceptance Criteria
- [ ] AC-3.1: Category filter dropdown
- [ ] AC-3.2: Multi-select categories
- [ ] AC-3.3: Shows count per category
- [ ] AC-3.4: Clear filter option

### US-4: Search Expenses
As a user, I want to search expenses by vendor or description so that I can find specific expenses.

#### Acceptance Criteria
- [ ] AC-4.1: Search input field
- [ ] AC-4.2: Searches vendor name and description
- [ ] AC-4.3: Results update as typing
- [ ] AC-4.4: Highlights matching text

### US-5: View Expense Details
As a user, I want to view full details of an expense so that I can see all information including receipt.

#### Acceptance Criteria
- [ ] AC-5.1: Tap expense to open details
- [ ] AC-5.2: Shows all expense fields
- [ ] AC-5.3: Shows receipt image if attached
- [ ] AC-5.4: Shows linked job order
- [ ] AC-5.5: Shows approval status and history

### US-6: Summary Statistics
As a user, I want to see summary statistics so that I can understand my spending patterns.

#### Acceptance Criteria
- [ ] AC-6.1: Total amount for filtered period
- [ ] AC-6.2: Count of expenses
- [ ] AC-6.3: Breakdown by category (chart)
- [ ] AC-6.4: Updates with filters

## Business Rules
- BR-1: Users can only see their own expenses (unless manager role)
- BR-2: Managers can see team expenses
- BR-3: History includes both synced and pending expenses
- BR-4: Deleted expenses are hidden (soft delete)

## Out of Scope
- Editing past expenses
- Deleting expenses
- Exporting data
- Detailed analytics

## Dependencies
- v0.2 Expense Capture
- v0.5 Offline Support (for local data)
