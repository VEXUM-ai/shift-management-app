# Changelog

All notable changes to this project are documented in this file.

## [2.0.0] - 2025-10-08

### Highlights
- Hardened TypeScript typing across API responses and shared models.
- Added comprehensive validation and error messaging for members, locations,
  shifts, attendance, and salary endpoints.
- Improved frontend resiliency with loading states, error surfacing, and
  reusable helpers.
- Optimised performance through memoisation, parallel API requests, and tighter
  filtering logic.
- Expanded security with password hashing, session timeouts, input sanitation,
  and file-size enforcement.

### API & Backend
- Introduced `validate*` helpers for every serverless route with consistent HTTP
  status codes.
- Enhanced `_storage.ts` typing and return value annotations.
- Added duplicate detection, time validation, and richer error payloads for
  `members.ts`, `locations.ts`, `shifts.ts`, and `attendance.ts`.
- Generated salaries now round to two decimal places and report validation
  failures explicitly.

### Frontend
- Reworked enhanced components with explicit interfaces for `Location`, `Member`
  and shift rows.
- Added `handleApiError` utility, memoised selectors, and upload validation for
  logo files (size limits, MIME checks).
- Centralised loading and disabled states for bulk actions and form submission.

### Configuration & Tooling
- Documented Vercel build output and rewrites in `vercel.json`.
- Added dedicated `api/package.json` to capture serverless build dependencies.
- Expanded documentation (deployment, optimisation, authentication, UI/UX) to
  support onboarding and operations.

### Fixes
- Prevented invalid monthly filters and duplicate shift creation.
- Corrected working-hour calculations for attendance records.
- Improved user feedback when bulk operations partially fail.

## [1.0.0] - 2025-09-10

- Initial public release covering member/location management, shift scheduling,
  attendance tracking, payroll exports, and Slack notifications.
