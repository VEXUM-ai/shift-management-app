# Backend Architecture

The backend codebase lives in two locations:

- `api/` – Serverless functions bundled by Vercel and exposed under `/api`.
- `backend/` – A Node.js/Express server used for local development, integration
  tests, and shared business logic.

Both layers share TypeScript models so the request/response contracts remain
consistent.

## Directory Structure

```text
backend/src
├── database/        # In-memory persistence helpers
├── middleware/      # Auth guards, rate limiting, error translation
├── routes/          # Express routers for shifts, attendance, salary, auth
├── types/           # Shared interfaces (Member, Location, Shift, etc.)
└── utils/           # JWT helpers, password hashing, general utilities
```

The serverless `api/` directory mirrors these features with lightweight handler
files (`members.ts`, `locations.ts`, `shifts.ts`, `attendance.ts`, `salary.ts`,
`slack.ts`).

## Core Concepts

- **Storage Layer:** `_storage.ts` emulates persistence for serverless functions
  and is backed by simple JSON arrays. When moving to a database, swap this for
  a repository implementation.
- **Validation:** Each route exposes a `validate*` helper that guards against
  invalid payloads (dates, times, numeric ranges, duplicates).
- **Error Handling:** Middleware returns consistent JSON responses with
  `message`, `code`, and optional `details` fields.
- **Authentication:** JWT utilities (`utils/jwt.ts`) issue and verify tokens.
  They rely on environment variables documented in `backend/.env.example`.
- **Rate Limiting:** `middleware/rateLimiter.ts` keeps endpoints safe from
  bursts. Tune the window and max request values via environment configuration.

## Adding New Endpoints

1. Define request/response interfaces in `backend/src/types`.
2. Implement validation logic (either inline or as a helper).
3. Create the Express route (and mirror it under `api/` if required).
4. Export the handler from `server.ts`.
5. Add automated tests if you introduce significant logic.

Keep serverless handlers stateless—fetch everything they need from the request
and the storage layer rather than relying on shared globals.
