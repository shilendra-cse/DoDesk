# DoDesk – Collaborative Workspace Tool

DoDesk is a full-stack task management and collaboration tool designed to help teams stay productive, organized, and efficient.

Inspired by tools like Notion, Trello, and Asana — but fully custom-built from scratch.

---

![Task List Preview](client/public/list_view_screenshot.png)
![Task Board Preview](client/public/board_view_screenshot.png)

## Features

### Authentication & Workspace Setup
- Email/password auth with email verification (Better Auth)
- Google OAuth sign-in (optional)
- Workspace creation with automatic admin assignment

### Workspace Management
- Create, switch, and list workspaces
- Invite members via email
- View all joined members within each workspace

### Issue Management
- Create, edit, and delete issues
- Set priority, due date, and status
- Assign issues to workspace members
- Real-time editing and state syncing

### Kanban Board (Drag & Drop)
- Built with `@hello-pangea/dnd`
- Issues grouped by status: `Pending`, `In Progress`, `Completed`
- Drag-and-drop to update status instantly

### Filtering & Sorting
- Filter issues by priority and status
- Sort by due date and priority
- Saved filters (Zustand)

### Inline Editing & Issue Drawer
- Edit issue title and description directly in the table
- Slide-in drawer for detailed view and editing
- Toast notifications for feedback

### UI & UX
- Next.js App Router with Tailwind CSS
- Radix UI components, dark theme
- Responsive layout with smooth modal and drawer animations

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, TanStack Query, Vitest |
| **Backend** | Node.js, Express 5, TypeScript, Prisma, PostgreSQL, Better Auth, Vitest |
| **Email** | Nodemailer (Gmail SMTP) |
| **CI/CD** | GitHub Actions, Docker, AWS ECS |

---

## Project Structure

```
DoDesk/
├── backend/          # Express API (port 5033)
├── client/           # Next.js frontend (port 3000)
├── scripts/          # Dev setup scripts
├── docs/             # Architecture and testing docs
└── package.json      # Root scripts (dev, test, ci, build)
```

---

## Prerequisites

- **Node.js 22** (matches CI)
- **npm**
- **Docker** (recommended) — used by `npm run setup` for local Postgres and by backend integration tests

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/shilendra-cse/DoDesk.git
cd DoDesk
```

### 2. Run the setup script

From the repo root:

```bash
npm run setup
```

This script (`scripts/dev-setup.sh`):
- Starts a Postgres 16 container (`dodesk-postgres` on port `5432`) if Docker is available
- Installs dependencies in `backend/` and `client/`
- Copies env templates if missing (create them manually — see below)
- Runs `prisma generate` and `prisma migrate dev`

### 3. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/dodesk
PORT=5033
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5033
BETTER_AUTH_SECRET=your-long-random-secret-at-least-32-chars
BETTER_AUTH_URL=http://localhost:5033

# Optional — Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Create `client/.env.local` (or `client/.env`):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5033
```

### 4. Start development servers

```bash
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5033](http://localhost:5033)
- Health check: [http://localhost:5033/health](http://localhost:5033/health)

---

## Scripts

All commands below are run from the **repo root** unless noted.

### Development

| Command | Description |
|---------|-------------|
| `npm run setup` | First-time setup (Docker Postgres, deps, migrations) |
| `npm run dev` | Start backend + client concurrently |
| `npm run dev:backend` | Backend only (`nodemon`) |
| `npm run dev:client` | Client only (`next dev`) |

### Build

| Command | Description |
|---------|-------------|
| `npm run build` | Build backend and client |
| `npm run build:backend` | Compile backend TypeScript → `backend/dist/` |
| `npm run build:client` | Next.js production build |

### Quality checks

| Command | Description |
|---------|-------------|
| `npm run lint` | ESLint on backend and client |
| `npm run typecheck` | TypeScript check on both packages |
| `npm run ci` | Full local CI pipeline (lint, typecheck, tests, build) |

### Tests

| Command | Description |
|---------|-------------|
| `npm test` | Backend unit tests + health integration test (no DB) |
| `npm run test:client` | Client unit tests (Vitest + jsdom) |
| `npm run test:coverage` | Backend unit/health tests with coverage |
| `npm run test:client:coverage` | Client tests with coverage |
| `npm run test:all` | Backend full suite including DB integration tests |
| `npm run test:all:coverage` | Full backend suite with coverage thresholds |
| `npm run test:watch` | Backend tests in watch mode |

### Backend-only scripts (`cd backend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with nodemon |
| `npm run start` | Run compiled `dist/server.js` |
| `npm run test:db:up` | Start test Postgres via Docker Compose (port `5433`) |
| `npm run test:db:down` | Stop test Postgres container |
| `npm run test:db:migrate` | Apply Prisma migrations to the test database |

### Client-only scripts (`cd client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Vitest watch mode |

---

## Testing

Tests use **Vitest**. See `docs/testing-plan.md` for the full testing strategy.

### Backend

- **Unit tests** (`backend/tests/unit/`) — schemas, services, middleware, utilities. No database required.
- **Integration tests** (`backend/tests/integration/`) — HTTP route tests against a real Postgres database.
- **Fast default** — `npm test` runs unit tests plus the health route check only.
- **Full suite** — `npm run test:all` sets `VITEST_WITH_DB=1` and runs all integration tests.

To run integration tests locally:

```bash
cd backend
npm run test:db:up
npm run test:db:migrate
npm run test:all
```

Optional: copy `backend/.env.test.example` to `backend/.env.test` for custom test env values. Defaults are set in `backend/tests/helpers/setup.ts`.

Coverage thresholds (full DB suite): 85% lines/branches, 82% functions, 84% statements.

### Client

- **Unit tests** (`client/tests/unit/`) — hooks, stores, and `lib/` utilities.
- Uses **jsdom**, **Testing Library**, and **Vitest**.
- Coverage thresholds: 80% across lines, branches, functions, and statements.

```bash
npm run test:client
npm run test:client:coverage
```

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes and PRs that touch `backend/`, `client/`, or root `package.json`:

- **Backend job** — lint, typecheck, Prisma migrate, full test suite with coverage, build (Postgres 16 service)
- **Client job** — lint, typecheck, tests with coverage, build

Run the same checks locally:

```bash
npm run ci
```

Deploy workflows (`deploy-backend.yml`, `deploy-frontend.yml`) are manual (`workflow_dispatch`) and target AWS ECS.

---

## Database

Migrations are managed with **Prisma**:

```bash
cd backend
npx prisma migrate dev      # apply migrations in development
npx prisma generate         # regenerate client after schema changes
npx prisma studio           # browse data in a GUI
```

---

## API Overview

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /test-db` | Database connectivity check |
| `/api/auth/*` | Better Auth routes (sign-in, sign-up, OAuth) |
| `/api/*` | REST resources (workspaces, issues, teams, comments, filters) |

---

## License

ISC
