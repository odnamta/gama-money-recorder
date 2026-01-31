# v0.2 Expense Capture - Implementation Tasks

## Prerequisites
- [ ] v0.1 Foundation completed
- [ ] expense_drafts table created in Supabase

## Tasks

### Phase 1: Database Setup
- [x] 1.1 Create expense_drafts table migration
- [x] 1.2 Set up RLS policies for expense_drafts
- [x] 1.3 Regenerate TypeScript types

### Phase 2: Form Components
- [x] 2.1 Create AmountInput component with IDR formatting
- [x] 2.2 Create CategorySelector component with icons
- [x] 2.3 Create VendorInput component with autocomplete
- [x] 2.4 Create DatePicker component
- [x] 2.5 Create DescriptionInput component

### Phase 3: Form Logic
- [x] 3.1 Create expense form schema with Zod
- [x] 3.2 Create useExpenseForm hook
- [x] 3.3 Implement form validation
- [x] 3.4 Create saveExpense server action

### Phase 4: Vendor Suggestions
- [x] 4.1 Create getRecentVendors query
- [x] 4.2 Create searchVendors query
- [x] 4.3 Implement suggestion dropdown UI

### Phase 5: Page Assembly
- [x] 5.1 Create ExpenseCaptureForm organism
- [x] 5.2 Build capture page with form
- [x] 5.3 Add success/error toast notifications
- [x] 5.4 Implement "add another" flow

### Phase 6: Polish
- [x] 6.1 Add loading states
- [x] 6.2 Add form reset after success
- [x] 6.3 Optimize for mobile keyboard
- [x] 6.4 Test on various mobile devices

## Verification
- [ ] Can enter amount with proper formatting
- [ ] All 8 categories selectable
- [ ] Vendor suggestions appear
- [ ] Date picker works
- [ ] Validation errors show in Indonesian
- [ ] Expense saves to database
- [ ] Success toast appears
- [ ] Can add another expense
