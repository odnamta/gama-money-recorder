# v0.1 Foundation - Technical Design

## Overview
Establish the Next.js 15 PWA foundation with Supabase authentication integration and mobile-first navigation.

## Tech Stack Setup

### Dependencies
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "tailwindcss": "^3.x",
    "lucide-react": "^0.x",
    "sonner": "^1.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/node": "^20.x",
    "next-pwa": "^5.x"
  }
}
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth-required layout
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Home/Dashboard
│   │   ├── capture/
│   │   │   └── page.tsx        # Placeholder
│   │   ├── history/
│   │   │   └── page.tsx        # Placeholder
│   │   └── settings/
│   │       └── page.tsx        # Settings with logout
│   ├── (public)/
│   │   └── login/
│   │       └── page.tsx        # Login page
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts    # OAuth callback
│   ├── layout.tsx              # Root layout
│   ├── manifest.ts             # PWA manifest
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── navigation/
│   │   └── BottomNav.tsx       # Bottom navigation
│   └── auth/
│       └── LoginButton.tsx     # Google login button
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # Server client
│   │   ├── client.ts           # Browser client
│   │   └── middleware.ts       # Auth middleware
│   └── utils/
│       └── cn.ts               # Class name utility
├── hooks/
│   └── use-user.ts             # User context hook
├── types/
│   └── database.ts             # Supabase types
└── middleware.ts               # Next.js middleware
```

## Authentication Flow

### Login Flow
```
[User visits /login] → [Clicks Google Login]
    ↓
[Supabase OAuth redirect] → [Google consent]
    ↓
[Callback to /api/auth/callback] → [Exchange code for session]
    ↓
[Fetch user_profiles] → [Check role]
    ↓
[Valid role?]
    ├─ Yes → [Redirect to /dashboard]
    └─ No  → [Redirect to /access-denied]
```

### Supabase Client Setup

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Middleware Protection

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_ROLES = [
  'owner', 'director', 'finance_manager', 'finance',
  'operations_manager', 'ops', 'operations', 'engineer'
]

export async function middleware(request: NextRequest) {
  // Create response to modify
  let response = NextResponse.next({ request })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Redirect to login if not authenticated
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Check role for protected routes
  if (user && request.nextUrl.pathname.startsWith('/(auth)')) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL('/access-denied', request.url))
    }
  }
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)']
}
```

## PWA Configuration

### Manifest
```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GAMA Money Recorder',
    short_name: 'Money Recorder',
    description: 'Quick expense capture for GAMA field staff',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
}
```

### next-pwa Config
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // Next.js config
})
```

## Component Architecture

### Bottom Navigation
```typescript
// components/navigation/BottomNav.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Camera, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Beranda' },
  { href: '/capture', icon: Camera, label: 'Catat' },
  { href: '/history', icon: History, label: 'Riwayat' },
  { href: '/settings', icon: Settings, label: 'Pengaturan' }
]

export function BottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full',
                'text-xs transition-colors',
                isActive ? 'text-primary' : 'text-gray-500'
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

## Security Considerations

1. **OAuth Only**: No password-based auth, Google OAuth only
2. **Domain Restriction**: Only @gama-group.co emails
3. **Role Verification**: Check role on every protected route
4. **Session Management**: Use Supabase SSR for secure cookies
5. **HTTPS Only**: PWA requires HTTPS in production

## Testing Strategy

### Unit Tests
- Utility functions (cn, formatters)
- Role checking logic

### Integration Tests
- Auth flow (login, logout, session persistence)
- Navigation routing
- Role-based redirects

### E2E Tests
- Complete login flow
- PWA installation
- Navigation between pages
