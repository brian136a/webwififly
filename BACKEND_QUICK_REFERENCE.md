# Quick Reference: Backend Integration

## Commands

```bash
# Install dependencies
npm install

# Create database schema
npm run migrate

# Populate test data
npm run seed

# Run dev server
npm run dev

# Run tests
npm test

# Build production
npm run build
```

## Database

- **Location:** `src/db/data/wififly.sqlite`
- **Tables:** `sessions`, `setups`, `speed_tests`
- **Type:** SQLite3 (file-based, no server needed)

## API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/session` | Create session (UUID) |
| POST | `/api/setup` | Save setup form data |
| POST | `/api/tests` | Record speed test result |
| GET | `/api/analysis?sessionId=<UUID>` | Get aggregated stats |
| GET | `/api/config` | Get app configuration |

## Frontend Flow

1. Setup page loads → `POST /api/session` (create session, store UUID in localStorage)
2. User fills form (ISP, speed, cost, rooms)
3. User clicks "Begin Testing" → `POST /api/setup` (save to DB)
4. Redirect to `/test` page
5. During testing → `POST /api/tests` (save each room result)
6. After all tests → `GET /api/analysis?sessionId=<UUID>` (show stats)

## Validation Rules

### Session
- `sessionId`: UUID v4 (auto-generated)
- `createdAt`: Unix timestamp (milliseconds)

### Setup
- `isp`: 1–100 characters (trimmed)
- `planDownloadMbps`: > 0 (positive)
- `monthlyCostNzd`: ≥ 0 (non-negative)

### Speed Test
- `roomName`: 1–50 characters (trimmed)
- `downloadMbps`, `uploadMbps`, `pingMs`, `jitterMs`: ≥ 0 (non-negative)

## Files

```
src/
├── app/
│   ├── api/
│   │   ├── session/route.ts      (POST/GET session)
│   │   ├── setup/route.ts        (POST setup)
│   │   ├── tests/route.ts        (POST speed test)
│   │   ├── analysis/route.ts     (GET analysis)
│   │   └── config/route.ts       (GET config)
│   └── setup/page.tsx            (Frontend form with API integration)
├── db/
│   ├── client.ts                 (SQLite wrapper)
│   ├── migrate.js                (Run migrations)
│   ├── seed.js                   (Populate test data)
│   ├── data/
│   │   └── wififly.sqlite        (Database file)
│   └── migrations/
│       └── 001-init.sql          (Schema)
├── lib/
│   └── validation.ts             (Zod schemas)
└── tests/
    └── api/
        ├── session.test.ts       (Session schema tests)
        └── integration.test.ts   (19 integration tests)
```

## Debugging

**Check session creation:**
```javascript
// In browser console
localStorage.getItem('wififly_sessionId')
```

**Check database content:**
```bash
sqlite3 src/db/data/wififly.sqlite
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM setups;
SELECT COUNT(*) FROM speed_tests;
```

**View API response:**
```bash
curl -X POST http://localhost:3000/api/session
```

## Error Handling

- **Network error on setup submit:** Auto-retry with exponential backoff (1s, 2s, 4s)
- **Session creation fails:** Retry after 2s
- **Database error:** 500 response with error message
- **Validation fails:** 400 response with error details

## Testing

- **Unit tests:** Session/Setup schema validation
- **Integration tests:** DB operations, foreign keys, aggregations
- **Command:** `npm test`
- **Status:** 19/19 passing ✓

## Production Checklist

- [ ] Database file backed up
- [ ] Environment set to production
- [ ] Docker volume mounted at `/app/src/db/data/`
- [ ] Migrations run on startup
- [ ] Tests passing (19/19)
- [ ] Error handling verified
- [ ] Session timeout configured (if needed)

## Next Steps

- Phase 5: Scripts & Documentation (this guide)
- Phase 6: Safety Checks
- Phase 7: Rollback Procedures

See `BACKEND_INTEGRATION_GUIDE.md` for comprehensive documentation.
