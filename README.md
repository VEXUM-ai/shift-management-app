# Shift Management App

Modern shift planning, attendance tracking, and payroll management packaged as a
monorepo that runs on Vite/React in the frontend and Vercel serverless
functions in the backend.

## Feature Highlights

- Member management with profile details, access roles, and credential storage.
- Location management including hourly rates, travel allowances, and logo
  uploads per site.
- Shift scheduling with bulk upload, monthly history, CSV exports, and optional
  Slack notifications.
- Attendance tracking for clock-in/clock-out with automatic hour calculation and
  history views.
- Payroll summaries by member and location, including travel costs.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, jsPDF, CSS Modules.
- Backend: Node.js, TypeScript, Vercel serverless functions.
- Tooling: npm workspaces, concurrently, Vercel CLI.

## Repository Layout

```text
shift-management-app/
├── api/               # Serverless endpoints deployed via Vercel
├── backend/           # Node.js backend (shared logic and local dev server)
├── docs/              # Project documentation
├── frontend/          # React single-page application
├── package.json       # npm workspaces + shared scripts
└── vercel.json        # Deployment configuration
```

## Quick Start

```bash
# Install all workspace dependencies
npm install

# Start both frontend (Vite) and backend (Node) together
npm run dev
```

Individual workspaces can be driven with the workspace-aware scripts:

- `npm run dev:frontend` – start the Vite dev server on http://localhost:5173
- `npm run dev:backend` – start the backend HTTP server on http://localhost:3001

## Environment Variables

- Frontend: copy `frontend/.env.example` to `frontend/.env` and adjust
  `VITE_API_URL`/`VITE_ENABLE_BACKEND`.
- Backend: copy `backend/.env.example` to `backend/.env` and set the JWT secret,
  rate-limiting, and HTTPS configuration. Default ports assume the frontend runs
  on `5173`.

## Documentation

- `docs/getting-started.md` – cloning, local setup, troubleshooting tips.
- `docs/deployment.md` – Vercel configuration, environment variables, and
  release flow.
- `docs/authentication.md` – session model, password handling, and role-based
  access.
- `docs/backend.md` – serverless architecture, routes, and data contracts.
- `docs/optimizations.md` – performance, validation, and reliability work.
- `docs/ui-ux.md` – UX enhancements and design rationale.
- `CHANGELOG.md` – tracked release history.

## License

MIT
