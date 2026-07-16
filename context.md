# IBM OnboardAI — Project Context

> **READ THIS FILE BEFORE EVERY CHANGE. UPDATE THIS FILE AFTER EVERY CHANGE.**

---

## Project Overview

**IBM OnboardAI** is an enterprise AI-powered Employee Onboarding Assistant built for the IBM watsonx Hackathon.

It solves fragmented onboarding by centralizing every step — documents, tasks, access requests, learning resources, and AI guidance — into a single intelligent platform.

---

## Current Phase

**Phase 1 — Backend Foundation** ✅ Complete  
*Completed: 2025-07-16*

### Phase 1 Features Implemented

- PostgreSQL primary / SQLite fallback database connection with automatic failover
- Full schema applied via `server/db/schema.sql` (7 tables, indexes, FK constraints)
- Migration runner: `npm run migrate`
- All 7 database models with parameterised queries (engine-agnostic)
- All 8 controllers with input validation and error handling
- All 8 route files with JWT auth + RBAC middleware
- AI service abstraction: `watsonxAssistant.js` (mock chat) + `watsonxAI.js` (rule-based recommendations)
- Socket.IO handler with JWT authentication and per-employee rooms
- Global error handler middleware
- File upload middleware (Multer, MIME validation, 10MB limit)
- Phase 1 seed: IBM Admin + 3 demo employees with rich data (checklist, docs, tasks, access requests)
- `server/utils/constants.js` — single source of truth for all enumerations

**Next Phase: Phase 2 — Frontend Foundation (Vite, Tailwind, Router, Auth pages, Layout)**

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Real-time | Socket.IO (client + server) |
| Backend | Node.js + Express.js |
| Auth | JWT + bcryptjs |
| DB Primary | PostgreSQL (via `pg`) |
| DB Fallback | SQLite (via `better-sqlite3@11.10.0`) |
| File Storage | Local (disk) — S3-compatible abstraction layer ready |
| AI Services | IBM watsonx Assistant (mock) + IBM watsonx AI / Granite (rule-based mock) |
| Node Version | ≥ 18 (tested on v24.18.0) |

---

## User Roles

### EMPLOYEE
Pre-joining:
- Create account, upload documents, view offer letter, accept terms, ask AI questions

Post-joining:
- View personalized checklist, track progress, configure system setup
- Request application access, view learning resources, view team info
- Receive AI recommendations, chat with AI assistant

### ADMIN
- Manage employees, view onboarding progress, review documents
- Assign managers/buddies, create tasks, monitor completion
- Update onboarding workflow

---

## Project Folder Structure

```
watsonx-challenge/
├── client/                         # React frontend (Vite) — Phase 2+
│   ├── src/
│   │   ├── api/                    auth · employee · admin · chat · documents
│   │   ├── components/
│   │   │   ├── layout/             AppLayout · Sidebar · Topbar
│   │   │   ├── ui/                 Button · Card · Badge · Modal · Input · Spinner · ProgressBar · Notification
│   │   │   └── shared/             ProtectedRoute · PageTransition
│   │   ├── hooks/                  useAuth · useSocket · useNotifications
│   │   ├── pages/
│   │   │   ├── auth/               Login · Signup
│   │   │   ├── employee/           Dashboard · Checklist · Documents · AccessRequests · Learning · Team · Chat
│   │   │   └── admin/              Dashboard · Employees · EmployeeDetail · Documents · Tasks
│   │   └── store/                  AuthContext · NotificationContext
│   └── src/utils/                  constants · helpers
│
├── server/                         # Node.js + Express backend ✅ Phase 1 Complete
│   ├── config/
│   │   ├── database.js             # PG primary / SQLite fallback (auto-detect)
│   │   └── constants.js            # Re-exports shared + adds DEFAULT_CHECKLIST
│   ├── controllers/
│   │   ├── authController.js       # register, login, getMe
│   │   ├── employeeController.js   # getProfile, updateProfile, acceptOffer, getRecommendations
│   │   ├── adminController.js      # listEmployees, getEmployee, updateEmployee, createEmployee, getStats
│   │   ├── documentController.js   # getDocuments, uploadDocument, verifyDocument, deleteDocument
│   │   ├── checklistController.js  # getChecklist, markComplete, markIncomplete, addItem
│   │   ├── taskController.js       # getMyTasks, updateTaskStatus, createTask, getAllTasks
│   │   ├── accessController.js     # getMyRequests, createRequest, reviewRequest, getPendingRequests
│   │   └── chatController.js       # getChatHistory, sendMessage, clearHistory
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification
│   │   ├── roleCheck.js            # RBAC factory
│   │   ├── upload.js               # Multer + MIME + size validation
│   │   └── errorHandler.js         # Global error handler
│   ├── models/
│   │   ├── User.js                 findById · findByEmail · create · findAll
│   │   ├── Employee.js             findById · findByUserId · create · update · findAll · countByStage
│   │   ├── Document.js             findById · findByEmployeeId · create · updateStatus · findPending · delete
│   │   ├── ChecklistItem.js        findByEmployeeId · create · bulkCreate · markComplete · markIncomplete · getProgress
│   │   ├── Task.js                 findByEmployeeId · findById · create · updateStatus · findAllForAdmin
│   │   ├── AccessRequest.js        findByEmployeeId · findById · create · updateStatus · findPending
│   │   └── ChatLog.js              findByEmployeeId · create · clearByEmployeeId
│   ├── routes/
│   │   ├── auth.js                 POST /register · POST /login · GET /me
│   │   ├── employee.js             GET /profile · PATCH /profile · POST /accept-offer · GET /recommendations
│   │   ├── admin.js                CRUD employees · stats · tasks · access reviews · doc verification
│   │   ├── documents.js            GET / · POST /upload · DELETE /:id
│   │   ├── checklist.js            GET / · PATCH /:id/complete · PATCH /:id/incomplete
│   │   ├── tasks.js                GET / · PATCH /:id/status
│   │   ├── access.js               GET / · POST /
│   │   └── chat.js                 GET /history · POST /message · DELETE /history
│   ├── services/
│   │   ├── watsonxAssistant.js     Mock chat (12 intents, keyword matching, suggestions)
│   │   └── watsonxAI.js            Rule-based recommendations (stage + progress nudges)
│   ├── socket/
│   │   └── socketHandler.js        JWT auth · employee rooms · admin room · event handlers
│   ├── utils/
│   │   └── constants.js            ← NEW: All enumerations, helpers, API response formatters
│   ├── db/
│   │   ├── schema.sql              7 tables, indexes, FK constraints (PG + SQLite compatible)
│   │   ├── migrate.js              npm run migrate
│   │   └── seed.js                 Legacy seed (admin@onboardai.com + jane.doe@onboardai.com)
│   ├── seed/
│   │   └── seed.js                 ← NEW: Phase 1 seed (admin@ibm.com + 3 IBM employees)
│   ├── uploads/                    Local file storage (gitignored)
│   ├── .env.example
│   ├── index.js                    Express + Socket.IO entrypoint
│   └── package.json
│
├── shared/
│   └── constants.js                Shared constants (roles, stages, statuses, helpers)
│
├── context.md                      ← THIS FILE
├── ARCHITECTURE.md
├── DATABASE.md
└── README.md
```

---

## Phase Log

| Phase | Title | Status | Date |
|---|---|---|---|
| 0 | Foundation (architecture, structure, DB plan, context) | ✅ Done | 2025-07-16 |
| 1 | Backend Foundation (Express, DB, Auth, Models, Routes, Seed) | ✅ Done | 2025-07-16 |
| 2 | Frontend Foundation (Vite, Tailwind, Router, Layout, Auth pages) | ⏳ Pending | — |
| 3 | Employee Dashboard + Checklist + Documents | ⏳ Pending | — |
| 4 | Admin Dashboard + Employee Management | ⏳ Pending | — |
| 5 | AI Services (watsonxAssistant + watsonxAI) + Chat UI | ⏳ Pending | — |
| 6 | Real-time (Socket.IO) | ⏳ Pending | — |
| 7 | Access Requests + Learning + Team pages | ⏳ Pending | — |
| 8 | Polish, Animations, Production Hardening | ⏳ Pending | — |

---

## Database Schema (7 Tables)

| Table | Key Columns | Notes |
|---|---|---|
| `users` | id, name, email, password_hash, role, created_at | role: employee \| admin |
| `employees` | id, user_id, department, designation, manager, buddy, joining_date, onboarding_stage, offer_accepted, os_type, status | stage: PRE_JOINING → FULLY_PRODUCTIVE |
| `documents` | id, employee_id, document_name, document_type, file_path, file_size_kb, mime_type, verification_status | status: pending \| verified \| rejected |
| `checklist_items` | id, employee_id, title, category, priority, completed, completed_at, order_index, created_at | priority: high \| medium \| low |
| `tasks` | id, employee_id, title, assigned_by, status, deadline, created_at, updated_at | status: pending \| in_progress \| completed \| overdue |
| `access_requests` | id, employee_id, application_name, reason, status, approved_by, reviewed_at | status: pending \| approved \| rejected |
| `chat_logs` | id, employee_id, sender, message, intent, timestamp | sender: user \| assistant |

### Onboarding Stage Machine
```
PRE_JOINING → ORIENTATION → SYSTEM_SETUP → TEAM_INTEGRATION → FULLY_PRODUCTIVE
```
Stage aliases (for seed/input convenience):
- `not_started` → `PRE_JOINING`
- `in_progress`  → `ORIENTATION`
- `completed`    → `FULLY_PRODUCTIVE`

---

## API Endpoints (Phase 1)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create new account |
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/auth/me` | JWT | Current user + employee profile |
| GET | `/api/employee/profile` | employee | Own employee profile |
| PATCH | `/api/employee/profile` | employee | Update profile fields |
| POST | `/api/employee/accept-offer` | employee | Accept offer letter |
| GET | `/api/employee/recommendations` | employee | AI recommendations |
| GET | `/api/checklist` | employee | Checklist + progress |
| PATCH | `/api/checklist/:id/complete` | employee | Mark item complete |
| PATCH | `/api/checklist/:id/incomplete` | employee | Mark item incomplete |
| GET | `/api/documents` | employee | Own documents |
| POST | `/api/documents/upload` | employee | Upload document |
| DELETE | `/api/documents/:id` | employee/admin | Delete document |
| GET | `/api/tasks` | employee | Own tasks |
| PATCH | `/api/tasks/:id/status` | employee | Update task status |
| GET | `/api/access` | employee | Own access requests |
| POST | `/api/access` | employee | Submit access request |
| GET | `/api/chat/history` | employee | Chat history |
| POST | `/api/chat/message` | employee | Send message to AI |
| DELETE | `/api/chat/history` | employee | Clear chat |
| GET | `/api/admin/employees` | admin | List all employees |
| POST | `/api/admin/employees` | admin | Create employee |
| GET | `/api/admin/employees/:id` | admin | Employee detail |
| PATCH | `/api/admin/employees/:id` | admin | Update employee |
| GET | `/api/admin/stats` | admin | Platform statistics |
| GET | `/api/admin/tasks` | admin | All tasks |
| POST | `/api/admin/tasks` | admin | Assign task |
| GET | `/api/admin/access/pending` | admin | Pending access requests |
| PATCH | `/api/admin/access/:id` | admin | Approve/reject access |
| GET | `/api/admin/documents/pending` | admin | Pending document review |
| PATCH | `/api/admin/documents/:id/verify` | admin | Verify/reject document |
| GET | `/api/health` | Public | Health check |

---

## Socket.IO Events

| Event | Direction | Payload |
|---|---|---|
| `joinRoom` | Client → Server | `{ employeeId }` |
| `employeeUpdated` | Server → Employee | `{ type, data }` |
| `taskAssigned` | Server → Employee | `{ task }` |
| `documentApproved` | Server → Employee | `{ document }` |
| `notification` | Server → Employee | `{ title, message, type }` |
| `adminAlert` | Server → Admin room | `{ employeeId, event }` |

---

## Demo Accounts (Phase 1 Seed)

| Role | Email | Password | Stage | Notes |
|---|---|---|---|---|
| Admin | admin@ibm.com | Admin123 | — | Full admin access |
| Employee | aarav@ibm.com | Employee123 | PRE_JOINING | Not started, no documents |
| Employee | priya@ibm.com | Employee123 | ORIENTATION | In progress, 5/10 checklist done, 2 docs, 2 access requests |
| Employee | rahul@ibm.com | Employee123 | FULLY_PRODUCTIVE | 12/12 complete, 3 docs verified, all access approved |

---

## Key Design Decisions

1. **AI abstraction** — Frontend never calls IBM APIs. All AI goes through `server/services/`.
2. **DB abstraction** — `server/config/database.js` tries PostgreSQL first, falls back to SQLite. Same `query()` interface.
3. **Storage abstraction** — `server/middleware/upload.js` wraps Multer; controllers never call `fs` directly.
4. **Role guard** — `ProtectedRoute.jsx` + `roleCheck.js` middleware enforce role boundaries at every layer.
5. **Real-time** — Socket.IO emits events to `employee:<id>` rooms when admin actions affect an employee.
6. **Design system** — IBM Carbon-inspired: IBM Blue (`#0F62FE`), neutral grays, IBM Plex Sans.
7. **Constants** — `server/utils/constants.js` is the single source of truth. Never hardcode status strings.
8. **RETURNING clause** — SQLite query router detects `RETURNING` keyword and uses `.all()` to return inserted rows.

---

## Environment Variables (server/.env)

```
PORT=5000
NODE_ENV=development
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d

# PostgreSQL (primary — leave blank to use SQLite)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onboardai
DB_USER=postgres
DB_PASSWORD=<password>

# SQLite fallback
SQLITE_PATH=./db/onboardai.db

# File storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# CORS
CLIENT_ORIGIN=http://localhost:5173

# IBM watsonx (Phase 5+)
WATSONX_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_ASSISTANT_ID=
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

---

## Commands

```bash
# Install dependencies
cd server && npm install

# Apply schema (create tables)
npm run migrate

# Seed Phase 1 demo data
npm run seed

# Start dev server (with hot reload)
npm run dev

# Start production server
npm start
```

---

## Known Issues

- `better-sqlite3` requires native build; on Node 24 use `npm approve-scripts better-sqlite3` before install.
- The SQLite fallback does not support multi-statement transactions across models. For production, PostgreSQL is required.
- `server/db/seed.js` (legacy) uses `admin@onboardai.com`. The Phase 1 canonical seed is `server/seed/seed.js` using `admin@ibm.com`.

---

## Notes

- All API responses use `{ success, data, message }` envelope.
- Passwords hashed with bcryptjs, saltRounds = 12.
- JWT payload: `{ id, email, role }`.
- File uploads validated for MIME type (PDF, PNG, JPG, DOCX) and size (≤ 10 MB).
- Always import constants from `server/utils/constants.js` in new server code.
