# v0.3 Receipt Photo - Implementation Tasks

## Prerequisites
- [ ] v0.2 Expense Capture completed
- [ ] expense_receipts table created
- [ ] expense-receipts storage bucket created

## Tasks

### Phase 1: Database & Storage Setup
- [ ] 1.1 Create expense_receipts table migration
- [ ] 1.2 Create expense-receipts storage bucket
- [ ] 1.3 Set up storage RLS policies
- [ ] 1.4 Add receipt_id column to expense_drafts
- [ ] 1.5 Regenerate TypeScript types

### Phase 2: Image Utilities
- [ ] 2.1 Create image compression utility
- [ ] 2.2 Create dimension calculation helper
- [ ] 2.3 Create file type validation
- [ ] 2.4 Add unit tests for compression

### Phase 3: Capture Components
- [ ] 3.1 Create CameraCapture component
- [ ] 3.2 Create PhotoPreview component
- [ ] 3.3 Create UploadProgress component
- [ ] 3.4 Create ReceiptCapture container

### Phase 4: Upload Logic
- [ ] 4.1 Create uploadReceipt function
- [ ] 4.2 Create createReceiptRecord function
- [ ] 4.3 Implement upload progress tracking
- [ ] 4.4 Add retry logic for failed uploads

### Phase 5: Form Integration
- [ ] 5.1 Add ReceiptCapture to expense form
- [ ] 5.2 Link receipt to expense on save
- [ ] 5.3 Create ReceiptWarning component
- [ ] 5.4 Implement high-value warning logic

### Phase 6: Polish
- [ ] 6.1 Add loading states during upload
- [ ] 6.2 Handle camera permission denied
- [ ] 6.3 Test on iOS and Android devices
- [ ] 6.4 Optimize compression for slow devices

## Verification
- [ ] Can capture photo from camera
- [ ] Can select photo from gallery
- [ ] Preview shows captured image
- [ ] Can retake photo
- [ ] Image compressed to < 1MB
- [ ] Upload progress shows
- [ ] Receipt linked to expense
- [ ] Warning shows for > Rp 500.000
- [ ] Can proceed without receipt
