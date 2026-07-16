# IBM OnboardAI — Architecture Plan

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          IBM OnboardAI Platform                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    CLIENT  (React + Vite)                          │    │
│  │                                                                    │    │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────────┐  │    │
│  │  │Auth Pages│  │Employee Pages│  │Admin Pages│  │Shared UI    │  │    │
│  │  │Login     │  │Dashboard     │  │Dashboard  │  │Layout       │  │    │
│  │  │Signup    │  │Checklist     │  │Employees  │  │Sidebar      │  │    │
│  │  │          │  │Documents     │  │Tasks      │  │Topbar       │  │    │
│  │  │          │  │Chat (AI)     │  │Documents  │  │Notifications│  │    │
│  │  │          │  │Team / Learn  │  │           │  │             │  │    │
│  │  └──────────┘  └──────────────┘  └──────────┘  └─────────────┘  │    │
│  │                                                                    │    │
│  │  ┌──────────────────────┐   ┌────────────────────────────────┐   │    │
│  │  │   API Layer (Axios)  │   │  Socket.IO Client              │   │    │
│  │  │   /api/auth          │   │  on('employeeUpdated')         │   │    │
│  │  │   /api/employee      │   │  on('notification')            │   │    │
│  │  │   /api/admin         │   │  on('taskAssigned')            │   │    │
│  │  │   /api/chat          │   └────────────────────────────────┘   │    │
│  │  └──────────────────────┘                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                          │ HTTP/REST                │ WS                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     SERVER  (Node.js + Express)                     │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │   │
│  │  │  Middleware  │  │    Controllers   │  │      Services        │  │   │
│  │  │  JWT Auth    │  │  authController  │  │ watsonxAssistant.js  │  │   │
│  │  │  roleCheck   │  │  empController   │  │  (mock → real)       │  │   │
│  │  │  upload      │  │  adminController │  │                      │  │   │
│  │  │  errorHandler│  │  chatController  │  │ watsonxAI.js         │  │   │
│  │  └─────────────┘  │  docController   │  │  (rules → Granite)   │  │   │
│  │                    └──────────────────┘  └──────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌──────────────────┐  ┌──────────────────────────────────────┐   │   │
│  │  │  Socket Handler  │  │   Storage Service                    │   │   │
│  │  │  socketHandler.js│  │   (local disk → S3 abstraction)      │   │   │
│  │  └──────────────────┘  └──────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          │                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │               DATABASE  (PostgreSQL primary / SQLite fallback)      │   │
│  │                                                                     │   │
│  │   users │ employees │ documents │ checklist_items │ tasks           │   │
│  │   access_requests │ chat_logs                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Lifecycle

### 1. Authentication Flow

```
Client  →  POST /api/auth/login  →  authController
           Validates credentials (bcrypt compare)
           Issues JWT { id, email, role }
           Returns token + user profile
Client stores token in memory / httpOnly cookie
All subsequent requests: Authorization: Bearer <token>
Server middleware/auth.js verifies token on every protected route
```

### 2. Protected API Call

```
Client Axios instance (with interceptor)
  → Attaches Bearer token
  → POST /api/employee/checklist
  → auth.js middleware: verifies JWT, attaches req.user
  → roleCheck.js middleware: confirms role === 'employee'
  → checklistController: executes business logic
  → Model: executes SQL query
  → Response: { success: true, data: [...], message: '' }
```

### 3. AI Chat Flow

```
Client  →  POST /api/chat/message  →  chatController
           Saves message to chat_logs
           Calls watsonxAssistant.js service
           (mock: pattern-matched responses)
           (future: IBM watsonx Assistant API)
           Returns AI response
           Saves response to chat_logs
           Returns { success, data: { message, suggestions } }
```

### 4. Real-time Notification Flow

```
Admin assigns task via POST /api/admin/tasks
  → taskController creates task in DB
  → Emits Socket.IO event: io.to(employeeSocketId).emit('employeeUpdated', payload)
  → Employee dashboard receives event
  → UI updates checklist/task count without page refresh
  → Notification toast appears
```

### 5. File Upload Flow

```
Client  →  POST /api/documents/upload (multipart/form-data)
           Multer middleware validates:
             - file type (PDF, PNG, JPG, DOCX)
             - file size (≤ 10MB)
           Storage service saves to ./uploads/<employee_id>/
           documentController saves metadata to documents table
           Response: { success, data: { document } }
```

---

## AI Services Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    AI Abstraction Layer                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  watsonxAssistant.js          watsonxAI.js               │
│  ─────────────────            ───────────                │
│  Purpose: Chat                Purpose: Recommendations   │
│                                                          │
│  Phase 1 (now):               Phase 1 (now):             │
│  Mock responses based         Rule-based engine:         │
│  on keyword matching          - Stage-based suggestions  │
│  Simulates NLP intent         - Priority task ranking    │
│                               - Completion nudges        │
│  Phase 2 (future):            Phase 2 (future):          │
│  IBM watsonx Assistant        IBM Granite-13B-chat       │
│  REST API integration         via watsonx.ai API         │
│                                                          │
│  Interface contract is FIXED — swap internals only       │
└──────────────────────────────────────────────────────────┘
```

### `watsonxAssistant.js` Interface

```js
// sendMessage(employeeId, message, context) → { reply, suggestions, intent }
module.exports = { sendMessage }
```

### `watsonxAI.js` Interface

```js
// getRecommendations(employeeProfile) → { recommendations: [] }
// analyzeSentiment(text) → { sentiment, score }
module.exports = { getRecommendations, analyzeSentiment }
```

---

## Database Strategy

- **Primary**: PostgreSQL (production-grade, used when `DB_HOST` resolves)
- **Fallback**: SQLite (zero-config dev/demo mode, same SQL dialect via abstraction)
- `server/config/database.js` detects which DB to use at startup and exports a unified `query()` function
- Schema is in `server/db/schema.sql` (PostgreSQL dialect, compatible with SQLite for core tables)

---

## Storage Strategy

- **Phase 1**: Local disk — `./uploads/<employee_id>/<timestamp>_<filename>`
- **Phase 2**: S3-compatible (AWS S3, IBM Cloud Object Storage, MinIO)
- `server/services/storageService.js` wraps file I/O — controllers never call `fs` directly

---

## Security Architecture

| Concern | Implementation |
|---|---|
| Authentication | JWT (7d expiry, RS256 in production) |
| Password storage | bcryptjs, saltRounds = 12 |
| Role enforcement | `roleCheck.js` middleware on every admin route |
| Input validation | express-validator on all POST/PUT routes |
| File validation | Multer + MIME type allowlist |
| SQL injection | Parameterized queries only |
| XSS | React escapes by default; Content-Security-Policy header |
| CORS | Configured for known origins only |
| Rate limiting | express-rate-limit on auth routes |

---

## Frontend State Management

```
AuthContext        — current user, token, login/logout actions
NotificationContext — toast queue, real-time socket notifications
Local component state — forms, UI toggles
React Query (optional, Phase 3+) — server data caching
```

---

## API Response Envelope

All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Human-readable message"
}

{
  "success": false,
  "data": null,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## Onboarding Stage Machine

```
PRE_JOINING
    ↓  (offer accepted + documents uploaded)
ORIENTATION
    ↓  (day 1 tasks complete)
SYSTEM_SETUP
    ↓  (access granted, tools configured)
TEAM_INTEGRATION
    ↓  (all checklist items done)
FULLY_PRODUCTIVE
```

---

## Real-time Events (Socket.IO)

| Event | Direction | Payload |
|---|---|---|
| `joinRoom` | Client → Server | `{ employeeId }` |
| `employeeUpdated` | Server → Employee | `{ type, data }` |
| `taskAssigned` | Server → Employee | `{ task }` |
| `documentApproved` | Server → Employee | `{ document }` |
| `notification` | Server → Employee | `{ title, message, type }` |
| `adminAlert` | Server → Admin room | `{ employeeId, event }` |

---

## Phase Status

| Phase | Status |
|---|---|
| Phase 0 — Foundation | ✅ Complete |
| Phase 1 — Backend (models, routes, seed, services) | ✅ Complete |
| Phase 2 — Frontend Foundation | ⏳ Next |
