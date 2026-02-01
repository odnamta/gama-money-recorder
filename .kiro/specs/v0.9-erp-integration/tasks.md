# v0.9 ERP Integration - Implementation Tasks

## Prerequisites
- [ ] v0.5 Offline Support completed
- [ ] v0.6 History View completed

## Tasks

### Phase 1: BKK Record Creation
- [ ] 1.1 Create BKK number generator
- [ ] 1.2 Create createBKKRecord function
- [ ] 1.3 Map expense fields to BKK fields
- [ ] 1.4 Link receipt to BKK record
- [ ] 1.5 Link job order to BKK record

### Phase 2: Submit for Approval
- [ ] 2.1 Create submitForApproval function
- [ ] 2.2 Create batchSubmitForApproval function
- [ ] 2.3 Create SubmitButton component
- [ ] 2.4 Add submit to expense detail sheet
- [ ] 2.5 Add batch submit to history page

### Phase 3: Approval Status Display
- [ ] 3.1 Enhance ApprovalStatusBadge component
- [ ] 3.2 Add approval info to expense detail
- [ ] 3.3 Show approver name and timestamp
- [ ] 3.4 Add approval status filter to history

### Phase 4: Rejection Handling
- [ ] 4.1 Create RejectionInfo component
- [ ] 4.2 Show rejection reason in detail
- [ ] 4.3 Allow editing rejected expenses
- [ ] 4.4 Enable resubmit after correction

### Phase 5: Approval Page (Finance)
- [ ] 5.1 Create approval page route
- [ ] 5.2 Add role-based access control
- [ ] 5.3 Create usePendingApprovals hook
- [ ] 5.4 Create ApprovalList component
- [ ] 5.5 Create ApprovalItem component

### Phase 6: Approval Actions
- [ ] 6.1 Create approveExpense function
- [ ] 6.2 Create rejectExpense function
- [ ] 6.3 Create ApprovalActions component
- [ ] 6.4 Create ApprovalDetailSheet
- [ ] 6.5 Add batch approve option

### Phase 7: Navigation
- [ ] 7.1 Add approval link to bottom nav (finance only)
- [ ] 7.2 Show pending count badge
- [ ] 7.3 Add approval to manager dashboard section

## Verification
- [ ] BKK records created correctly
- [ ] BKK number format correct (BKK-YYYYMM-XXXX)
- [ ] Submit changes status to pending_approval
- [ ] Approval status displays correctly
- [ ] Rejection reason shows
- [ ] Rejected expenses can be edited
- [ ] Finance can approve/reject
- [ ] Batch operations work
- [ ] Role-based access enforced
