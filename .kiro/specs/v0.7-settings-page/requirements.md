# v0.7 Settings Page - Requirements

## Overview
Provide users with a settings page to manage their profile, sync preferences, storage, and app information.

## User Stories

### US-1: View Profile
As a user, I want to see my profile information so that I can verify my account details.

#### Acceptance Criteria
- [ ] AC-1.1: Display user avatar (Google profile picture)
- [ ] AC-1.2: Display user name
- [ ] AC-1.3: Display user email
- [ ] AC-1.4: Display user role badge

### US-2: Manage Sync Settings
As a user, I want to control sync behavior so that I can optimize battery and data usage.

#### Acceptance Criteria
- [ ] AC-2.1: Toggle auto-sync on/off
- [ ] AC-2.2: Select sync interval (5min, 15min, 30min, manual)
- [ ] AC-2.3: Toggle sync on WiFi only
- [ ] AC-2.4: Show last sync timestamp

### US-3: View Pending Sync
As a user, I want to see pending sync items so that I know what hasn't been uploaded yet.

#### Acceptance Criteria
- [ ] AC-3.1: Show count of pending expenses
- [ ] AC-3.2: Show count of pending receipts
- [ ] AC-3.3: List pending items with details
- [ ] AC-3.4: Manual sync button
- [ ] AC-3.5: Retry failed items

### US-4: Manage Storage
As a user, I want to manage local storage so that I can free up space on my device.

#### Acceptance Criteria
- [ ] AC-4.1: Show total storage used
- [ ] AC-4.2: Show breakdown (expenses, receipts, job cache)
- [ ] AC-4.3: Clear synced data option
- [ ] AC-4.4: Clear all cache option
- [ ] AC-4.5: Confirmation dialog before clearing

### US-5: View App Info
As a user, I want to see app information so that I can report issues or check for updates.

#### Acceptance Criteria
- [ ] AC-5.1: Display app version
- [ ] AC-5.2: Display build date
- [ ] AC-5.3: Link to support/help
- [ ] AC-5.4: Link to privacy policy

### US-6: Logout
As a user, I want to logout so that I can switch accounts or secure my device.

#### Acceptance Criteria
- [ ] AC-6.1: Logout button
- [ ] AC-6.2: Confirmation dialog
- [ ] AC-6.3: Clear local data on logout
- [ ] AC-6.4: Redirect to login page

## Business Rules
- BR-1: Pending data must be synced or warned before logout
- BR-2: Storage clearing requires confirmation
- BR-3: Sync settings persist in localStorage
- BR-4: Profile data comes from Supabase auth

## Out of Scope
- Edit profile (managed by Google)
- Change password (Google OAuth)
- Notification settings (v1.0)
- Theme settings

## Dependencies
- v0.5 Offline Support (for sync management)
