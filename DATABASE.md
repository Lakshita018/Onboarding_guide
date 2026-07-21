# IBM OnboardAI — Database Plan

## Engine Strategy

| Environment | Database | Config |
|---|---|---|
| Production | PostgreSQL 15+ | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| Development / Demo | SQLite 3 | `SQLITE_PATH=./db/onboardai.db` |

The `server/config/database.js` module attempts a PostgreSQL connection at startup. If the connection fails (or env vars are absent), it falls back to SQLite. Both expose the same `query(sql, params)` function so all models are engine-agnostic.

---

## Entity-Relationship Overview

```
users ──────────────── employees
  1                        1
  │                        │
  └── (user_id FK)         ├── documents (1:N)
                           ├── checklist_items (1:N)
                           ├── tasks (1:N)
                           ├── access_requests (1:N)
                           └── chat_logs (1:N)

employees ─── manager (self-ref → users.id)
employees ─── buddy   (self-ref → users.id)
tasks     ─── assigned_by (→ users.id)
access_requests ─── approved_by (→ users.id)
```

---

## Table Definitions

### `users`

Stores authentication credentials and role for every platform user (employee OR admin).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `name` | VARCHAR(255) | NOT NULL | |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt, saltRounds=12 |
| `role` | VARCHAR(20) | NOT NULL | `'employee'` or `'admin'` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

---

### `employees`

Extended profile for users with `role = 'employee'`. Created by admin or on signup.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `user_id` | FK → users.id | NOT NULL, UNIQUE | 1:1 with users |
| `department` | VARCHAR(100) | | e.g. "Engineering", "HR" |
| `designation` | VARCHAR(100) | | e.g. "Software Engineer" |
| `manager` | FK → users.id | NULLABLE | Admin user |
| `buddy` | FK → users.id | NULLABLE | Peer mentor user |
| `joining_date` | DATE | | |
| `onboarding_stage` | VARCHAR(30) | DEFAULT 'PRE_JOINING' | Stage enum |
| `offer_accepted` | BOOLEAN | DEFAULT false | |
| `os_type` | VARCHAR(20) | NULLABLE | `'mac'`, `'windows'`, `'linux'` |
| `status` | VARCHAR(20) | DEFAULT 'active' | `'active'`, `'inactive'` |

**Onboarding Stage Enum Values:**
```
PRE_JOINING → ORIENTATION → SYSTEM_SETUP → TEAM_INTEGRATION → FULLY_PRODUCTIVE
```

---

### `documents`

Tracks every file uploaded by an employee during onboarding.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `employee_id` | FK → employees.id | NOT NULL | |
| `document_name` | VARCHAR(255) | NOT NULL | Display name |
| `document_type` | VARCHAR(50) | NOT NULL | `'id_proof'`, `'education'`, `'address_proof'`, `'offer_letter'`, `'other'` |
| `file_path` | VARCHAR(500) | NOT NULL | Relative path in storage |
| `file_size_kb` | INTEGER | | |
| `mime_type` | VARCHAR(100) | | |
| `verification_status` | VARCHAR(20) | DEFAULT 'pending' | `'pending'`, `'verified'`, `'rejected'` |
| `rejection_reason` | TEXT | NULLABLE | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

---

### `checklist_items`

Personalized onboarding checklist tasks per employee.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `employee_id` | FK → employees.id | NOT NULL | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `category` | VARCHAR(50) | | `'documents'`, `'setup'`, `'hr'`, `'learning'`, `'team'` |
| `priority` | VARCHAR(10) | DEFAULT 'medium' | `'high'`, `'medium'`, `'low'` |
| `completed` | BOOLEAN | DEFAULT false | |
| `completed_at` | TIMESTAMP | NULLABLE | |
| `due_date` | DATE | NULLABLE | |
| `order_index` | INTEGER | DEFAULT 0 | Render order |

---

### `tasks`

Admin-assigned tasks pushed to an employee.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `employee_id` | FK → employees.id | NOT NULL | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `assigned_by` | FK → users.id | NOT NULL | Admin who assigned |
| `status` | VARCHAR(20) | DEFAULT 'pending' | `'pending'`, `'in_progress'`, `'completed'`, `'overdue'` |
| `deadline` | DATE | NULLABLE | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

---

### `access_requests`

Tracks application access requests raised by employees.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `employee_id` | FK → employees.id | NOT NULL | |
| `application_name` | VARCHAR(100) | NOT NULL | e.g. "Jira", "Slack", "AWS Console" |
| `reason` | TEXT | | |
| `status` | VARCHAR(20) | DEFAULT 'pending' | `'pending'`, `'approved'`, `'rejected'` |
| `approved_by` | FK → users.id | NULLABLE | Admin who approved/rejected |
| `reviewed_at` | TIMESTAMP | NULLABLE | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

---

### `chat_logs`

Stores full conversation history between an employee and the AI assistant.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PK | |
| `employee_id` | FK → employees.id | NOT NULL | |
| `sender` | VARCHAR(10) | NOT NULL | `'user'` or `'assistant'` |
| `message` | TEXT | NOT NULL | |
| `intent` | VARCHAR(100) | NULLABLE | Detected AI intent |
| `timestamp` | TIMESTAMP | DEFAULT NOW() | |

---

## SQL Schema (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('employee', 'admin')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- employees
CREATE TABLE employees (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department       VARCHAR(100),
  designation      VARCHAR(100),
  manager          UUID REFERENCES users(id),
  buddy            UUID REFERENCES users(id),
  joining_date     DATE,
  onboarding_stage VARCHAR(30)  NOT NULL DEFAULT 'PRE_JOINING'
                   CHECK (onboarding_stage IN (
                     'PRE_JOINING','ORIENTATION','SYSTEM_SETUP',
                     'TEAM_INTEGRATION','FULLY_PRODUCTIVE'
                   )),
  offer_accepted   BOOLEAN NOT NULL DEFAULT false,
  os_type          VARCHAR(20)  CHECK (os_type IN ('mac','windows','linux')),
  status           VARCHAR(20)  NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','inactive'))
);

-- documents
CREATE TABLE documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_name       VARCHAR(255) NOT NULL,
  document_type       VARCHAR(50)  NOT NULL,
  file_path           VARCHAR(500) NOT NULL,
  file_size_kb        INTEGER,
  mime_type           VARCHAR(100),
  verification_status VARCHAR(20)  NOT NULL DEFAULT 'pending'
                      CHECK (verification_status IN ('pending','verified','rejected')),
  rejection_reason    TEXT,
  created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- checklist_items
CREATE TABLE checklist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID         NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(50),
  priority    VARCHAR(10)  NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('high','medium','low')),
  completed   BOOLEAN      NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  due_date    DATE,
  order_index INTEGER      NOT NULL DEFAULT 0
);

-- tasks
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID         NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_by UUID         NOT NULL REFERENCES users(id),
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','in_progress','completed','overdue')),
  deadline    DATE,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- access_requests
CREATE TABLE access_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID         NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  application_name VARCHAR(100) NOT NULL,
  reason           TEXT,
  status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
  approved_by      UUID REFERENCES users(id),
  reviewed_at      TIMESTAMP,
  created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- chat_logs
CREATE TABLE chat_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID        NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  sender      VARCHAR(10) NOT NULL CHECK (sender IN ('user','assistant')),
  message     TEXT        NOT NULL,
  intent      VARCHAR(100),
  timestamp   TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_employees_user_id       ON employees(user_id);
CREATE INDEX idx_documents_employee_id   ON documents(employee_id);
CREATE INDEX idx_checklist_employee_id   ON checklist_items(employee_id);
CREATE INDEX idx_tasks_employee_id       ON tasks(employee_id);
CREATE INDEX idx_access_employee_id      ON access_requests(employee_id);
CREATE INDEX idx_chat_employee_id        ON chat_logs(employee_id);
CREATE INDEX idx_chat_timestamp          ON chat_logs(timestamp);
```

---

## Seed Data Strategy

Run `npm run seed` from the `server/` directory to populate all demo data.

**Phase 1 demo accounts (`server/seed/seed.js`):**

| Role | Email | Password | Onboarding Stage |
|---|---|---|---|
| Admin | admin@ibm.com | Admin123 | — |
| Employee | aarav@ibm.com | Employee123 | PRE_JOINING — 10 pending checklist items, no docs |
| Employee | priya@ibm.com | Employee123 | ORIENTATION — 5/10 done, 2 docs, 2 access requests |
| Employee | rahul@ibm.com | Employee123 | FULLY_PRODUCTIVE — 12/12 done, 3 docs verified |

Legacy seed (`server/db/seed.js`) uses `admin@onboardai.com` / `Admin@123` and is kept for reference only.

---

## Migration Strategy

- `npm run migrate` — applies `server/db/schema.sql` (idempotent, `IF NOT EXISTS`)
- Schema is PostgreSQL-dialect; automatically converted to SQLite on fallback
- Future: migrate to Knex migrations for versioned schema changes

---

## Phase 1 Schema Changes

The `checklist_items` table gained a `created_at` column (added during Phase 1 to fix SQLite ORDER BY compatibility):

```sql
created_at TIMESTAMP NOT NULL DEFAULT NOW()
```
