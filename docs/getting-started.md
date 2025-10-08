# Getting Started

This project uses npm workspaces to manage both the React frontend and the
serverless backend. The following steps assume you already have Node.js 18+
installed.

## Prerequisites

- Node.js 18 or later (LTS recommended).
- npm 9 or later (ships with recent Node releases).
- Optional: Vercel CLI if you plan to run the serverless functions locally.

## Installation

```bash
git clone <your-fork-url>
cd shift-management-app
npm install
```

Running `npm install` from the repository root installs dependencies for the
root workspace, `frontend`, and `backend` packages.

## Development Workflow

Start both the Vite dev server and the backend with a single command:

```bash
npm run dev
```

The shortcut scripts are also exposed if you prefer to run them independently:

- `npm run dev:frontend` – serves the React app on http://localhost:5173.
- `npm run dev:backend` – serves the Node backend on http://localhost:3001.

Open the browser at `http://localhost:5173` to interact with the application.

## Environment Variables

Copy the example files into place before booting either workspace:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Update any values as required (API origins, JWT secret, Slack webhooks, etc.).

## Troubleshooting

- **Windows network drives (e.g. Google Drive):** npm install can struggle on
  sync folders. If you hit issues, clone the repository to a local drive (e.g.
  `C:\Projects\shift-management-app`) before installing dependencies.
- **Ports already in use:** adjust `PORT` in `backend/.env` and
  `VITE_API_URL` in `frontend/.env` to match.
- **API disabled locally:** set `VITE_ENABLE_BACKEND=true` in the frontend env
  file to make sure requests go to your local backend.
