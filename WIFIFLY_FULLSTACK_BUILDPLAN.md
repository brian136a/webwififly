# WiFiFly Full-Stack Local Build — Implementation Plan

## 🎯 Executive Summary

This document outlines the complete build of WiFiFly as a **local, production-grade full-stack application** with:

- **Frontend**: Next.js + React + TypeScript (port 3000)
- **Backend**: Node.js + Express + TypeScript (port 4000)
- **Database**: SQLite (local file-based)
- **Email**: Nodemailer (dev preview + real SMTP support)
- **File Storage**: Local filesystem (`/backend/uploads`)
- **Session**: UUID-based (localStorage)
- **Testing**: Jest + Supertest + React Testing Library
- **Analytics**: File-based + DB-logged events

---

## 📋 Implementation Phases

### ✅ PHASE 1: Root Infrastructure (TODAY)
**Status: IN PROGRESS**

- [x] Create root `package.json` with orchestration scripts
- [x] Create `README.md` with full setup/run instructions
- [x] Create `.env.example` with all required variables
- [x] Create `.gitignore` (SQLite, uploads, node_modules, .env)
- [x] Create root `tsconfig.json` (reference for both frontend/backend)
- [x] Create `MASTER_SPEC.md` (this file for team reference)

### 🔵 PHASE 2: Backend Scaffolding (NEXT)
**Status: PENDING**

- [ ] Backend directory structure
- [ ] Backend `package.json` with dependencies
- [ ] Backend `tsconfig.json` and `server.ts`
- [ ] SQLite client setup (`better-sqlite3` or `sqlite3` + `knex`)
- [ ] Database migrations (create tables: sessions, users, speed_tests, submissions, analytics_logs)
- [ ] Database seed script for testing

### 🔵 PHASE 3: Backend Routes & Endpoints
**Status: PENDING**

- [ ] POST `/api/session/start` (session creation/retrieval)
- [ ] POST `/api/tests/result` (speed test persistence + anomaly detection)
- [ ] POST `/api/users` (user profile creation)
- [ ] POST `/api/submissions` (lead capture + photo upload)
- [ ] GET `/api/session/:id` (retrieve session data)
- [ ] POST `/api/analytics` (event logging)
- [ ] GET `/api/config` (expose ANOMALY_SPEED_THRESHOLD to frontend)
- [ ] GET `/api/health` (health check)
- [ ] GET `/test/download` (speed test download endpoint)
- [ ] POST `/test/upload` (speed test upload endpoint)
- [ ] GET `/test/ping` (speed test ping endpoint)
- [ ] Static `/uploads/` route (photo access)

### 🔵 PHASE 4: Backend Services
**Status: PENDING**

- [ ] `emailService.ts` (Nodemailer with dev mode + real SMTP)
- [ ] `fileService.ts` (safe file upload handling)
- [ ] `analyticsService.ts` (DB + file logging)

### 🔵 PHASE 5: Frontend Scaffolding
**Status: PENDING**

- [ ] Frontend directory structure
- [ ] Frontend `package.json` with dependencies
- [ ] Next.js config (`next.config.js`)
- [ ] Tailwind CSS config + PostCSS
- [ ] TypeScript config
- [ ] Session utility (`lib/session.ts`)
- [ ] API client (`lib/api.ts`)
- [ ] Speed test runner (`lib/speedTest.ts`)

### 🔵 PHASE 6: Frontend Pages
**Status: PENDING**

- [ ] Landing page (`pages/index.tsx`)
- [ ] Struggle page (`pages/struggle.tsx`)
- [ ] Setup page (`pages/setup.tsx`)
- [ ] Test page (`pages/test.tsx`)
- [ ] Analysis page (`pages/analysis.tsx`)
- [ ] App layout (`pages/_app.tsx`)

### 🔵 PHASE 7: Frontend Components
**Status: PENDING**

- [ ] RoomCard component
- [ ] Metric component
- [ ] ProgressBar component
- [ ] PhotoUploader component
- [ ] SimpleModal component
- [ ] Header/Footer components
- [ ] TinyTooltip component

### 🔵 PHASE 8: Testing
**Status: PENDING**

- [ ] Backend Jest config + sample tests
- [ ] Frontend Jest + React Testing Library config + sample tests
- [ ] Integration test (full user flow)

### 🔵 PHASE 9: Final Polish & Documentation
**Status: PENDING**

- [ ] ESLint + Prettier config
- [ ] Complete README with examples
- [ ] Seed data for quick testing
- [ ] Development troubleshooting guide

---

## 🏗️ Project Structure (Final Deliverable)

```
wififly-fullstack/
├── README.md                          # Main documentation
├── MASTER_SPEC.md                     # This specification
├── package.json                       # Root orchestration
├── .env.example                       # Environment template
├── .gitignore                         # Git rules
├── .eslintrc.json                     # Linting rules
├── .prettierrc.json                   # Formatting rules
├── tsconfig.json                      # Root TS config
│
├── /frontend                          # Next.js app (port 3000)
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   │
│   ├── /pages
│   │   ├── _app.tsx
│   │   ├── index.tsx                  # Landing
│   │   ├── struggle.tsx
│   │   ├── setup.tsx
│   │   ├── test.tsx
│   │   ├── analysis.tsx
│   │   └── api/
│   │       └── (reserved for future ISR)
│   │
│   ├── /components
│   │   ├── /common
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── /layout
│   │   │   ├── PageLayout.tsx
│   │   │   └── FormLayout.tsx
│   │   ├── /analysis
│   │   │   ├── RoomCard.tsx
│   │   │   ├── Metric.tsx
│   │   │   ├── WaterfallChart.tsx
│   │   │   └── SimpleGraph.tsx
│   │   ├── /forms
│   │   │   ├── SetupWizard.tsx
│   │   │   ├── PhotoUploader.tsx
│   │   │   └── SubmissionForm.tsx
│   │   └── /test
│   │       ├── TestRunner.tsx
│   │       ├── ProgressBar.tsx
│   │       └── LiveMetrics.tsx
│   │
│   ├── /lib
│   │   ├── api.ts                     # API client
│   │   ├── session.ts                 # Session management
│   │   ├── speedTest.ts               # Client-side test runner
│   │   ├── types.ts                   # Shared types
│   │   └── config.ts                  # Frontend config
│   │
│   ├── /styles
│   │   ├── globals.css
│   │   └── theme.css
│   │
│   └── __tests__/
│       ├── pages/
│       ├── components/
│       └── lib/
│
├── /backend                           # Express app (port 4000)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   │
│   ├── /src
│   │   ├── index.ts                   # Express app setup
│   │   ├── server.ts                  # Launch server
│   │   │
│   │   ├── /routes
│   │   │   ├── session.ts
│   │   │   ├── tests.ts
│   │   │   ├── users.ts
│   │   │   ├── submissions.ts
│   │   │   ├── health.ts
│   │   │   ├── analytics.ts
│   │   │   └── config.ts
│   │   │
│   │   ├── /controllers
│   │   │   ├── sessionController.ts
│   │   │   ├── testController.ts
│   │   │   ├── userController.ts
│   │   │   └── submissionController.ts
│   │   │
│   │   ├── /services
│   │   │   ├── emailService.ts
│   │   │   ├── fileService.ts
│   │   │   └── analyticsService.ts
│   │   │
│   │   ├── /db
│   │   │   ├── client.ts              # SQLite connection
│   │   │   ├── migrations/
│   │   │   │   ├── 001_create_sessions.sql
│   │   │   │   ├── 002_create_users.sql
│   │   │   │   ├── 003_create_speed_tests.sql
│   │   │   │   ├── 004_create_submissions.sql
│   │   │   │   └── 005_create_analytics_logs.sql
│   │   │   └── seed.ts                # Test data
│   │   │
│   │   ├── /middleware
│   │   │   ├── errorHandler.ts
│   │   │   ├── sessionValidator.ts
│   │   │   └── rateLimiter.ts
│   │   │
│   │   ├── /utils
│   │   │   ├── validation.ts
│   │   │   ├── security.ts
│   │   │   └── logger.ts
│   │   │
│   │   └── /types
│   │       └── index.ts
│   │
│   ├── /uploads                       # Photo storage (.gitignore)
│   │   └── .gitkeep
│   │
│   ├── /data                          # SQLite database (.gitignore)
│   │   └── .gitkeep
│   │
│   ├── /logs                          # Analytics logs (.gitignore)
│   │   └── .gitkeep
│   │
│   └── __tests__/
│       ├── routes/
│       ├── services/
│       ├── integration/
│       └── utils/
│
├── /scripts
│   ├── migrate.ts                     # Run migrations
│   ├── seed.ts                        # Populate test data
│   └── reset-db.ts                    # Clean slate (dev)
│
└── /docs
    ├── API_REFERENCE.md               # Endpoint documentation
    ├── DATABASE_SCHEMA.md             # DB structure
    └── TROUBLESHOOTING.md             # Common issues
```

---

## 🚀 Quick Start Flow (After Implementation)

1. **Clone & Setup**
   ```bash
   git clone <repo>
   cd wififly-fullstack
   cp .env.example .env
   npm install
   ```

2. **Database Setup**
   ```bash
   npm run migrate
   npm run seed
   ```

3. **Start Development**
   ```bash
   npm run dev
   # Starts backend on http://localhost:4000
   # Starts frontend on http://localhost:3000
   ```

4. **Test Full Flow**
   - Open http://localhost:3000
   - Navigate through: Landing → Struggle → Setup → Test → Analysis
   - Submit lead form with photo
   - Check nodemailer preview link or real inbox

---

## 📊 Key Integration Points

### Session Flow
1. Frontend loads → calls `POST /api/session/start` → gets UUID
2. UUID stored in localStorage + sent with every request (header `X-Session-Id`)
3. Backend creates/updates `sessions` table entry
4. All tests, users, submissions linked to `session_id`

### Speed Test Flow
1. Test page calls `lib/speedTest.ts` runner
2. Runner measures: download (via `/test/download?size=1MB`), upload (via `POST /test/upload`), ping (via `/test/ping`)
3. Frontend POSTs to `POST /api/tests/result` with measurements
4. Backend detects anomalies (if `dl > ANOMALY_SPEED_THRESHOLD`)
5. Frontend receives result + displays on Analysis page

### Anomaly Handling
1. Backend: if `dl > threshold` → set `anomaly=true` in DB
2. Frontend: receives anomaly flag in response
3. UI: displays capped visualization + muted secondary text with "(anomalous)"
4. Analytics: logs `anomaly_flag_shown` event

### Lead Capture Flow
1. User fills form on Analysis page
2. Selects optional photo → `PhotoUploader` handles preview
3. Submits → `POST /api/submissions` with multipart/form-data
4. Backend: saves photo under `uploads/`, creates `submissions` row
5. Backend: triggers `emailService.sendPersonalizedPlan(email)`
6. Frontend: shows confirmation with expected email preview

### Analytics Flow
1. Frontend: `POST /api/analytics` with `{ eventName, payload, sessionId }`
2. Backend: writes to `analytics_logs` table + appends to `backend/logs/analytics.log`
3. Events: `view_analysis`, `click_send_plan`, `submit_plan`, `anomaly_flag_shown`, `photo_uploaded`, `download_pdf`

---

## 🔐 Security & Validation

✅ All inputs validated with Zod/Joi  
✅ File upload: sanitized filename + MIME type check  
✅ Session: validated before operations  
✅ Rate limiting: 100 req/min per IP (configurable)  
✅ CORS: enabled for localhost:3000 (configurable)  
✅ No hardcoded secrets (all from `.env`)  

---

## 📝 Environment Variables

```
# Frontend
FRONTEND_BASE_URL=http://localhost:3000

# Backend
BACKEND_BASE_URL=http://localhost:4000
PORT=4000
DB_FILE=./backend/data/wififly.sqlite
UPLOAD_DIR=./backend/uploads
LOGS_DIR=./backend/logs

# Email (optional — dev mode if not set)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@wififly.local

# Anomaly Detection
ANOMALY_SPEED_THRESHOLD=1000

# Development
NODE_ENV=development
DEBUG=wififly:*
```

---

## ✅ Success Criteria (Validation Checklist)

- [ ] Developer can clone repo
- [ ] `npm install` completes without errors
- [ ] `npm run migrate` creates SQLite DB with all tables
- [ ] `npm run seed` populates test data
- [ ] `npm run dev` starts both servers (frontend 3000, backend 4000)
- [ ] Landing page loads at http://localhost:3000
- [ ] Can navigate full flow: Landing → Struggle → Setup → Test → Analysis
- [ ] Test runner simulates multi-room testing
- [ ] Results persist to SQLite
- [ ] Form submission works + photo uploads
- [ ] Nodemailer preview link appears (or real email sent)
- [ ] `npm test` runs all tests with >80% pass rate
- [ ] `npm run lint` reports no errors
- [ ] Analytics events logged to file + DB

---

## 📅 Timeline Estimate

| Phase | Effort | Notes |
|-------|--------|-------|
| Root + Backend Scaffolding | 2h | Migrations, schema, DB setup |
| Backend Endpoints | 3h | 11 routes, validation, services |
| Frontend Scaffolding + Pages | 3h | Next.js, pages, routing |
| Frontend Components | 2h | Reusable UI elements |
| Services (Email, Files, Analytics) | 2h | Integration with external/local services |
| Testing | 2h | Unit + integration tests |
| Documentation + Polish | 1h | README, examples, troubleshooting |
| **TOTAL** | **15h** | Full working app ready for deployment |

---

## 🎯 Final Deliverables

✅ Complete repository with exact structure  
✅ Fully implemented backend (Express + SQLite)  
✅ Fully implemented frontend (Next.js + React)  
✅ All UX copy & flows per specification  
✅ Database migrations + seed data  
✅ Unit + integration tests  
✅ Clear README with run instructions  
✅ Example curl requests for all endpoints  
✅ No external paid services required  

---

**Document Version**: 1.0  
**Created**: November 15, 2025  
**Status**: BUILD PLAN READY → PROCEEDING TO IMPLEMENTATION
