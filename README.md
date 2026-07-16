# IBM OnboardAI — AI-Powered Employee Onboarding Assistant

IBM OnboardAI is an enterprise-grade full-stack platform designed to simplify, automate, and enhance the corporate onboarding experience. Built for the IBM watsonx Hackathon, it guides employees from pre-joining readiness to full workspace productivity.

---

## 1. Core Objectives
- **Empower Employees**: Clear checklist paths, system hardware customization, secure documentation uploads, and an interactive AI assistant.
- **Support Admins/HR**: Real-time progress trackers, instant task assignments, and document verification interfaces.
- **Watsonx Orchestration**: Decoupled AI integration enabling smart chat agent answers and role-based action recommendations.

---

## 2. Technology Stack

### Frontend
- **Framework**: React (Vite-based SPA)
- **Styling**: Tailwind CSS v4, custom theme based on IBM Carbon
- **Animations**: Framer Motion
- **Communication**: Axios, Socket.IO Client
- **Icons**: Lucide React

### Backend & Database
- **Server**: Node.js, Express
- **Realtime**: Socket.IO
- **ORM / Drivers**: Sequelize (supporting PostgreSQL & SQLite fallback)
- **Database**: PostgreSQL (Primary) / SQLite (Local dev fallback)
- **Authentication**: JWT & bcryptjs password hashing

---

## 3. Architecture Overview
Refer to [docs/architecture_plan.md](docs/architecture_plan.md) and [docs/database-schema.md](docs/database-schema.md) for deeper design diagrams.
- **Frontend** accesses Watsonx capabilities solely via backend endpoints (`/api/chat` and `/api/recommendations`), ensuring proper security and decoupling.
- **Socket.IO** emits server-wide changes (e.g. `employeeUpdated`), triggering reactive re-renders in the frontend client state.

---

## 4. Development Phases
1. **Phase 0**: Project Foundation, Architecture & Initial Setup (Completed)
2. **Phase 1**: Database Models and Backend Foundation
3. **Phase 2**: Authentication (Signup, Login, Middleware)
4. **Phase 3**: Enterprise UI Shell (Sidebar, Topbar, Layout, Skeleton)
5. **Phase 4**: Employee Pre-Joining
6. **Phase 5**: Employee Post-Joining
7. **Phase 6**: Admin Dashboard
8. **Phase 7**: Real-Time Sync (Socket.IO integration)
9. **Phase 8**: IBM watsonx Integration (Granite model & Watsonx Assistant API)
10. **Phase 9**: Security & Polish
11. **Phase 10**: Deployment
12. **Phase 11**: Hackathon Submission

---

## 5. Getting Started (Placeholder)

### Prerequisites
- Node.js (v18+)
- SQLite (pre-installed for local dev) or PostgreSQL database instance

### Quickstart Installation
To clone and start the local development environment:
```bash
# Clone the repository
git clone <repository_url>
cd IBM_Onboarding_tool

# Copy environment template
cp .env.example .env

# Install all workspace dependencies
npm run install:all

# Run client & server concurrently in development mode
npm run dev
```
