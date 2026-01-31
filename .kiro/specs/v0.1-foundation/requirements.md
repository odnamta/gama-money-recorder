# v0.1 Foundation - Requirements

## Overview
Set up the foundational infrastructure for GAMA Money Recorder PWA, including project scaffolding, authentication integration, and basic navigation structure.

## User Stories

### US-1: Project Access
As a GAMA employee, I want to access the Money Recorder app from my mobile browser so that I can capture expenses in the field.

#### Acceptance Criteria
- [ ] AC-1.1: App is accessible as a PWA from mobile browsers
- [ ] AC-1.2: App can be installed to home screen
- [ ] AC-1.3: App displays properly on mobile viewport (375px - 428px width)
- [ ] AC-1.4: App has appropriate splash screen and app icon

### US-2: Authentication
As a GAMA employee, I want to log in using my company Google account so that my expenses are linked to my profile.

#### Acceptance Criteria
- [ ] AC-2.1: Login page displays Google OAuth button
- [ ] AC-2.2: Only @gama-group.co emails can authenticate
- [ ] AC-2.3: User is redirected to dashboard after successful login
- [ ] AC-2.4: User session persists across app restarts
- [ ] AC-2.5: User can log out from settings

### US-3: Navigation
As a user, I want to navigate between main sections of the app so that I can access different features.

#### Acceptance Criteria
- [ ] AC-3.1: Bottom navigation bar with: Home, Capture, History, Settings
- [ ] AC-3.2: Active tab is visually highlighted
- [ ] AC-3.3: Navigation is accessible (proper labels, touch targets)
- [ ] AC-3.4: Navigation persists across page transitions

### US-4: Role-Based Access
As a system, I want to verify user roles so that features are appropriately restricted.

#### Acceptance Criteria
- [ ] AC-4.1: User role is fetched from user_profiles table
- [ ] AC-4.2: Unauthorized roles are redirected to access denied page
- [ ] AC-4.3: Role is available in app context for feature gating

## Business Rules
- BR-1: Only users with allowed roles can access the app (owner, director, finance_manager, finance, operations_manager, ops, operations, engineer)
- BR-2: Authentication uses shared Supabase Auth with GAMA ERP
- BR-3: App must work as installable PWA

## Out of Scope
- Expense capture functionality (v0.2)
- Offline support (v0.5)
- Receipt photo capture (v0.3)

## Dependencies
- Supabase project (ljbkjtaowrdddvjhsygj)
- Existing user_profiles table in GAMA ERP
- Google OAuth configuration in Supabase
