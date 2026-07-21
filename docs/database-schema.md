# IBM OnboardAI - Database Schema Documentation

This document describes the schema design for the IBM OnboardAI Employee Onboarding Assistant, supporting both SQLite and PostgreSQL databases.

---

## 1. Tables Overview

### A. Table: `users`
Represents the credentials and roles of all users in the system.
- `id` (Primary Key, Auto-increment)
- `name` (String, Not Null)
- `email` (String, Unique, Not Null)
- `password_hash` (String, Not Null)
- `role` (String, Not Null) - Enforced: `'employee'`, `'admin'`
- `created_at` (Timestamp, Default: CURRENT_TIMESTAMP)
- `updated_at` (Timestamp, Default: CURRENT_TIMESTAMP)

---

### B. Table: `employees`
Contains onboarding metadata specific to employees.
- `id` (Primary Key, Auto-increment)
- `user_id` (Foreign Key referencing `users(id)`, On Delete Cascade, Not Null)
- `department` (String)
- `designation` (String)
- `manager` (String)
- `buddy` (String)
- `joining_date` (Date/Timestamp)
- `onboarding_stage` (String) - Enforced: `'pre-joining'`, `'first-day'`, `'first-week'`, `'completed'`
- `offer_accepted` (Boolean, Default: false)
- `os_type` (String) - Enforced: `'mac'`, `'windows'`
- `status` (String, Default: `'active'`)

---

### C. Table: `documents`
Tracks safety compliance and onboarding documents uploaded by employees.
- `id` (Primary Key, Auto-increment)
- `employee_id` (Foreign Key referencing `employees(id)`, On Delete Cascade, Not Null)
- `document_name` (String, Not Null)
- `document_type` (String, Not Null) - e.g., `'offer_letter'`, `'tax_form'`, `'identity_proof'`
- `file_path` (String, Not Null) - Path to stored file
- `verification_status` (String, Default: `'pending'`) - Enforced: `'pending'`, `'verified'`, `'rejected'`
- `created_at` (Timestamp, Default: CURRENT_TIMESTAMP)

---

### D. Table: `checklist_items`
Lists personalized checklists auto-assigned or manually assigned to employees.
- `id` (Primary Key, Auto-increment)
- `employee_id` (Foreign Key referencing `employees(id)`, On Delete Cascade, Not Null)
- `title` (String, Not Null)
- `description` (Text)
- `priority` (String, Default: `'medium'`) - Enforced: `'low'`, `'medium'`, `'high'`
- `completed` (Boolean, Default: false)
- `completed_at` (Timestamp, Nullable)

---

### E. Table: `tasks`
Individual tasks assigned to employees by administrators or HR.
- `id` (Primary Key, Auto-increment)
- `employee_id` (Foreign Key referencing `employees(id)`, On Delete Cascade, Not Null)
- `title` (String, Not Null)
- `description` (Text)
- `assigned_by` (Foreign Key referencing `users(id)`, Not Null)
- `status` (String, Default: `'pending'`) - Enforced: `'pending'`, `'in_progress'`, `'completed'`
- `deadline` (Timestamp, Nullable)
- `created_at` (Timestamp, Default: CURRENT_TIMESTAMP)

---

### F. Table: `access_requests`
Systems, software, and application permission requests.
- `id` (Primary Key, Auto-increment)
- `employee_id` (Foreign Key referencing `employees(id)`, On Delete Cascade, Not Null)
- `application_name` (String, Not Null)
- `reason` (Text)
- `status` (String, Default: `'pending'`) - Enforced: `'pending'`, `'approved'`, `'rejected'`
- `requested_at` (Timestamp, Default: CURRENT_TIMESTAMP)
- `approved_by` (Foreign Key referencing `users(id)`, Nullable)

---

### G. Table: `chat_logs`
Saves full conversation dialogs with the OnboardAI Watsonx Assistant.
- `id` (Primary Key, Auto-increment)
- `employee_id` (Foreign Key referencing `employees(id)`, On Delete Cascade, Not Null)
- `sender` (String, Not Null) - Enforced: `'user'`, `'ai'`
- `message` (Text, Not Null)
- `timestamp` (Timestamp, Default: CURRENT_TIMESTAMP)
