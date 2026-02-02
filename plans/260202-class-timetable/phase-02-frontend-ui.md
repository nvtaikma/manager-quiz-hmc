# Phase 02: Frontend UI
Status: ✅ Complete

## Objective
Create "Class Manager" interface in the Admin Dashboard.

## Requirements
1. **Class List Page**:
   - Route: `/classes`
   - Display grid/list of classes.
   - "Add Classes" Modal: Textarea to paste names (e.g. `["A", "B"]`).
   - "Delete" action.
2. **Class Detail & Timetable Page**:
   - Route: `/classes/[id]`
   - Display current timetable (Calendar view or List view).
   - "Update Timetable" Modal: Textarea to paste JSON.
   - Parse JSON client-side to validate before sending? (Optional, BE does it).
3. **Styling**:
   - Modern, clean, "glassmorphism" touches if applicable.
   - Use existing Tailwind tokens.

## Implementation Steps
1. [x] Update `src/contants/api.ts` with new endpoints.
2. [x] Create `src/app/classes/page.tsx` (List View).
3. [x] Create `src/app/classes/[id]/page.tsx` (Detail View).
4. [x] Create `src/components/classes/AddClassModal.tsx` & `ImportTimetableModal.tsx`.
5. [x] Implement API calls (using existing fetch wrapper or axios).
6. [x] Add navigation link in Sidebar/Header (if exists).

## Files to Create/Modify
- `FE/src/app/classes/page.tsx`
- `FE/src/app/classes/[id]/page.tsx`
- `FE/src/components/classes/*`
- `FE/src/contants/api.ts`

---
Next Phase: [Integration](./phase-03-integration.md)
