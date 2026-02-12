# v0.9 ERP Integration - Implementation Tasks

## Prerequisites
- [x] v0.5 Offline Support completed
- [x] v0.6 History View completed

## Tasks

### Phase 1: BKK Record Creation
- [x] 1.1 Create BKK number generator
- [x] 1.2 Create createBKKRecord function
- [x] 1.3 Map expense fields to BKK fields
- [x] 1.4 Link receipt to BKK record
- [x] 1.5 Link job order to BKK record

### Phase 2: Submit for Approval
- [x] 2.1 Create submitForApproval function
- [x] 2.2 Create batchSubmitForApproval function
- [x] 2.3 Create SubmitButton component
- [x] 2.4 Add submit to expense detail sheet
- [ ] 2.5 Add batch submit to history page

### Phase 3: Approval Status Display
- [x] 3.1 Enhance ApprovalStatusBadge component
- [x] 3.2 Add approval info to expense detail
- [x] 3.3 Show approver name and timestamp
- [x] 3.4 Add approval status filter to history

### Phase 4: Rejection Handling
- [x] 4.1 Create RejectionInfo component
- [x] 4.2 Show rejection reason in detail
- [ ] 4.3 Allow editing rejected expenses
- [x] 4.4 Enable resubmit after correction

### Phase 5: Approval Page (Finance)
- [x] 5.1 Create approval page route
- [x] 5.2 Add role-based access control
- [x] 5.3 Create usePendingApprovals hook
- [x] 5.4 Create ApprovalList component
- [x] 5.5 Create ApprovalItem component

### Phase 6: Approval Actions
- [x] 6.1 Create approveExpense function
- [x] 6.2 Create rejectExpense function
- [x] 6.3 Create ApprovalActions component
- [x] 6.4 Create ApprovalDetailSheet
- [ ] 6.5 Add batch approve option

### Phase 7: Navigation
- [x] 7.1 Add approval link to bottom nav (finance only)
- [x] 7.2 Show pending count badge
- [x] 7.3 Add approval to manager dashboard section

## Verification
- [x] BKK records created correctly
- [x] BKK number format correct (BKK-YYYYMM-XXXX)
- [x] Submit changes status to pending_approval
- [x] Approval status displays correctly
- [x] Rejection reason shows
- [ ] Rejected expenses can be edited
- [x] Finance can approve/reject
- [ ] Batch operations work
- [x] Role-based access enforced
