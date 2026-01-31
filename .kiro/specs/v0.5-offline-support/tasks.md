# v0.5 Offline Support - Implementation Tasks

## Prerequisites
- [ ] v0.2, v0.3, v0.4 completed
- [ ] Dexie.js installed

## Tasks

### Phase 1: Database Setup
- [ ] 1.1 Install Dexie.js
- [ ] 1.2 Create database schema (MoneyRecorderDB)
- [ ] 1.3 Define LocalExpense interface
- [ ] 1.4 Define LocalReceipt interface
- [ ] 1.5 Define SyncQueueItem interface
- [ ] 1.6 Define CachedJobOrder interface

### Phase 2: Local Operations
- [ ] 2.1 Create saveExpenseLocally function
- [ ] 2.2 Create saveReceiptLocally function
- [ ] 2.3 Create getLocalExpenses function
- [ ] 2.4 Create getLocalReceipt function
- [ ] 2.5 Update expense form to use local save

### Phase 3: Sync Manager
- [ ] 3.1 Create SyncManager class
- [ ] 3.2 Implement queue processing
- [ ] 3.3 Implement receipt sync
- [ ] 3.4 Implement expense sync
- [ ] 3.5 Add retry logic with backoff
- [ ] 3.6 Add online/offline listeners

### Phase 4: Job Caching
- [ ] 4.1 Create job cache functions
- [ ] 4.2 Cache jobs on app load
- [ ] 4.3 Update job selector for offline
- [ ] 4.4 Refresh cache when online

### Phase 5: UI Components
- [ ] 5.1 Create OfflineIndicator component
- [ ] 5.2 Create SyncStatusBadge component
- [ ] 5.3 Create PendingSyncList component
- [ ] 5.4 Add manual sync trigger button

### Phase 6: Hooks
- [ ] 6.1 Create useOnlineStatus hook
- [ ] 6.2 Create useSyncStatus hook
- [ ] 6.3 Create usePendingSync hook
- [ ] 6.4 Create useLocalExpenses hook

### Phase 7: Integration
- [ ] 7.1 Update expense capture flow
- [ ] 7.2 Update receipt capture flow
- [ ] 7.3 Update history view for local data
- [ ] 7.4 Add sync status to expense cards

### Phase 8: Polish
- [ ] 8.1 Add sync notifications (toast)
- [ ] 8.2 Handle storage quota errors
- [ ] 8.3 Implement 24-hour flag logic
- [ ] 8.4 Test offline scenarios thoroughly

## Verification
- [ ] Can capture expense offline
- [ ] Can capture receipt offline
- [ ] Offline indicator shows
- [ ] Sync starts when online
- [ ] Sync progress visible
- [ ] Failed items show error
- [ ] Can retry failed sync
- [ ] Job selection works offline
- [ ] Data persists after app restart
- [ ] Sync completes successfully
