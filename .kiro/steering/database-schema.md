# GAMA Money Recorder - Database Schema

## New Tables

### expense_drafts

Stores expense entries captured in the app before approval.

```sql
CREATE TABLE expense_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Employee
  user_id UUID NOT NULL REFERENCES auth.users(id),
  employee_id UUID REFERENCES employees(id),
  
  -- Expense Details
  amount DECIMAL(15,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'fuel', 'toll', 'parking', 'food', 
    'lodging', 'transport', 'supplies', 'other'
  )),
  description TEXT,
  vendor_name TEXT,
  vendor_id UUID REFERENCES vendors(id),
  
  -- Job Linking
  job_order_id UUID REFERENCES job_orders(id),
  is_overhead BOOLEAN DEFAULT FALSE,
  
  -- Date & Location
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expense_time TIME,
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  gps_accuracy DECIMAL(10,2),
  
  -- Receipt & OCR
  receipt_id UUID REFERENCES expense_receipts(id),
  ocr_confidence DECIMAL(5,4),
  requires_review BOOLEAN DEFAULT FALSE,
  
  -- Sync & Status
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN (
    'pending', 'syncing', 'synced', 'failed'
  )),
  local_id TEXT, -- Client-generated UUID for offline tracking
  synced_at TIMESTAMPTZ,
  
  -- ERP Integration
  bkk_record_id UUID REFERENCES bkk_records(id),
  approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN (
    'draft', 'pending_approval', 'approved', 'rejected'
  )),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_from TEXT DEFAULT 'mobile' CHECK (created_from IN ('mobile', 'web', 'import'))
);

-- Indexes
CREATE INDEX idx_expense_drafts_user_id ON expense_drafts(user_id);
CREATE INDEX idx_expense_drafts_job_order_id ON expense_drafts(job_order_id);
CREATE INDEX idx_expense_drafts_sync_status ON expense_drafts(sync_status);
CREATE INDEX idx_expense_drafts_approval_status ON expense_drafts(approval_status);
CREATE INDEX idx_expense_drafts_expense_date ON expense_drafts(expense_date);
CREATE INDEX idx_expense_drafts_local_id ON expense_drafts(local_id);

-- Updated at trigger
CREATE TRIGGER update_expense_drafts_updated_at
  BEFORE UPDATE ON expense_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Column Descriptions

| Column | Description |
|--------|-------------|
| `id` | Primary key (server-generated) |
| `user_id` | Auth user who created the expense |
| `employee_id` | Linked employee record for payroll |
| `amount` | Expense amount in IDR |
| `category` | Expense category (fuel, toll, etc.) |
| `description` | Optional notes about the expense |
| `vendor_name` | Vendor name (from OCR or manual) |
| `vendor_id` | Linked vendor record if matched |
| `job_order_id` | Linked job order (required unless overhead) |
| `is_overhead` | True if not linked to specific job |
| `expense_date` | Date of the expense |
| `expense_time` | Time of the expense (optional) |
| `gps_latitude` | GPS latitude when captured |
| `gps_longitude` | GPS longitude when captured |
| `gps_accuracy` | GPS accuracy in meters |
| `receipt_id` | Linked receipt image |
| `ocr_confidence` | Overall OCR confidence (0-1) |
| `requires_review` | Flag for manual review needed |
| `sync_status` | Offline sync status |
| `local_id` | Client-generated ID for offline tracking |
| `synced_at` | When successfully synced |
| `bkk_record_id` | Created BKK record in ERP |
| `approval_status` | Approval workflow status |
| `approved_by` | User who approved/rejected |
| `approved_at` | Approval timestamp |
| `rejection_reason` | Reason if rejected |
| `created_from` | Source of creation |

---

### expense_receipts

Stores receipt images and OCR extraction results.

```sql
CREATE TABLE expense_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Image Storage
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  original_filename TEXT,
  file_size INTEGER, -- In bytes
  mime_type TEXT DEFAULT 'image/jpeg',
  image_width INTEGER,
  image_height INTEGER,
  
  -- OCR Results
  ocr_raw_text TEXT,
  ocr_confidence DECIMAL(5,4),
  ocr_processing_time INTEGER, -- In milliseconds
  ocr_provider TEXT DEFAULT 'google_vision' CHECK (ocr_provider IN (
    'google_vision', 'tesseract', 'manual'
  )),
  
  -- Extracted Data
  extracted_amount DECIMAL(15,2),
  extracted_amount_confidence DECIMAL(5,4),
  extracted_vendor_name TEXT,
  extracted_vendor_confidence DECIMAL(5,4),
  extracted_date DATE,
  extracted_date_confidence DECIMAL(5,4),
  
  -- Sync
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN (
    'pending', 'syncing', 'synced', 'failed'
  )),
  local_id TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_expense_receipts_user_id ON expense_receipts(user_id);
CREATE INDEX idx_expense_receipts_sync_status ON expense_receipts(sync_status);
CREATE INDEX idx_expense_receipts_local_id ON expense_receipts(local_id);
```

#### Column Descriptions

| Column | Description |
|--------|-------------|
| `id` | Primary key |
| `user_id` | Owner of the receipt |
| `storage_path` | Path in `expense-receipts` bucket |
| `original_filename` | Original file name |
| `file_size` | File size in bytes |
| `mime_type` | Image MIME type |
| `image_width` | Image width in pixels |
| `image_height` | Image height in pixels |
| `ocr_raw_text` | Full OCR extracted text |
| `ocr_confidence` | Overall OCR confidence |
| `ocr_processing_time` | Processing time in ms |
| `ocr_provider` | OCR service used |
| `extracted_amount` | Parsed amount from OCR |
| `extracted_amount_confidence` | Confidence for amount |
| `extracted_vendor_name` | Parsed vendor name |
| `extracted_vendor_confidence` | Confidence for vendor |
| `extracted_date` | Parsed date from receipt |
| `extracted_date_confidence` | Confidence for date |
| `sync_status` | Upload sync status |
| `local_id` | Client-generated ID |

---

### expense_sync_queue

Tracks offline operations pending sync.

```sql
CREATE TABLE expense_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Queue Item
  operation_type TEXT NOT NULL CHECK (operation_type IN (
    'create_expense', 'update_expense', 'delete_expense',
    'upload_receipt', 'link_job_order'
  )),
  payload JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'syncing', 'completed', 'failed', 'cancelled'
  )),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  
  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Error Tracking
  last_error TEXT,
  error_details JSONB,
  
  -- References
  local_id TEXT NOT NULL, -- Client-generated ID
  server_id UUID, -- Server ID after successful sync
  
  -- Priority
  priority INTEGER DEFAULT 0 -- Higher = more urgent
);

-- Indexes
CREATE INDEX idx_expense_sync_queue_user_id ON expense_sync_queue(user_id);
CREATE INDEX idx_expense_sync_queue_status ON expense_sync_queue(status);
CREATE INDEX idx_expense_sync_queue_created_at ON expense_sync_queue(created_at);
CREATE INDEX idx_expense_sync_queue_local_id ON expense_sync_queue(local_id);
CREATE INDEX idx_expense_sync_queue_priority ON expense_sync_queue(priority DESC);
```

#### Column Descriptions

| Column | Description |
|--------|-------------|
| `id` | Primary key |
| `user_id` | User who created the operation |
| `operation_type` | Type of sync operation |
| `payload` | Full operation data as JSON |
| `status` | Current sync status |
| `retry_count` | Number of retry attempts |
| `max_retries` | Maximum retries before failing |
| `created_at` | When queued |
| `last_attempt_at` | Last sync attempt time |
| `completed_at` | When successfully completed |
| `expires_at` | Auto-fail after this time |
| `last_error` | Last error message |
| `error_details` | Detailed error info |
| `local_id` | Client-side reference ID |
| `server_id` | Server ID after sync |
| `priority` | Sync priority (higher first) |

---

## Storage Bucket

### expense-receipts

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'expense-receipts',
  'expense-receipts',
  FALSE,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);
```

Storage path pattern: `{user_id}/{year}/{month}/{filename}`

Example: `abc123-def456/2024/01/receipt-xyz789.jpg`

---

## RLS Policies

### expense_drafts

```sql
-- Enable RLS
ALTER TABLE expense_drafts ENABLE ROW LEVEL SECURITY;

-- Users can view their own expenses
CREATE POLICY "Users can view own expenses"
  ON expense_drafts FOR SELECT
  USING (auth.uid() = user_id);

-- Managers can view team expenses
CREATE POLICY "Managers can view team expenses"
  ON expense_drafts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'director', 'finance_manager', 'finance', 'operations_manager')
    )
  );

-- Users can insert their own expenses
CREATE POLICY "Users can insert own expenses"
  ON expense_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending expenses
CREATE POLICY "Users can update own pending expenses"
  ON expense_drafts FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND approval_status IN ('draft', 'pending_approval')
  );

-- Finance can update approval status
CREATE POLICY "Finance can approve expenses"
  ON expense_drafts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'director', 'finance_manager')
    )
  );
```

### expense_receipts

```sql
ALTER TABLE expense_receipts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own receipts
CREATE POLICY "Users can manage own receipts"
  ON expense_receipts FOR ALL
  USING (auth.uid() = user_id);

-- Managers can view team receipts
CREATE POLICY "Managers can view team receipts"
  ON expense_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'director', 'finance_manager', 'finance', 'operations_manager')
    )
  );
```

### expense_sync_queue

```sql
ALTER TABLE expense_sync_queue ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sync queue
CREATE POLICY "Users can manage own sync queue"
  ON expense_sync_queue FOR ALL
  USING (auth.uid() = user_id);
```

### Storage Policies

```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'expense-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own receipts
CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'expense-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Managers can view all receipts
CREATE POLICY "Managers can view all receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'expense-receipts'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'director', 'finance_manager', 'finance', 'operations_manager')
    )
  );
```

---

## Referenced Tables (GAMA ERP)

### bkk_records (Write access)
Creates expense drafts for approval in main ERP.

```typescript
interface BKKRecord {
  id: string
  record_number: string
  record_date: string
  amount: number
  description: string
  vendor_id?: string
  job_order_id?: string
  status: 'draft' | 'pending' | 'approved' | 'paid'
  created_by: string
  // ... other fields
}
```

### job_orders (Read access)
Links expenses to active jobs.

```typescript
interface JobOrder {
  id: string
  job_number: string
  customer_name: string
  origin: string
  destination: string
  status: 'active' | 'completed' | 'cancelled'
  // ... other fields
}
```

### vendors (Read/Write access)
Matches or creates vendor records.

```typescript
interface Vendor {
  id: string
  name: string
  category?: string
  // ... other fields
}
```

### user_profiles (Read access)
Auth and role checking.

```typescript
interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  // ... other fields
}
```

### employees (Read access)
Maps expenses to employee for payroll.

```typescript
interface Employee {
  id: string
  user_id?: string
  employee_number: string
  full_name: string
  department: string
  // ... other fields
}
```

---

## Common Query Patterns

### Get user's pending expenses
```typescript
const { data } = await supabase
  .from('expense_drafts')
  .select(`
    *,
    receipt:expense_receipts(*),
    job_order:job_orders(id, job_number, customer_name)
  `)
  .eq('user_id', userId)
  .eq('sync_status', 'synced')
  .eq('approval_status', 'draft')
  .order('expense_date', { ascending: false })
```

### Get expenses for approval (finance)
```typescript
const { data } = await supabase
  .from('expense_drafts')
  .select(`
    *,
    user:user_profiles(full_name, email),
    receipt:expense_receipts(storage_path, ocr_confidence)
  `)
  .eq('approval_status', 'pending_approval')
  .order('created_at', { ascending: true })
```

### Get sync queue items
```typescript
const { data } = await supabase
  .from('expense_sync_queue')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'pending')
  .order('priority', { ascending: false })
  .order('created_at', { ascending: true })
```

### Upload receipt image
```typescript
const { data, error } = await supabase.storage
  .from('expense-receipts')
  .upload(
    `${userId}/${year}/${month}/${filename}`,
    file,
    { contentType: 'image/jpeg' }
  )
```
