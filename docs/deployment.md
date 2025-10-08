# Deployment Guide

The project is optimised for Vercel. The `api/` directory is deployed as
serverless functions, while the frontend is served as a static React
application. The `backend/` workspace is primarily for local development and
shared business logic.

## 1. Prerequisites

- Vercel account with access to the target organisation.
- Vercel CLI (`npm install -g vercel`) or the Vercel dashboard.
- All environment variables configured (see below).

## 2. Build Locally

```bash
npm install
npm run build
```

The build command compiles both the frontend and backend workspaces, ensuring
TypeScript types and lint checks run before deploying.

## 3. Link the Project

```bash
vercel login
vercel link
```

Linking associates the local repository with the remote Vercel project so that
`vercel deploy` pushes the correct code.

## 4. Environment Variables

Set the following variables in Vercel (`vercel env edit` or the dashboard).

### Frontend

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL for API requests (e.g. `https://<project>.vercel.app/api`). |
| `VITE_ENABLE_BACKEND` | `true` to enable backend requests (default). |

### Serverless API

| Variable | Description |
| --- | --- |
| `JWT_SECRET` | Secret used for signing access tokens. |
| `JWT_EXPIRES_IN` | Access token lifetime (e.g. `24h`). |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (e.g. `7d`). |
| `CORS_ORIGIN` | Allowed origin for browser requests (usually the frontend URL). |
| `RATE_LIMIT_WINDOW_MS` | Rate limiter window (e.g. `900000`). |
| `RATE_LIMIT_MAX_REQUESTS` | Allowed requests within the window (e.g. `100`). |
| `BCRYPT_ROUNDS` | Cost factor for password hashing when running on Node. |
| `SLACK_WEBHOOK_URL` | Optional: Slack incoming webhook for shift notifications. |

### Optional HTTPS Settings

| Variable | Description |
| --- | --- |
| `SSL_KEY_PATH` | Path to TLS key (if self-hosting). |
| `SSL_CERT_PATH` | Path to TLS certificate (if self-hosting). |
| `ENABLE_HTTPS` | `true` to enforce HTTPS when running on your own infrastructure. |

## 5. Deploy

```bash
vercel deploy --prod
```

The default configuration in `vercel.json` wires the frontend build output and
exposes the functions under `/api`.

## 6. Post-Deployment Checks

- Open the production URL and confirm the app loads without errors.
- Create a test member/location and run through the shift flow.
- Verify Slack notifications (if configured) and JWT expiry behaviour.
- Monitor the Vercel dashboard for function cold start times and adjust the
  configuration if required.
