# WiFiFly Copilot Instructions

## Project Overview
This is a **Next.js 15** (App Router) application with a **TypeScript** codebase. It serves as a network quality testing and optimizing tool ("WiFiFly"). The architecture is monolithic, including the frontend, API backend, and embedded database within the Next.js application.

## Core Technologies
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand (`src/store`)
- **Database:** SQLite (`sqlite3`)
- **Validation:** Zod (backend) & Custom helpers (frontend)
- **Deployment:** Docker (Standalone mode)

## Architecture & Conventions

### 1. Database Access (SQLite)
- **Pattern:** Do NOT use `sqlite3` driver directly in API routes.
- **Helper:** Always use the custom wrapper in `src/db/client.ts`.
- **Methods:**
  - `getAsync<T>(sql, params)`: Fetch single row.
  - `queryAsync<T>(sql, params)`: Fetch multiple rows.
  - `runAsync(sql, params)`: Insert/Update/Delete. Returns `{ lastID, changes }`.
- **Location:** Database file is expected at `src/db/data/wififly.sqlite`. Note that in production (Docker), this relies on `process.cwd()` and volume mapping (critical for persistence).

### 2. API Routes
- **Location:** `src/app/api/[route]/route.ts`
- **Pattern:** Use standard Next.js Route Handlers (`POST`, `GET`).
- **Validation:** Use Zod schemas exported from `@/lib/validation` (e.g., `sessionSchema`).
- **Response:** Always return JSON using `NextResponse.json`.

### 3. State Management (Zustand)
- **Store:** `src/store/setupStore.ts`.
- **Usage:** Manages the multi-step wizard state (Session info, ISP details, Speed test results).
- **Pattern:** Actions are defined inside the store. Components should subscribe to specific slices of state to avoid unnecessary re-renders.

### 4. Component Structure
- **Organization:** Feature-based grouping.
  - `src/components/common`: Generic UI elements.
  - `src/components/[feature]`: Feature-specific components (e.g., `struggle`, `layout`).
- **Styling:** Use Tailwind utility classes. Avoid CSS modules unless necessary for complex animations not covering by Tailwind.

### 5. File System Operations
- **Paths:** When accessing files (Db, logs, etc.) server-side, always resolve relative to `process.cwd()`.
- **Docker Caveat:** The app runs in `standalone` mode. `src/` structure may differ in the built container artifacts generally, but for this project, rely on `path.join(process.cwd(), ...)` conventions established in `client.ts`.

## Development Workflows

### Database Migrations
- **Script:** Controlled by `src/db/migrate.js`.
- **Run:** Use `npm run migrate` to apply schema changes.
- **Seeds:** Use `npm run seed` to populate initial data.

### Testing
- **Framework:** Jest.
- **Command:** `npm test`.
- **Scope:** Unit tests for logic and integration tests for API routes.

## Critical Files
- `src/db/client.ts`: **Core DB Wrapper**. Read this to understand available DB operations.
- `src/lib/validation.ts`: **Domain Rules**. Contains both Zod schemas and frontend validation logic (e.g., NZ ISP list).
- `src/store/setupStore.ts`: **Global State**. references the shape of the application data flow.
