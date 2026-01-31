# v0.3.1 OCR Integration - Requirements

## Overview
Integrate OCR (Optical Character Recognition) to automatically extract expense data from receipt photos, reducing manual data entry.

## User Stories

### US-1: Auto-Extract Amount
As a user, I want the app to automatically read the total amount from my receipt so that I don't have to type it manually.

#### Acceptance Criteria
- [ ] AC-1.1: OCR processes receipt after capture
- [ ] AC-1.2: Extracted amount auto-fills the amount field
- [ ] AC-1.3: Confidence indicator shows extraction reliability
- [ ] AC-1.4: User can edit extracted amount

### US-2: Auto-Extract Vendor
As a user, I want the app to automatically identify the vendor name so that I don't have to type it.

#### Acceptance Criteria
- [ ] AC-2.1: Vendor name extracted from receipt header
- [ ] AC-2.2: Auto-fills vendor field
- [ ] AC-2.3: Attempts to match with existing vendors
- [ ] AC-2.4: User can edit extracted vendor

### US-3: Auto-Extract Date
As a user, I want the app to read the transaction date from the receipt so that the correct date is recorded.

#### Acceptance Criteria
- [ ] AC-3.1: Date extracted from receipt
- [ ] AC-3.2: Auto-fills date field
- [ ] AC-3.3: Falls back to today if not found
- [ ] AC-3.4: User can edit extracted date

### US-4: Low Confidence Review
As a user, I want to be notified when OCR confidence is low so that I can verify the extracted data.

#### Acceptance Criteria
- [ ] AC-4.1: Confidence < 80% triggers review prompt
- [ ] AC-4.2: Low-confidence fields highlighted
- [ ] AC-4.3: User must confirm or edit before saving
- [ ] AC-4.4: Expense flagged as "requires_review" in database

### US-5: OCR Processing Feedback
As a user, I want to see OCR processing status so that I know the app is working.

#### Acceptance Criteria
- [ ] AC-5.1: Loading indicator during OCR
- [ ] AC-5.2: Processing time shown
- [ ] AC-5.3: Error message if OCR fails
- [ ] AC-5.4: Option to skip OCR and enter manually

## Business Rules
- BR-1: OCR confidence < 80% requires manual review
- BR-2: OCR should complete within 10 seconds
- BR-3: Failed OCR should not block expense entry
- BR-4: All OCR results stored for audit trail

## Out of Scope
- Training custom OCR models
- Multi-language receipt support (Indonesian only)
- Receipt categorization by OCR

## Dependencies
- v0.3 Receipt Photo
- Google Cloud Vision API or Tesseract.js
- expense_receipts table (OCR columns)
