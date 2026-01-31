# v0.4 Job Linking - Technical Design

## Overview
Implement job order selection with search, recent jobs, overhead toggle, and GPS validation.

## Component Architecture

### New Components
```
components/
├── job/
│   ├── JobSelector.tsx         # Main selector component
│   ├── JobSearchInput.tsx      # Search input with results
│   ├── RecentJobsList.tsx      # Quick select recent jobs
│   ├── JobCard.tsx             # Job display card
│   └── OverheadToggle.tsx      # Overhead switch
├── location/
│   ├── GPSCapture.tsx          # GPS capture component
│   └── LocationWarning.tsx     # Distance warning
```

## Job Selector Component

```typescript
// components/job/JobSelector.tsx
interface JobSelectorProps {
  value: string | null
  onChange: (jobId: string | null) => void
  isOverhead: boolean
  onOverheadChange: (isOverhead: boolean) => void
  error?: string
}

export function JobSelector({
  value,
  onChange,
  isOverhead,
  onOverheadChange,
  error
}: JobSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { recentJobs } = useRecentJobs()
  const selectedJob = useJob(value)
  
  return (
    <div className="space-y-3">
      {/* Overhead Toggle */}
      <div className="flex items-center justify-between">
        <Label>Terkait Job Order</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Overhead</span>
          <Switch
            checked={isOverhead}
            onCheckedChange={(checked) => {
              onOverheadChange(checked)
              if (checked) onChange(null)
            }}
          />
        </div>
      </div>
      
      {!isOverhead && (
        <>
          {/* Selected Job Display */}
          {selectedJob ? (
            <JobCard
              job={selectedJob}
              onRemove={() => onChange(null)}
            />
          ) : (
            <>
              {/* Recent Jobs */}
              {recentJobs.length > 0 && (
                <RecentJobsList
                  jobs={recentJobs}
                  onSelect={onChange}
                />
              )}
              
              {/* Search Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                Cari Job Order
              </Button>
            </>
          )}
          
          {/* Search Dialog */}
          <JobSearchDialog
            open={isOpen}
            onOpenChange={setIsOpen}
            onSelect={(job) => {
              onChange(job.id)
              setIsOpen(false)
            }}
          />
        </>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
```

## Job Search

### Search Dialog
```typescript
// components/job/JobSearchDialog.tsx
interface JobSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (job: JobOrder) => void
}

export function JobSearchDialog({
  open,
  onOpenChange,
  onSelect
}: JobSearchDialogProps) {
  const [search, setSearch] = useState('')
  const { jobs, isLoading } = useJobSearch(search)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pilih Job Order</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor job atau customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Tidak ada job order ditemukan
            </p>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => onSelect(job)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent"
                >
                  <div className="font-medium">{job.job_number}</div>
                  <div className="text-sm text-muted-foreground">
                    {job.customer_name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {job.origin} → {job.destination}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
```

### Job Search Hook
```typescript
// hooks/use-job-search.ts
export function useJobSearch(searchTerm: string) {
  const [jobs, setJobs] = useState<JobOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  
  useEffect(() => {
    if (searchTerm.length < 2) {
      setJobs([])
      return
    }
    
    const search = async () => {
      setIsLoading(true)
      
      const { data } = await supabase
        .from('job_orders')
        .select('id, job_number, customer_name, origin, destination, status')
        .eq('status', 'active')
        .or(`job_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20)
      
      setJobs(data || [])
      setIsLoading(false)
    }
    
    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm])
  
  return { jobs, isLoading }
}
```

## Recent Jobs

### Recent Jobs Hook
```typescript
// hooks/use-recent-jobs.ts
export function useRecentJobs(limit = 5) {
  const [recentJobs, setRecentJobs] = useState<JobOrder[]>([])
  const supabase = createClient()
  
  useEffect(() => {
    const fetchRecent = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Get recent job IDs from user's expenses
      const { data: expenses } = await supabase
        .from('expense_drafts')
        .select('job_order_id')
        .eq('user_id', user.id)
        .not('job_order_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50)
      
      // Get unique job IDs
      const jobIds = [...new Set(
        expenses?.map(e => e.job_order_id).filter(Boolean)
      )].slice(0, limit)
      
      if (jobIds.length === 0) return
      
      // Fetch job details
      const { data: jobs } = await supabase
        .from('job_orders')
        .select('id, job_number, customer_name, origin, destination')
        .in('id', jobIds)
        .eq('status', 'active')
      
      // Sort by original order
      const sorted = jobIds
        .map(id => jobs?.find(j => j.id === id))
        .filter(Boolean) as JobOrder[]
      
      setRecentJobs(sorted)
    }
    
    fetchRecent()
  }, [limit])
  
  return { recentJobs }
}
```

## GPS Validation

### GPS Capture Hook
```typescript
// hooks/use-gps.ts
interface GPSPosition {
  latitude: number
  longitude: number
  accuracy: number
}

export function useGPS() {
  const [position, setPosition] = useState<GPSPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const capturePosition = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('GPS tidak tersedia')
      return null
    }
    
    setIsLoading(true)
    setError(null)
    
    return new Promise<GPSPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          }
          setPosition(position)
          setIsLoading(false)
          resolve(position)
        },
        (err) => {
          setError(getGPSErrorMessage(err))
          setIsLoading(false)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }, [])
  
  return { position, error, isLoading, capturePosition }
}

function getGPSErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Izin lokasi ditolak'
    case error.POSITION_UNAVAILABLE:
      return 'Lokasi tidak tersedia'
    case error.TIMEOUT:
      return 'Waktu habis mendapatkan lokasi'
    default:
      return 'Gagal mendapatkan lokasi'
  }
}
```

### Distance Calculation
```typescript
// lib/utils/geo.ts
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
```

### Location Warning Component
```typescript
// components/location/LocationWarning.tsx
interface LocationWarningProps {
  distance: number
  threshold: number
  onProceed: (explanation: string) => void
  onCancel: () => void
}

export function LocationWarning({
  distance,
  threshold,
  onProceed,
  onCancel
}: LocationWarningProps) {
  const [explanation, setExplanation] = useState('')
  
  return (
    <Alert variant="warning">
      <MapPin className="h-4 w-4" />
      <AlertTitle>Lokasi Jauh dari Job</AlertTitle>
      <AlertDescription>
        Anda berada {formatDistance(distance * 1000)} dari lokasi job 
        (batas: {threshold} km). Mohon berikan penjelasan.
      </AlertDescription>
      
      <Textarea
        placeholder="Jelaskan mengapa lokasi berbeda..."
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        className="mt-3"
      />
      
      <div className="flex gap-2 mt-3">
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button
          onClick={() => onProceed(explanation)}
          disabled={explanation.length < 10}
        >
          Lanjutkan
        </Button>
      </div>
    </Alert>
  )
}
```

## Form Integration

### Updated Expense Schema
```typescript
const expenseSchema = z.object({
  // ... existing fields
  jobOrderId: z.string().uuid().nullable(),
  isOverhead: z.boolean().default(false),
  gpsLatitude: z.number().nullable(),
  gpsLongitude: z.number().nullable(),
  gpsAccuracy: z.number().nullable(),
  locationExplanation: z.string().optional()
}).refine(
  (data) => data.isOverhead || data.jobOrderId !== null,
  { message: 'Pilih job order atau tandai sebagai overhead' }
)
```

## Testing Strategy

### Unit Tests
- Distance calculation
- GPS error handling
- Job search filtering

### Integration Tests
- Job search API
- Recent jobs loading
- GPS capture flow

### E2E Tests
- Complete job linking flow
- Overhead toggle
- Location warning flow
