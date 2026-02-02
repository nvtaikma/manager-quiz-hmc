# Phase 01: Backend Core (Models & APIs)
Status: ✅ Complete

## Objective
Implement storage and APIs for Classes and Timetables.

## Requirements
1. **Class Model**: Store unique class names.
2. **Timetable Model**: Store schedule details (Date, Room, Teacher, etc.) linked to a Class.
3. **Bulk Class Import API**: Receive `string[]`, add new ones, ignore existing.
4. **Timetable Import API**: For a given class, **DELETE** all existing timetable entries and **INSERT** new ones from JSON.
5. **Validation**: Ensure `ngay_hoc` is parsed correctly (Input "DD/MM/YYYY").

## Implementation Steps
1. [x] Define `Class` schema in `src/modules/class/class.models.ts`.
2. [x] Define `Timetable` schema in `src/modules/class/timetable.models.ts`.
3. [x] Implement `ClassService.bulkCreate` and `ClassService.getAll`.
4. [x] Implement `TimetableService.replaceSchedule` (Transaction/Atomic operation if possible, or Delete then Insert).
5. [x] Create `ClassController` methods.
6. [x] Register routes in `src/modules/class/class.route.ts` and `src/routes/index.ts`.

## Files to Modify/Create
- `src/modules/class/class.models.ts` (Class Schema)
- `src/modules/class/timetable.models.ts` (Timetable Schema)
- `src/modules/class/class.service.ts` (Logic)
- `src/modules/class/class.controller.ts` (Handlers)
- `src/modules/class/class.route.ts` (Endpoints)
- `src/routes/index.ts` (Mount route)

## API Contract
### 1. classes/bulk-check
- **POST**
- **Body**: `{ "classes": ["Class A", "Class B"] }`
- **Logic**: Find existing -> Filter -> Insert missing.

### 2. classes/:id/timetable
- **POST**
- **Body**: Array of Timetable objects.
- **Logic**: `deleteMany({ classId })` -> `insertMany(body)`.

---
Next Phase: [Frontend UI](./phase-02-frontend-ui.md)
