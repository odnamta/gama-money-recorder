# v0.4 Job Linking - Implementation Tasks

## Prerequisites
- [ ] v0.2 Expense Capture completed
- [ ] Access to job_orders table (GAMA ERP)
- [ ] job_order_id column in expense_drafts

## Tasks

### Phase 1: Job Search
- [ ] 1.1 Create useJobSearch hook with debounce
- [ ] 1.2 Create JobSearchDialog component
- [ ] 1.3 Create JobCard display component
- [ ] 1.4 Implement search by job number and customer

### Phase 2: Recent Jobs
- [ ] 2.1 Create useRecentJobs hook
- [ ] 2.2 Create RecentJobsList component
- [ ] 2.3 Implement quick select from recent

### Phase 3: Job Selector
- [ ] 3.1 Create JobSelector container component
- [ ] 3.2 Create OverheadToggle component
- [ ] 3.3 Integrate search and recent jobs
- [ ] 3.4 Add to expense form

### Phase 4: GPS Capture
- [ ] 4.1 Create useGPS hook
- [ ] 4.2 Implement position capture on form load
- [ ] 4.3 Handle GPS permission errors
- [ ] 4.4 Store coordinates with expense

### Phase 5: Location Validation
- [ ] 5.1 Create distance calculation utility
- [ ] 5.2 Fetch job location (origin/destination)
- [ ] 5.3 Create LocationWarning component
- [ ] 5.4 Implement validation on save

### Phase 6: Form Integration
- [ ] 6.1 Update expense schema with job fields
- [ ] 6.2 Add validation for job/overhead requirement
- [ ] 6.3 Save job_order_id with expense
- [ ] 6.4 Save GPS coordinates with expense

### Phase 7: Polish
- [ ] 7.1 Add loading states for job search
- [ ] 7.2 Handle no active jobs scenario
- [ ] 7.3 Test GPS on various devices
- [ ] 7.4 Optimize job search performance

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
