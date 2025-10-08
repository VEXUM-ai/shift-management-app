# Optimisation Summary

This document captures the major optimisation passes applied to the project.

## Type Safety

- Introduced strict TypeScript interfaces across members, locations, shifts,
  attendance, and salary data.
- Eliminated most `any` usage by leaning on inference and shared model exports.
- Enforced typed HTTP responses to guarantee parity between frontend and API.

## Validation & Error Handling

- Added `validate*` helpers in every serverless route to guard against invalid
  payloads (dates, times, numeric ranges, duplicates).
- Normalised error payloads and HTTP status codes (200, 201, 400, 404, 409, 500)
  for predictable client behaviour.
- Surfaced descriptive error messages in the UI through a centralised
  `handleApiError` helper.

## Performance

- Memoised expensive selectors and derived data with `useMemo`.
- Memoised callbacks that depend on stable inputs using `useCallback`.
- Batched API requests with `Promise.allSettled` to parallelise bulk shift
  creation while maintaining granular error reporting.
- Reduced unnecessary re-renders by tightening component dependency arrays.

## Security

- Added password strength validation and SHA-256 hashing before persisting
  credentials (recommended to migrate to bcrypt on the backend for production).
- Sanitised user-facing input and enforced file size/type limits for logo
  uploads to curb abuse.
- Implemented JWT expiry checks and session invalidation after 24 hours.

## UX Improvements

- Consistent loading/disabling states on forms and bulk actions.
- Immediate validation feedback and inline messaging for common errors.
- Enhanced empty states, placeholders, and success/failure notifications to
  improve clarity.
