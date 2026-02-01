# v0.9 ERP Integration - Requirements

## Overview
Integrate expense drafts with GAMA ERP by creating bkk_records and implementing approval workflow.

## User Stories

### US-1: Create BKK Records
As a user, I want my synced expenses to create BKK drafts so that finance can process them.

#### Acceptance Criteria
- [ ] AC-1.1: Synced expenses create bkk_records entry
- [ ] AC-1.2: BKK number auto-generated (BKK-YYYYMM-XXXX)
- [ ] AC-1.3: All expense fields mapped to BKK fields
- [ ] AC-1.4: Receipt linked to BKK record
- [ ] AC-1.5: Job order linked if applicable

### US-2: Submit for Approval
As a user, I want to submit expenses for approval so that they can be processed.

#### Acceptance Criteria
- [ ] AC-2.1: Submit button on expense detail
- [ ] AC-2.2: Batch submit option for multiple expenses
- [ ] AC-2.3: Status changes to "pending_approval"
- [ ] AC-2.4: Notification sent to finance (optional)

### US-3: Track Approval Status
As a user, I want to see approval status so that I know if my expenses are approved.

#### Acceptance Criteria
- [ ] AC-3.1: Show approval status on expense list
- [ ] AC-3.2: Show approval status on expense detail
- [ ] AC-3.3: Filter by approval status
- [ ] AC-3.4: Show approver name and timestamp

### US-4: Handle Rejections
As a user, I want to see rejection reasons so that I can correct and resubmit.

#### Acceptance Criteria
- [ ] AC-4.1: Show rejection reason on expense detail
- [ ] AC-4.2: Allow editing rejected expenses
- [ ] AC-4.3: Resubmit after correction
- [ ] AC-4.4: Track rejection history

### US-5: Approve Expenses (Finance)
As a finance manager, I want to approve expenses so that they can be processed for payment.

#### Acceptance Criteria
- [ ] AC-5.1: View pending approvals list
- [ ] AC-5.2: View expense details with receipt
- [ ] AC-5.3: Approve with one tap
- [ ] AC-5.4: Reject with reason
- [ ] AC-5.5: Batch approve option

## Business Rules
- BR-1: Only synced expenses can be submitted for approval
- BR-2: Only finance_manager, owner, director can approve
- BR-3: BKK number format: BKK-YYYYMM-XXXX (auto-increment)
- BR-4: Rejected expenses can be edited and resubmitted
- BR-5: Approved expenses cannot be edited

## Out of Scope
- Payment processing
- Reimbursement tracking
- Detailed audit trail
- Email notifications

## Dependencies
- v0.5 Offline Support
- v0.6 History View
- GAMA ERP bkk_records table
