# IBM OnboardAI

**AI-Powered Employee Onboarding Assistant**
*IBM watsonx Hackathon Project*

---

## What Is This?

IBM OnboardAI is an enterprise-grade onboarding platform that guides employees from pre-joining paperwork to fully productive team member — with AI assistance at every step.

It replaces scattered emails, manual HR processes, and tribal knowledge with a single intelligent hub: personalized checklists, document management, access requests, learning resources, team visibility, and an AI chat assistant powered by IBM watsonx.

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or skip — it falls back to SQLite automatically)
- npm 9+

### 1 — Backend

```bash
cd server
cp .env.example .env        # Fill in your values
npm install
npm run dev
```

Server starts on `http://localhost:5000`.

### 2 — Frontend

```bash
cd client
npm install
npm run dev
```

Client starts on `http://localhost:5173`.

### 3 — Seed demo data

```bash
cd server
npm run migrate   # create all tables
npm run seed      # populate demo accounts
```

### 4 — Default Credentials

| Role | Email | Password | Stage |
|---|---|---|---|
| Admin | admin@ibm.com | Admin123 | — |
| Employee | aarav@ibm.com | Employee123 | PRE_JOINING |
| Employee | priya@ibm.com | Employee123 | ORIENTATION |
| Employee | rahul@ibm.com | Employee123 | FULLY_PRODUCTIVE |

---

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full system diagram, request lifecycle, and design decisions.

See [`DATABASE.md`](./DATABASE.md) for the full entity-relationship model and SQL schema.

See [`context.md`](./context.md) for the living project context (read before every change).

---

## Project Structure

```
watsonx-challenge/
├── client/          # React 18 + Vite frontend
├── server/          # Node.js + Express backend
├── shared/          # Shared constants (roles, stages, statuses)
├── ARCHITECTURE.md
├── DATABASE.md
├── context.md       # Living project context
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Auth | JWT + bcryptjs |
| Database | PostgreSQL (primary) / SQLite (fallback) |
| Real-time | Socket.IO |
| AI | IBM watsonx Assistant + watsonx AI (Granite) |
| Storage | Local disk → S3-compatible abstraction |

---

## IBM watsonx Integration

AI is fully abstracted behind `server/services/`:

- **`watsonxAssistant.js`** — Chat intelligence (mock now → IBM watsonx Assistant API)
- **`watsonxAI.js`** — Recommendations (rule-based now → IBM Granite foundation model)

The frontend never calls IBM APIs directly. Swap the implementation inside the service files without changing any other code.

---

## Development Phases

| Phase | Title | Status |
|---|---|---|
| 0 | Foundation — architecture, DB plan, context | ✅ Done |
| 1 | Backend — Express, DB, models, routes, seed | ✅ Done |
| 2 | Frontend — Vite, Tailwind, router, layout, auth pages | ⏳ |
| 3 | Employee Dashboard + Checklist + Documents | ⏳ |
| 4 | Admin Dashboard + Employee Management | ⏳ |
| 5 | AI Services + Chat UI | ⏳ |
| 6 | Real-time (Socket.IO) | ⏳ |
| 7 | Access Requests + Learning + Team | ⏳ |
| 8 | Polish, Animations, Production Hardening | ⏳ |

---

## Security

- JWT authentication with role-based access control
- bcrypt password hashing (saltRounds = 12)
- Parameterised SQL queries (no raw string interpolation)
- File type and size validation on every upload
- CORS restricted to known origins

> *"Documents are securely stored and accessible only to authorized users."*

---

## License

IBM Internal Hackathon Project — not for public distribution.
