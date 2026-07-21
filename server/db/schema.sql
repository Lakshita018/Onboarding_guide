-- server/db/schema.sql
-- IBM OnboardAI — PostgreSQL Schema
-- Run at server startup via server/config/database.js

-- ─── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('employee', 'admin')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── employees ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department       VARCHAR(100),
  designation      VARCHAR(100),
  manager          UUID        REFERENCES users(id),
  buddy            UUID        REFERENCES users(id),
  joining_date     DATE,
  onboarding_stage VARCHAR(30) NOT NULL DEFAULT 'PRE_JOINING'
                   CHECK (onboarding_stage IN (
                     'PRE_JOINING', 'ORIENTATION', 'SYSTEM_SETUP',
                     'TEAM_INTEGRATION', 'FULLY_PRODUCTIVE'
                   )),
  offer_accepted   BOOLEAN     NOT NULL DEFAULT false,
  os_type          VARCHAR(20) CHECK (os_type IN ('mac', 'windows', 'linux')),
  status           VARCHAR(20) NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active', 'inactive'))
);

-- ─── documents ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         UUID         NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_name       VARCHAR(255) NOT NULL,
  document_type       VARCHAR(50)  NOT NULL,
  file_path           VARCHAR(500) NOT NULL,
  file_size_kb        INTEGER,
  mime_type           VARCHAR(100),
  verification_status VARCHAR(20)  NOT NULL DEFAULT 'pending'
                      CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rejection_reason    TEXT,
  created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── checklist_items ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklist_items (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID         NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  category     VARCHAR(50),
  priority     VARCHAR(10)  NOT NULL DEFAULT 'medium'
               CHECK (priority IN ('high', 'medium', 'low')),
  completed    BOOLEAN      NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  due_date     DATE,
  order_index  INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── tasks ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID         NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_by UUID         NOT NULL REFERENCES users(id),
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  deadline    DATE,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── access_requests ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS access_requests (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID         NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  application_name VARCHAR(100) NOT NULL,
  reason           TEXT,
  status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by      UUID         REFERENCES users(id),
  reviewed_at      TIMESTAMP,
  created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── chat_logs ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID        NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  sender      VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'assistant')),
  message     TEXT        NOT NULL,
  intent      VARCHAR(100),
  timestamp   TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_employees_user_id     ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_emp_id      ON documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_checklist_emp_id      ON checklist_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_emp_id          ON tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_access_emp_id         ON access_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_chat_emp_id           ON chat_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp        ON chat_logs(timestamp);
