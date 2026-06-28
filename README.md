# TaskFlow Realtime

Real-time task management SaaS with secure authentication, PostgreSQL persistence, and instant WebSocket sync across clients.

## Overview

TaskFlow Realtime is a full-stack task management application built for teams that need a fast, reliable way to create, track, and complete work. Users sign in securely, manage personal task boards, and see updates in real time without refreshing the page.

## Features

- **Authentication** — Email/password registration and JWT login with protected routes
- **Task management** — Create, edit, delete, and filter tasks by status (`PENDING`, `IN_PROGRESS`, `COMPLETED`)
- **Real-time sync** — Socket.IO broadcasts create, update, and delete events to connected clients
- **Health monitoring** — `GET /api/health` endpoint with a live status badge in the UI
- **Environment-driven config** — No hardcoded URLs; ready for local, staging, and production

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, React Hook Form, Zod, Axios, Socket.IO Client |
| Backend | NestJS, TypeScript, Prisma, PostgreSQL, JWT, Passport, bcrypt, Socket.IO |
| Deployment | Vercel (frontend), Render (backend + PostgreSQL) |

## Architecture

```text
┌─────────────────┐       REST (Axios)        ┌──────────────────┐
│  Next.js 16     │ ─────────────────────────▶│  NestJS API      │
│  App Router     │                           │  /api prefix     │
│  React + RHF    │◀──── Socket.IO events ────│  Socket.IO       │
└─────────────────┘                           └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │  PostgreSQL      │
                                              │  (Prisma ORM)    │
                                              └──────────────────┘
```

## Project Structure

```text
taskflow-realtime/
├── backend/          # NestJS API, Prisma, Socket.IO gateway
├── frontend/         # Next.js App Router client
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (local or hosted)

### Installation

```bash
git clone https://github.com/artyomwhite/taskflow-realtime.git
cd taskflow-realtime

cd backend && npm install
cd ../frontend && npm install
```

### Environment Variables

#### Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT access tokens |
| `PORT` | API port (default `10000`) |
| `CORS_ORIGIN` | Allowed frontend origin (must match deployed URL) |

#### Frontend (`frontend/.env.local`)

```bash
cp frontend/.env.local.example frontend/.env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL including `/api` suffix |

The frontend reads the API URL exclusively from `NEXT_PUBLIC_API_URL` via `lib/env.ts`.

### Database

```bash
cd backend
npx prisma migrate deploy
```

For local iterative schema changes:

```bash
npx prisma migrate dev
```

### Run Locally

**Backend:**

```bash
cd backend
npm run start:dev
```

API: `http://<host>:<PORT>/api`  
Health: `http://<host>:<PORT>/api/health`

**Frontend:**

```bash
cd frontend
npm run dev
```

Open the URL shown in the terminal (typically port `3000`).

### Production Build

```bash
cd backend && npm run build && npm run start:prod
cd frontend && npm run build && npm run start
```

## Deployment

### Render (backend + PostgreSQL)

1. Create a Render PostgreSQL instance and copy `DATABASE_URL`.
2. Create a Web Service from the `backend/` directory.
3. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT=10000`, `CORS_ORIGIN`.
4. Build command: `npm install && npm run build`
5. Start command: `npm run start:prod`
6. Run migrations: `npx prisma migrate deploy`

### Vercel (frontend)

1. Import the `frontend/` directory.
2. Set `NEXT_PUBLIC_API_URL` to your Render API URL with `/api` suffix.
3. Deploy.

Ensure `CORS_ORIGIN` on the backend exactly matches your Vercel frontend origin.

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | Service health |
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Obtain JWT |
| `GET` | `/api/tasks` | Yes | List user tasks |
| `POST` | `/api/tasks` | Yes | Create task |
| `GET` | `/api/tasks/:id` | Yes | Get task |
| `PATCH` | `/api/tasks/:id` | Yes | Update task |
| `DELETE` | `/api/tasks/:id` | Yes | Delete task |

## Socket Events

| Event | Payload | Description |
|-------|---------|-------------|
| `task:created` | `Task` | New task for connected user |
| `task:updated` | `Task` | Updated task |
| `task:deleted` | `{ id, userId }` | Deleted task id |

Clients authenticate the socket handshake with `{ userId }`.

## License

MIT
