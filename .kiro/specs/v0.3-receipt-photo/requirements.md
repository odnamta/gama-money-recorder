# v0.3 Receipt Photo - Requirements

## Overview
Enable users to capture receipt photos using their device camera, with image compression and upload to Supabase Storage.

## User Stories

### US-1: Receipt Photo Capture
As a field staff member, I want to take a photo of my receipt so that I have proof of the expense.

#### Acceptance Criteria
- [ ] AC-1.1: Camera button on expense capture form
- [ ] AC-1.2: Opens device camera in capture mode
- [ ] AC-1.3: Shows preview of captured photo
- [ ] AC-1.4: Option to retake photo
- [ ] AC-1.5: Option to accept and continue

### US-2: Photo from Gallery
As a user, I want to select an existing photo from my gallery so that I can use a previously taken receipt photo.

#### Acceptance Criteria
- [ ] AC-2.1: Gallery option alongside camera
- [ ] AC-2.2: Opens device photo picker
- [ ] AC-2.3: Shows preview of selected photo
- [ ] AC-2.4: Same retake/accept flow as camera

### US-3: Image Optimization
As a system, I want to compress receipt images so that storage and bandwidth are optimized.

#### Acceptance Criteria
- [ ] AC-3.1: Images compressed to max 1MB
- [ ] AC-3.2: Max dimension 1200px (longest side)
- [ ] AC-3.3: JPEG format with 80% quality
- [ ] AC-3.4: Original aspect ratio preserved

### US-4: Receipt Upload
As a system, I want to upload receipt images to secure storage so that they are preserved.

#### Acceptance Criteria
- [ ] AC-4.1: Upload to expense-receipts bucket
- [ ] AC-4.2: Path includes user ID and date
- [ ] AC-4.3: Upload progress indicator
- [ ] AC-4.4: Retry on failure

### US-5: Receipt Requirement
As a system, I want to require receipts for high-value expenses so that compliance is maintained.

#### Acceptance Criteria
- [ ] AC-5.1: Warning for expenses > Rp 500.000 without receipt
- [ ] AC-5.2: User can proceed without receipt (with acknowledgment)
- [ ] AC-5.3: Expense flagged as "no receipt" in database

## Business Rules
- BR-1: Expenses > Rp 500.000 should have receipt (soft requirement)
- BR-2: Images must be compressed before upload
- BR-3: Only JPEG, PNG, WebP formats accepted
- BR-4: Max file size after compression: 1MB

## Out of Scope
- OCR processing (v0.3.1)
- Multiple receipts per expense
- Receipt editing/cropping

## Dependencies
- v0.2 Expense Capture
- expense-receipts storage bucket
- expense_receipts table
