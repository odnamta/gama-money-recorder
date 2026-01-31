# v0.3.1 OCR Integration - Implementation Tasks

## Prerequisites
- [ ] v0.3 Receipt Photo completed
- [ ] Google Cloud Vision API credentials
- [ ] expense_receipts OCR columns exist

## Tasks

### Phase 1: API Setup
- [ ] 1.1 Set up Google Cloud Vision API credentials
- [ ] 1.2 Create OCR API route (/api/ocr)
- [ ] 1.3 Implement rate limiting for API
- [ ] 1.4 Add error handling and logging

### Phase 2: Receipt Parser
- [ ] 2.1 Create receipt text parser module
- [ ] 2.2 Implement amount extraction patterns
- [ ] 2.3 Implement vendor name extraction
- [ ] 2.4 Implement date extraction (Indonesian formats)
- [ ] 2.5 Add confidence calculation logic
- [ ] 2.6 Write unit tests for parser

### Phase 3: Tesseract Fallback
- [ ] 3.1 Install and configure Tesseract.js
- [ ] 3.2 Download Indonesian language data
- [ ] 3.3 Create Tesseract processor
- [ ] 3.4 Implement progress tracking

### Phase 4: OCR Hook
- [ ] 4.1 Create useOCR hook
- [ ] 4.2 Implement online/offline detection
- [ ] 4.3 Add provider switching logic
- [ ] 4.4 Handle processing states

### Phase 5: UI Components
- [ ] 5.1 Create OCRStatus component
- [ ] 5.2 Create ConfidenceBadge component
- [ ] 5.3 Create ConfidenceField wrapper
- [ ] 5.4 Create ManualReviewPrompt component

### Phase 6: Form Integration
- [ ] 6.1 Trigger OCR after receipt capture
- [ ] 6.2 Auto-fill form fields from OCR
- [ ] 6.3 Show confidence indicators
- [ ] 6.4 Implement low-confidence review flow
- [ ] 6.5 Store OCR results in database

### Phase 7: Polish
- [ ] 7.1 Add skip OCR option
- [ ] 7.2 Optimize processing time display
- [ ] 7.3 Test with various receipt formats
- [ ] 7.4 Handle edge cases (blurry, rotated)

## Verification
- [ ] OCR extracts amount correctly (>80% accuracy)
- [ ] OCR extracts vendor name
- [ ] OCR extracts date
- [ ] Confidence indicators display
- [ ] Low confidence triggers review
- [ ] Tesseract works offline
- [ ] Processing time < 10 seconds
- [ ] Can skip OCR and enter manually
- [ ] OCR results stored in database
