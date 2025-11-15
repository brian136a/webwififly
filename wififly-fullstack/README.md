# WiFiFly Full-Stack Local Build

> A complete, production-grade local implementation of WiFiFly — a WiFi speed testing and analysis platform built with Next.js, Express, SQLite, and TypeScript.

**Live Demo**: http://localhost:3000 (after running locally)  
**Backend API**: http://localhost:4000  
**Database**: SQLite (local file)  
**Email**: Nodemailer (dev preview or real SMTP)

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ and npm 9+
- ~200 MB disk space

### 1. Clone & Navigate
```bash
git clone <repo> wififly-fullstack
cd wififly-fullstack
```

### 2. Install Dependencies
```bash
cp .env.example .env
npm run bootstrap
```

### 3. Initialize Database
```bash
npm run migrate
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

**Output:**
```
Concurrently starting...
✓ Backend running at http://localhost:4000
✓ Frontend running at http://localhost:3000
```

### 5. Open Browser
Visit **http://localhost:3000** and navigate:
- **Landing** → "Check My WiFi"
- **Struggle** → "Start Your Free Check"
- **Setup** → Fill ISP, Plan Speed, Cost, Rooms
- **Test** → Runs multi-room speed test
- **Analysis** → Results + Lead Form with Photo Upload

---

## 📋 Project Structure

```
wififly-fullstack/
├── README.md                    # This file
├── package.json                 # Root orchestration
├── .env.example                 # Environment template
├── .gitignore
│
├── /frontend                    # Next.js + React (port 3000)
│   ├── pages/
│   │   ├── index.tsx            # Landing
│   │   ├── struggle.tsx
│   │   ├── setup.tsx
│   │   ├── test.tsx
│   │   └── analysis.tsx
│   ├── components/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── session.ts
│   │   └── speedTest.ts
│   └── package.json
│
├── /backend                     # Express + SQLite (port 4000)
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   └── client.ts
│   │   └── middleware/
│   ├── uploads/                 # Photo storage
│   ├── data/                    # SQLite DB file
│   ├── logs/                    # Analytics logs
│   └── package.json
│
└── /scripts
    ├── migrate.ts
    ├── seed.ts
    └── reset-db.ts
```

---

## 🔧 Environment Variables

Copy `.env.example` → `.env` and configure:

```bash
# Frontend
FRONTEND_BASE_URL=http://localhost:3000

# Backend
BACKEND_BASE_URL=http://localhost:4000
PORT=4000
DB_FILE=./backend/data/wififly.sqlite
UPLOAD_DIR=./backend/uploads
LOGS_DIR=./backend/logs

# Email (optional - uses dev mode if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@wififly.local

# Anomaly Detection (speeds > this cap are flagged)
ANOMALY_SPEED_THRESHOLD=1000

# Development
NODE_ENV=development
DEBUG=wififly:*
```

**Note**: Email defaults to **Nodemailer Dev Mode** if `SMTP_HOST` is blank. Check the console for preview link.

---

## 📚 Development Commands

### Database
```bash
npm run migrate          # Create/update schema
npm run seed             # Populate test data
npm run reset-db         # Drop + recreate (dev only)
```

### Development
```bash
npm run dev              # Start both servers (concurrent)
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
```

### Build & Production
```bash
npm run build            # Build both
npm run build:backend
npm run build:frontend

npm run start            # Start production servers
```

### Testing & Linting
```bash
npm test                 # Run all tests
npm test:backend
npm test:frontend

npm run lint             # Check code quality
npm run format           # Auto-format code
```

---

## 🧪 Testing the Application

### Manual Flow

1. **Landing Page**
   ```bash
   curl http://localhost:3000
   ```

2. **Create Session**
   ```bash
   curl -X POST http://localhost:4000/api/session/start \
     -H "Content-Type: application/json"
   
   # Response: { "sessionId": "uuid-here" }
   ```

3. **Complete Setup**
   ```bash
   curl -X POST http://localhost:4000/api/users \
     -H "Content-Type: application/json" \
     -H "X-Session-Id: <sessionId>" \
     -d '{
       "sessionId": "<sessionId>",
       "isp": "Vodafone NZ",
       "planSpeed": 100,
       "monthlyCost": 79,
       "modemRoom": "Living Room",
       "homeType": "House"
     }'
   ```

4. **Run Speed Test**
   ```bash
   curl -X POST http://localhost:4000/api/tests/result \
     -H "Content-Type: application/json" \
     -H "X-Session-Id: <sessionId>" \
     -d '{
       "sessionId": "<sessionId>",
       "roomName": "Living Room",
       "dl": 87.5,
       "ul": 12.3,
       "ping": 15,
       "jitter": 2,
       "timestamp": '$(date +%s)'000,
       "clientIp": "203.0.113.42"
     }'
   ```

5. **Submit Lead Form with Photo**
   ```bash
   curl -X POST http://localhost:4000/api/submissions \
     -H "X-Session-Id: <sessionId>" \
     -F "sessionId=<sessionId>" \
     -F "name=John Doe" \
     -F "email=john@example.com" \
     -F "modemModel=TP-Link Archer AX12" \
     -F "homeType=House" \
     -F "notes=My kitchen has weak WiFi" \
     -F "file=@/path/to/photo.jpg"
   ```

6. **Retrieve Session Data**
   ```bash
   curl http://localhost:4000/api/session/<sessionId>
   ```

7. **View Analytics**
   ```bash
   cat backend/logs/analytics.log
   ```

### Automated Tests

```bash
npm test                 # Runs Jest test suite
# Includes:
# - Session endpoint tests
# - Test result persistence + anomaly detection
# - User creation + validation
# - File upload + security
# - Email sending mock
# - Integration test (full flow)
```

---

## 📊 Database Schema

### `sessions`
- `id TEXT PRIMARY KEY` (UUID v4)
- `created_at INTEGER` (timestamp)
- `last_seen INTEGER` (timestamp)
- `meta JSON` (nullable)

### `users`
- `id INTEGER PRIMARY KEY`
- `session_id TEXT` (foreign key)
- `name TEXT`
- `email TEXT`
- `isp TEXT`
- `plan_speed_mbps INT`
- `monthly_cost_nz DECIMAL`
- `modem_room TEXT`
- `home_type TEXT`
- `modem_model TEXT`
- `created_at INTEGER`
- `updated_at INTEGER`

### `speed_tests`
- `id INTEGER PRIMARY KEY`
- `session_id TEXT` (foreign key)
- `user_id INTEGER` (nullable, foreign key)
- `room_name TEXT`
- `dl REAL` (download Mbps)
- `ul REAL` (upload Mbps)
- `ping REAL` (milliseconds)
- `jitter REAL` (milliseconds)
- `client_ip TEXT`
- `server_info JSON`
- `timestamp INTEGER`
- `anomaly BOOLEAN` (0/1)
- `raw_data JSON`
- `created_at INTEGER`

### `submissions`
- `id INTEGER PRIMARY KEY`
- `session_id TEXT` (foreign key)
- `user_id INTEGER` (nullable, foreign key)
- `name TEXT`
- `email TEXT`
- `modem_model TEXT`
- `home_type TEXT`
- `notes TEXT`
- `photo_path TEXT`
- `created_at INTEGER`

### `analytics_logs`
- `id INTEGER PRIMARY KEY`
- `session_id TEXT`
- `event_name TEXT` (view_analysis, submit_plan, photo_uploaded, etc.)
- `payload JSON`
- `created_at INTEGER`

---

## 📧 Email Configuration

### Dev Mode (Default)
If `SMTP_HOST` is not set, Nodemailer uses **createTestAccount**:

```
✓ Email queued to: test@wififly.local
✓ Preview URL: https://nodemailer.com/test/...
```

Click the preview link to see email in browser.

### Real SMTP
Set environment variables to use real email:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Gmail Note**: Use [App Passwords](https://support.google.com/accounts/answer/185833) (not main password).

---

## 🔐 Security Features

✅ **Input Validation**: Zod schema validation on all endpoints  
✅ **File Upload**: Sanitized filenames, MIME type checking  
✅ **Session Validation**: Every request requires valid session ID  
✅ **Rate Limiting**: 100 requests/minute per IP (configurable)  
✅ **CORS**: Configured for localhost:3000 (change in production)  
✅ **Error Handling**: No stack traces leaked in responses  
✅ **Secrets**: All sensitive data in `.env` (never in code)

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend && npm install && cd ..
```

### "EADDRINUSE: address already in use :::4000"
Port 4000 is already running. Kill the process:
```bash
# macOS/Linux
lsof -ti:4000 | xargs kill -9

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### "Cannot find sqlite database"
Database file doesn't exist:
```bash
npm run migrate
npm run seed
```

### "Email not sending"
Check configuration:
```bash
# Dev mode - check console for preview link
# Real SMTP - verify credentials in .env and check SMTP server connectivity
```

### "Photos not uploading"
Check permissions:
```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### "Tests failing"
Clear cache and reinstall:
```bash
rm -rf node_modules backend/node_modules frontend/node_modules
npm run bootstrap
npm test
```

---

## 📈 Analytics Events Logged

All events written to `backend/logs/analytics.log` + `analytics_logs` table:

- `view_analysis` - User viewed results page
- `click_send_plan` - User clicked form CTA
- `submit_plan` - User submitted lead form
- `anomaly_flag_shown` - Anomalous speeds detected
- `photo_uploaded` - Photo attached to submission
- `download_pdf` - User downloaded report (if implemented)

Query events:
```bash
sqlite3 backend/data/wififly.sqlite \
  "SELECT * FROM analytics_logs ORDER BY created_at DESC LIMIT 10;"
```

---

## 🚀 Deployment

### Docker (Optional)
Included `Dockerfile` for containerized deployment. Build and run:
```bash
docker build -t wififly .
docker run -p 3000:3000 -p 4000:4000 -e PORT=4000 wififly
```

### VPS Deployment
1. Install Node.js 18+
2. Clone repository
3. Configure `.env` with real SMTP, database path, etc.
4. Run `npm run build && npm start`
5. Use PM2 or systemd to manage processes

---

## 📝 API Reference

### Sessions
- `POST /api/session/start` - Create/retrieve session

### Tests
- `POST /api/tests/result` - Save speed test result
- `GET /test/download?size=1048576` - Download test endpoint
- `POST /test/upload` - Upload test endpoint
- `GET /test/ping` - Ping measurement endpoint

### Users
- `POST /api/users` - Create/update user profile
- `GET /api/session/:id` - Retrieve session + all linked data

### Submissions
- `POST /api/submissions` - Submit lead form + photo

### Analytics
- `POST /api/analytics` - Log analytics event
- `GET /api/logs/analytics` - Retrieve analytics (admin only)

### Config
- `GET /api/config` - Get server configuration (ANOMALY_SPEED_THRESHOLD, etc.)

### Health
- `GET /api/health` - Health check endpoint

---

## 🎯 Next Steps (After Local Testing)

1. **Customize UX Copy**: Edit page templates in `frontend/pages/`
2. **Add Logo**: Replace favicon in `frontend/public/`
3. **Configure ISP List**: Update in `frontend/lib/config.ts`
4. **Add Real Speed Test Backend**: Replace `/test/` endpoints with real server
5. **Implement Premium Features**: Add subscription logic in Analysis page
6. **Deploy**: Push to VPS, configure DNS, enable HTTPS

---

## 📞 Support

For issues or questions:
1. Check **Troubleshooting** section above
2. Review **API Reference** for endpoint details
3. Check `backend/logs/` and browser console for errors
4. Run `npm run lint` to check code quality

---

## 📄 License

This project is provided as-is for local development and testing. See LICENSE file for details.

---

## 🙏 Credits

Built with:
- Next.js, React, TypeScript, Tailwind CSS
- Express, Node.js, SQLite
- Nodemailer, Multer, Zod
- Jest, Supertest, React Testing Library

---

**Last Updated**: November 15, 2025  
**Version**: 1.0.0  
**Status**: Ready for Development
