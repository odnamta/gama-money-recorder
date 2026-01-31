# v0.2 Expense Capture - Requirements

## Overview
Enable users to manually capture expense entries with category selection, amount input, and basic details. This is the core expense entry functionality without receipt photo or OCR.

## User Stories

### US-1: Quick Expense Entry
As a field staff member, I want to quickly enter an expense amount and category so that I can record expenses without delay.

#### Acceptance Criteria
- [ ] AC-1.1: Capture form opens from bottom nav "Catat" button
- [ ] AC-1.2: Amount input with IDR formatting (thousand separators)
- [ ] AC-1.3: Category selection with visual icons (8 categories)
- [ ] AC-1.4: Optional description field
- [ ] AC-1.5: Date picker defaulting to today
- [ ] AC-1.6: Save button creates expense draft

### US-2: Vendor Entry
As a user, I want to enter the vendor name so that I can track where I spent money.

#### Acceptance Criteria
- [ ] AC-2.1: Vendor name text input field
- [ ] AC-2.2: Auto-suggest from recent vendors
- [ ] AC-2.3: Auto-suggest from vendors table

### US-3: Expense Confirmation
As a user, I want to see confirmation when my expense is saved so that I know it was recorded.

#### Acceptance Criteria
- [ ] AC-3.1: Success toast notification after save
- [ ] AC-3.2: Option to add another expense
- [ ] AC-3.3: Option to view saved expense

### US-4: Form Validation
As a system, I want to validate expense entries so that data quality is maintained.

#### Acceptance Criteria
- [ ] AC-4.1: Amount is required and must be > 0
- [ ] AC-4.2: Category is required
- [ ] AC-4.3: Date cannot be in the future
- [ ] AC-4.4: Clear validation error messages in Indonesian

## Business Rules
- BR-1: All expenses must have amount and category
- BR-2: Expenses are saved as drafts (approval_status = 'draft')
- BR-3: Expenses are linked to the current user
- BR-4: Date defaults to current date but can be changed to past dates

## Out of Scope
- Receipt photo capture (v0.3)
- OCR auto-extraction (v0.3.1)
- Job order linking (v0.4)
- Offline support (v0.5)

## Dependencies
- v0.1 Foundation (auth, navigation)
- expense_drafts table in Supabase
