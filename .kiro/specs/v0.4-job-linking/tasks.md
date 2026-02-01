# v0.4 Job Linking - Implementation Tasks

## Prerequisites
- [ ] v0.2 Expense Capture completed
- [ ] Access to job_orders table (GAMA ERP)
- [ ] job_order_id column in expense_drafts

## Tasks

### Phase 1: Job Search
- [x] 1.1 Create useJobSearch hook with debounce
- [x] 1.2 Create JobSearchDialog component
- [x] 1.3 Create JobCard display component
- [x] 1.4 Implement search by job number and customer

### Phase 2: Recent Jobs
- [x] 2.1 Create useRecentJobs hook
- [x] 2.2 Create RecentJobsList component
- [x] 2.3 Implement quick select from recent

### Phase 3: Job Selector
- [x] 3.1 Create JobSelector container component
- [x] 3.2 Create OverheadToggle component
- [x] 3.3 Integrate search and recent jobs
- [x] 3.4 Add to expense form

### Phase 4: GPS Capture
- [x] 4.1 Create useGPS hook
- [x] 4.2 Implement position capture on form load
- [x] 4.3 Handle GPS permission errors
- [x] 4.4 Store coordinates with expense

### Phase 5: Location Validation
- [x] 5.1 Create distance calculation utility
- [x] 5.2 Fetch job location (origin/destination)
- [x] 5.3 Create LocationWarning component
- [x] 5.4 Implement validation on save

### Phase 6: Form Integration
- [x] 6.1 Update expense schema with job fields
- [x] 6.2 Add validation for job/overhead requirement
- [x] 6.3 Save job_order_id with expense
- [x] 6.4 Save GPS coordinates with expense

### Phase 7: Polish
- [x] 7.1 Add loading states for job search
- [x] 7.2 Handle no active jobs scenario
- [x] 7.3 Test GPS on various devices
- [x] 7.4 Optimize job search performance

## Verification
- [ ] Can search jobs by number
- [ ] Can search jobs by customer name
- [ ] Recent jobs appear correctly
- [ ] Can select from recent jobs
- [ ] Overhead toggle works
- [ ] GPS coordinates captured
- [ ] Location warning shows when far
- [ ] Can proceed with explanation
- [ ] Job linked to saved expense
