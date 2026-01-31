# v0.2 Expense Capture - Implementation Tasks

## Prerequisites
- [ ] v0.1 Foundation completed
- [ ] expense_drafts table created in Supabase

## Tasks

### Phase 1: Database Setup
- [ ] 1.1 Create expense_drafts table migration
- [ ] 1.2 Set up RLS policies for expense_drafts
- [ ] 1.3 Regenerate TypeScript types

### Phase 2: Form Components
- [ ] 2.1 Create AmountInput component with IDR formatting
- [ ] 2.2 Create CategorySelector component with icons
- [ ] 2.3 Create VendorInput component with autocomplete
- [ ] 2.4 Create DatePicker component
- [ ] 2.5 Create DescriptionInput component

### Phase 3: Form Logic
- [ ] 3.1 Create expense form schema with Zod
- [ ] 3.2 Create useExpenseForm hook
- [ ] 3.3 Implement form validation
- [ ] 3.4 Create saveExpense server action

### Phase 4: Vendor Suggestions
- [ ] 4.1 Create getRecentVendors query
- [ ] 4.2 Create searchVendors query
- [ ] 4.3 Implement suggestion dropdown UI

### Phase 5: Page Assembly
- [ ] 5.1 Create ExpenseCaptureForm organism
- [ ] 5.2 Build capture page with form
- [ ] 5.3 Add success/error toast notifications
- [ ] 5.4 Implement "add another" flow

### Phase 6: Polish
- [ ] 6.1 Add loading states
- [ ] 6.2 Add form reset after success
- [ ] 6.3 Optimize for mobile keyboard
- [ ] 6.4 Test on various mobile devices

## Verification
- [ ] Can enter amount with proper formatting
- [ ] All 8 categories selectable
- [ ] Vendor suggestions appear
- [ ] Date picker works
- [ ] Validation errors show in Indonesian
- [ ] Expense saves to database
- [ ] Success toast appears
- [ ] Can add another expense
