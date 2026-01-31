# v0.3 Receipt Photo - Implementation Tasks

## Prerequisites
- [ ] v0.2 Expense Capture completed
- [x] expense_receipts table created
- [x] expense-receipts storage bucket created

## Tasks

### Phase 1: Database & Storage Setup
- [x] 1.1 Create expense_receipts table migration
- [x] 1.2 Create expense-receipts storage bucket
- [x] 1.3 Set up storage RLS policies
- [x] 1.4 Add receipt_id column to expense_drafts
- [x] 1.5 Regenerate TypeScript types

### Phase 2: Image Utilities
- [x] 2.1 Create image compression utility
- [x] 2.2 Create dimension calculation helper
- [x] 2.3 Create file type validation
- [~] 2.4 Add unit tests for compression

### Phase 3: Capture Components
- [x] 3.1 Create CameraCapture component
- [x] 3.2 Create PhotoPreview component
- [x] 3.3 Create UploadProgress component
- [x] 3.4 Create ReceiptCapture container

### Phase 4: Upload Logic
- [x] 4.1 Create uploadReceipt function
- [x] 4.2 Create createReceiptRecord function
- [x] 4.3 Implement upload progress tracking
- [~] 4.4 Add retry logic for failed uploads

### Phase 5: Form Integration
- [x] 5.1 Add ReceiptCapture to expense form
- [x] 5.2 Link receipt to expense on save
- [x] 5.3 Create ReceiptWarning component
- [x] 5.4 Implement high-value warning logic

### Phase 6: Polish
- [x] 6.1 Add loading states during upload
- [~] 6.2 Handle camera permission denied
- [~] 6.3 Test on iOS and Android devices
- [~] 6.4 Optimize compression for slow devices

## Verification
- [x] Can capture photo from camera
- [x] Can select photo from gallery
- [x] Preview shows captured image
- [x] Can retake photo
- [x] Image compressed to < 1MB
- [x] Upload progress shows
- [x] Receipt linked to expense
- [x] Warning shows for > Rp 500.000
- [x] Can proceed without receipt
