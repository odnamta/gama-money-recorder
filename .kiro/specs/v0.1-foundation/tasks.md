# v0.1 Foundation - Implementation Tasks

## Prerequisites
- [ ] Node.js 20+ installed
- [ ] pnpm installed
- [ ] Supabase CLI installed
- [ ] Access to Supabase project (ljbkjtaowrdddvjhsygj)

## Tasks

### Phase 1: Project Setup
- [ ] 1.1 Initialize Next.js 15 project with TypeScript
- [ ] 1.2 Configure TailwindCSS and shadcn/ui (new-york theme)
- [ ] 1.3 Set up project folder structure
- [ ] 1.4 Configure ESLint and Prettier
- [ ] 1.5 Set up environment variables (.env.local)

### Phase 2: PWA Configuration
- [ ] 2.1 Install and configure next-pwa
- [ ] 2.2 Create PWA manifest (app/manifest.ts)
- [ ] 2.3 Create app icons (192x192, 512x512)
- [ ] 2.4 Configure service worker settings
- [ ] 2.5 Add meta tags for mobile viewport

### Phase 3: Supabase Integration
- [ ] 3.1 Install Supabase packages (@supabase/supabase-js, @supabase/ssr)
- [ ] 3.2 Create server-side Supabase client (lib/supabase/server.ts)
- [ ] 3.3 Create browser Supabase client (lib/supabase/client.ts)
- [ ] 3.4 Generate TypeScript types from Supabase schema

### Phase 4: Authentication
- [ ] 4.1 Create login page with Google OAuth button
- [ ] 4.2 Implement OAuth callback route (/api/auth/callback)
- [ ] 4.3 Create auth middleware for protected routes
- [ ] 4.4 Implement role checking against user_profiles
- [ ] 4.5 Create access denied page
- [ ] 4.6 Add logout functionality

### Phase 5: Navigation & Layout
- [ ] 5.1 Create root layout with providers
- [ ] 5.2 Create auth layout for protected routes
- [ ] 5.3 Build BottomNav component
- [ ] 5.4 Create placeholder pages (dashboard, capture, history, settings)
- [ ] 5.5 Implement active state highlighting

### Phase 6: User Context
- [ ] 6.1 Create user context provider
- [ ] 6.2 Create useUser hook
- [ ] 6.3 Fetch and cache user profile with role

## Verification
- [ ] App installs as PWA on mobile
- [ ] Google OAuth login works
- [ ] Only @gama-group.co emails can log in
- [ ] Unauthorized roles see access denied
- [ ] Navigation works between all pages
- [ ] Session persists after app restart
- [ ] Logout clears session
