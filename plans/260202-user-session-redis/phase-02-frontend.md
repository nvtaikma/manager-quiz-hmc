# Phase 02: Frontend Visualization
Status: ⬜ Pending

## Objective
Update the User Management UI to display session information.

## Implementation Steps
1. [x] Create `src/app/manage-users/components/UserSessionModal.tsx`.
   - Helper component to fetch and display session details (Ip, Device, Last Active).
2. [x] Update `UserTable` or `UserRow` to include a "View Session" button (e.g., an Eye icon).
3. [x] Integrate API `GET /api/customers/:id/session`.
4. [x] Handle formatting:
   - Status: Active/Expired.
   - Device Info.
   - Timestamps.

## Tech Notes
- Use Shadcn `Dialog` component.
- Display "No active session" if API returns null.
