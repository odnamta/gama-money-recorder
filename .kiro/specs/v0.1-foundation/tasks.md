# v0.1 Foundation - Implementation Tasks

## Prerequisites
- [ ] Node.js 20+ installed
- [ ] pnpm installed
- [ ] Supabase CLI installed
- [ ] Access to Supabase project (ljbkjtaowrdddvjhsygj)

## Tasks

### Phase 1: Project Setup
- [x] 1.1 Initialize Next.js 15 project with TypeScript
- [x] 1.2 Configure TailwindCSS and shadcn/ui (new-york theme)
- [x] 1.3 Set up project folder structure
- [x] 1.4 Configure ESLint and Prettier
- [x] 1.5 Set up environment variables (.env.local)

### Phase 2: PWA Configuration
- [x] 2.1 Install and configure next-pwa
- [x] 2.2 Create PWA manifest (app/manifest.ts)
- [x] 2.3 Create app icons (192x192, 512x512)
- [x] 2.4 Configure service worker settings
- [x] 2.5 Add meta tags for mobile viewport

### Phase 3: Supabase Integration
- [x] 3.1 Install Supabase packages (@supabase/supabase-js, @supabase/ssr)
- [x] 3.2 Create server-side Supabase client (lib/supabase/server.ts)
- [x] 3.3 Create browser Supabase client (lib/supabase/client.ts)
- [x] 3.4 Generate TypeScript types from Supabase schema

### Phase 4: Authentication
- [x] 4.1 Create login page with Google OAuth button
- [x] 4.2 Implement OAuth callback route (/api/auth/callback)
- [x] 4.3 Create auth middleware for protected routes
- [x] 4.4 Implement role checking against user_profiles
- [x] 4.5 Create access denied page
- [x] 4.6 Add logout functionality

### Phase 5: Navigation & Layout
- [x] 5.1 Create root layout with providers
- [x] 5.2 Create auth layout for protected routes
- [x] 5.3 Build BottomNav component
- [x] 5.4 Create placeholder pages (dashboard, capture, history, settings)
- [x] 5.5 Implement active state highlighting

### Phase 6: User Context
- [x] 6.1 Create user context provider
- [x] 6.2 Create useUser hook
- [x] 6.3 Fetch and cache user profile with role

## Verification
- [ ] App installs as PWA on mobile
- [ ] Google OAuth login works
- [ ] Only @gama-group.co emails can log in
- [ ] Unauthorized roles see access denied
- [ ] Navigation works between all pages
- [ ] Session persists after app restart
- [ ] Logout clears session
