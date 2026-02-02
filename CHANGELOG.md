# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2026-02-02]
### Added
- **Class Management**:
    - Backend API: Bulk Create user (`POST /api/classes/bulk`).
    - Frontend: Class List Page (`/classes`) with search and add modal.
- **Timetable Management**:
    - Backend API: Import Timetable (`POST /api/classes/timetable/import`).
    - Frontend: Class Detail Page (`/classes/:id`) with timetable grid/list.
    - Frontend: Import Modal with JSON validation.
- **Security/Validation**:
    - Backend: Prevent importing timetable data if class names do not match the target endpoint.
    - Frontend: Warning and pre-check before sending import request.

### Fixed
- Fixed MongoDB Transaction error on standalone instances by switching to sequential `Delete` -> `Insert`.
