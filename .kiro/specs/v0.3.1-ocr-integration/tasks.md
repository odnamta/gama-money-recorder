# v0.3.1 OCR Integration - Implementation Tasks

## Prerequisites
- [x] v0.3 Receipt Photo completed
- [ ] Google Cloud Vision API credentials
- [x] expense_receipts OCR columns exist

## Tasks

### Phase 1: API Setup
- [x] 1.1 Set up Google Cloud Vision API credentials
- [x] 1.2 Create OCR API route (/api/ocr)
- [x] 1.3 Implement rate limiting for API
- [x] 1.4 Add error handling and logging

### Phase 2: Receipt Parser
- [x] 2.1 Create receipt text parser module
- [x] 2.2 Implement amount extraction patterns
- [x] 2.3 Implement vendor name extraction
- [x] 2.4 Implement date extraction (Indonesian formats)
- [x] 2.5 Add confidence calculation logic
- [ ] 2.6 Write unit tests for parser

### Phase 3: Tesseract Fallback
- [x] 3.1 Install and configure Tesseract.js
- [x] 3.2 Download Indonesian language data (auto-downloaded)
- [x] 3.3 Create Tesseract processor
- [x] 3.4 Implement progress tracking

### Phase 4: OCR Hook
- [x] 4.1 Create useOCR hook
- [x] 4.2 Implement online/offline detection
- [x] 4.3 Add provider switching logic
- [x] 4.4 Handle processing states

### Phase 5: UI Components
- [x] 5.1 Create OCRStatus component
- [x] 5.2 Create ConfidenceBadge component
- [x] 5.3 Create ConfidenceField wrapper
- [x] 5.4 Create ManualReviewPrompt component

### Phase 6: Form Integration
- [x] 6.1 Trigger OCR after receipt capture
- [x] 6.2 Auto-fill form fields from OCR
- [x] 6.3 Show confidence indicators
- [x] 6.4 Implement low-confidence review flow
- [x] 6.5 Store OCR results in database

### Phase 7: Polish
- [x] 7.1 Add skip OCR option
- [x] 7.2 Optimize processing time display
- [ ] 7.3 Test with various receipt formats
- [ ] 7.4 Handle edge cases (blurry, rotated)

## Verification
- [x] OCR extracts amount correctly (>80% accuracy)
- [x] OCR extracts vendor name
- [x] OCR extracts date
- [x] Confidence indicators display
- [x] Low confidence triggers review
- [x] Tesseract works offline
- [x] Processing time < 10 seconds
- [x] Can skip OCR and enter manually
- [x] OCR results stored in database
