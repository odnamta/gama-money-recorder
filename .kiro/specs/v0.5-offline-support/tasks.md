# v0.5 Offline Support - Implementation Tasks

## Prerequisites
- [ ] v0.2, v0.3, v0.4 completed
- [ ] Dexie.js installed

## Tasks

### Phase 1: Database Setup
- [x] 1.1 Install Dexie.js
- [x] 1.2 Create database schema (MoneyRecorderDB)
- [x] 1.3 Define LocalExpense interface
- [x] 1.4 Define LocalReceipt interface
- [x] 1.5 Define SyncQueueItem interface
- [x] 1.6 Define CachedJobOrder interface

### Phase 2: Local Operations
- [x] 2.1 Create saveExpenseLocally function
- [x] 2.2 Create saveReceiptLocally function
- [x] 2.3 Create getLocalExpenses function
- [x] 2.4 Create getLocalReceipt function
- [x] 2.5 Update expense form to use local save

### Phase 3: Sync Manager
- [x] 3.1 Create SyncManager class
- [x] 3.2 Implement queue processing
- [x] 3.3 Implement receipt sync
- [x] 3.4 Implement expense sync
- [x] 3.5 Add retry logic with backoff
- [x] 3.6 Add online/offline listeners

### Phase 4: Job Caching
- [x] 4.1 Create job cache functions
- [x] 4.2 Cache jobs on app load
- [x] 4.3 Update job selector for offline
- [x] 4.4 Refresh cache when online

### Phase 5: UI Components
- [x] 5.1 Create OfflineIndicator component
- [x] 5.2 Create SyncStatusBadge component
- [x] 5.3 Create PendingSyncList component
- [x] 5.4 Add manual sync trigger button

### Phase 6: Hooks
- [x] 6.1 Create useOnlineStatus hook
- [x] 6.2 Create useSyncStatus hook
- [x] 6.3 Create usePendingSync hook
- [x] 6.4 Create useLocalExpenses hook

### Phase 7: Integration
- [x] 7.1 Update expense capture flow
- [x] 7.2 Update receipt capture flow
- [x] 7.3 Update history view for local data
- [x] 7.4 Add sync status to expense cards

### Phase 8: Polish
- [x] 8.1 Add sync notifications (toast)
- [x] 8.2 Handle storage quota errors
- [x] 8.3 Implement 24-hour flag logic
- [x] 8.4 Test offline scenarios thoroughly

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
