# v0.8 Dashboard - Requirements

## Overview
Provide users with a dashboard showing expense summaries, quick actions, and recent activity.

## User Stories

### US-1: View Summary Statistics
As a user, I want to see my expense summary so that I can track my spending at a glance.

#### Acceptance Criteria
- [ ] AC-1.1: Show today's total expenses
- [ ] AC-1.2: Show this week's total
- [ ] AC-1.3: Show this month's total
- [ ] AC-1.4: Show expense count for each period
- [ ] AC-1.5: Compare with previous period (optional)

### US-2: Quick Capture
As a user, I want quick access to capture expenses so that I can record them faster.

#### Acceptance Criteria
- [ ] AC-2.1: Large capture button prominently displayed
- [ ] AC-2.2: Quick category shortcuts (fuel, toll, food)
- [ ] AC-2.3: One-tap to start capture with pre-selected category

### US-3: View Recent Expenses
As a user, I want to see my recent expenses so that I can review what I've recorded.

#### Acceptance Criteria
- [ ] AC-3.1: Show last 5 expenses
- [ ] AC-3.2: Display amount, category, date
- [ ] AC-3.3: Tap to view details
- [ ] AC-3.4: Link to full history

### US-4: View Sync Status
As a user, I want to see sync status so that I know if my data is backed up.

#### Acceptance Criteria
- [ ] AC-4.1: Show pending sync count
- [ ] AC-4.2: Show failed sync count (if any)
- [ ] AC-4.3: Quick sync button
- [ ] AC-4.4: Last sync timestamp

### US-5: Role-Specific Content
As a manager, I want to see team-relevant information so that I can monitor team expenses.

#### Acceptance Criteria
- [ ] AC-5.1: Finance managers see pending approvals count
- [ ] AC-5.2: Operations managers see team expense summary
- [ ] AC-5.3: Regular users see only their own data

## Business Rules
- BR-1: Dashboard data combines local and server data
- BR-2: Statistics update in real-time as expenses are added
- BR-3: Role-based content visibility
- BR-4: Offline mode shows local data only

## Out of Scope
- Detailed analytics/charts
- Export functionality
- Team member list
- Approval actions (v0.9)

## Dependencies
- v0.2 Expense Capture
- v0.5 Offline Support
- v0.6 History View
