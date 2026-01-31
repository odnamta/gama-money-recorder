# v0.4 Job Linking - Requirements

## Overview
Enable users to link expenses to active job orders from GAMA ERP, ensuring proper cost allocation and expense tracking per shipment.

## User Stories

### US-1: Link to Job Order
As a field staff member, I want to link my expense to the job order I'm working on so that costs are properly allocated.

#### Acceptance Criteria
- [ ] AC-1.1: Job order selector on expense form
- [ ] AC-1.2: Shows list of active job orders
- [ ] AC-1.3: Search/filter job orders by number or customer
- [ ] AC-1.4: Selected job shows number and customer name
- [ ] AC-1.5: Can change linked job before saving

### US-2: Recent Jobs Quick Select
As a user, I want to quickly select from my recent job orders so that I don't have to search every time.

#### Acceptance Criteria
- [ ] AC-2.1: Shows last 5 jobs I've linked expenses to
- [ ] AC-2.2: One-tap selection from recent list
- [ ] AC-2.3: Recent jobs update after each expense

### US-3: Mark as Overhead
As a user, I want to mark an expense as overhead when it's not related to a specific job so that I can still record it.

#### Acceptance Criteria
- [ ] AC-3.1: "Overhead" toggle option
- [ ] AC-3.2: When overhead, job selection is disabled
- [ ] AC-3.3: Overhead expenses clearly marked in history

### US-4: GPS Validation
As a system, I want to validate that expenses are captured near the job location so that fraud is prevented.

#### Acceptance Criteria
- [ ] AC-4.1: Capture GPS coordinates with expense
- [ ] AC-4.2: Compare with job origin/destination
- [ ] AC-4.3: Warning if > 50km from job location
- [ ] AC-4.4: User can proceed with explanation
- [ ] AC-4.5: Distance threshold configurable

## Business Rules
- BR-1: All expenses must link to job order OR be marked as overhead
- BR-2: Only active job orders can be selected
- BR-3: GPS validation threshold: 50km (configurable)
- BR-4: GPS warning doesn't block expense, just flags it

## Out of Scope
- Creating new job orders
- Viewing job order details
- Expense budgets per job

## Dependencies
- v0.2 Expense Capture
- job_orders table (GAMA ERP)
- GPS/Geolocation API
