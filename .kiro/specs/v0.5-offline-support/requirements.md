# v0.5 Offline Support - Requirements

## Overview
Enable full offline functionality using IndexedDB (Dexie.js) for local storage and automatic synchronization when connectivity is restored.

## User Stories

### US-1: Offline Expense Capture
As a field staff member, I want to capture expenses even without internet so that I can record expenses in remote areas.

#### Acceptance Criteria
- [ ] AC-1.1: Expense form works without internet
- [ ] AC-1.2: Expenses saved to local database
- [ ] AC-1.3: Clear indication of offline mode
- [ ] AC-1.4: No functionality loss in offline mode

### US-2: Offline Receipt Storage
As a user, I want my receipt photos saved locally when offline so that they're not lost.

#### Acceptance Criteria
- [ ] AC-2.1: Receipt images stored in IndexedDB
- [ ] AC-2.2: Images compressed before local storage
- [ ] AC-2.3: Preview works from local storage
- [ ] AC-2.4: Images queued for upload when online

### US-3: Automatic Sync
As a user, I want my offline expenses to automatically sync when I'm back online so that I don't have to do anything manually.

#### Acceptance Criteria
- [ ] AC-3.1: Sync starts automatically when online
- [ ] AC-3.2: Sync progress indicator visible
- [ ] AC-3.3: Notification when sync completes
- [ ] AC-3.4: Retry failed syncs automatically

### US-4: Sync Status Visibility
As a user, I want to see which expenses are synced and which are pending so that I know my data status.

#### Acceptance Criteria
- [ ] AC-4.1: Sync status icon on each expense
- [ ] AC-4.2: Pending count in header/nav
- [ ] AC-4.3: Can view list of pending items
- [ ] AC-4.4: Can manually trigger sync

### US-5: Sync Failure Handling
As a user, I want to be notified of sync failures so that I can take action if needed.

#### Acceptance Criteria
- [ ] AC-5.1: Failed items highlighted
- [ ] AC-5.2: Error message shown
- [ ] AC-5.3: Retry option available
- [ ] AC-5.4: Items flagged after 24 hours

### US-6: Offline Job Selection
As a user, I want to select job orders even when offline so that I can link expenses properly.

#### Acceptance Criteria
- [ ] AC-6.1: Recent jobs cached locally
- [ ] AC-6.2: Can select from cached jobs offline
- [ ] AC-6.3: Jobs refresh when online

## Business Rules
- BR-1: Offline expenses must sync within 24 hours or be flagged
- BR-2: Maximum 5 retry attempts before marking as failed
- BR-3: Sync priority: receipts first, then expenses
- BR-4: Local storage limit: 50MB for images

## Out of Scope
- Offline OCR processing (Tesseract handled in v0.3.1)
- Conflict resolution (last-write-wins)
- Selective sync

## Dependencies
- v0.2 Expense Capture
- v0.3 Receipt Photo
- v0.4 Job Linking
- Dexie.js library
