# Backend URL Configuration - Quick Reference

## ✅ Changes Made

### 1. Created Configuration Module
**File:** `src/lib/config.ts`
- Centralized environment variable management
- Checks `BACKEND_URL` environment variable
- Falls back to `http://localhost:3001` for development
- Validates URL format on startup

### 2. Updated API Route
**File:** `src/app/api/backend/route.ts`
- Removed hardcoded `http://localhost:3001`
- Now uses `config.backend.url` from environment
- Updated comments to reflect configuration method

### 3. Environment Variable Files
**File:** `.env.local` (Development)
```bash
BACKEND_URL=http://localhost:3001
```

**File:** `.env.production` (Production)
```bash
# Docker Compose (recommended)
BACKEND_URL=http://wififly-app:3001

# VPS with external backend
# BACKEND_URL=http://your-vps-ip:3001
```

---

## 🚀 How to Use

### Local Development
1. Backend running on `localhost:3001`
2. `.env.local` already configured ✓
3. No changes needed - works as before

### Docker Compose
1. Update `.env.production`:
   ```bash
   BACKEND_URL=http://wififly-app:3001
   ```
2. Services on same network communicate internally
3. Clean, no port exposure needed

### VPS Deployment
1. Update `.env.production`:
   ```bash
   BACKEND_URL=http://localhost:3001
   ```
2. Or if backend on different server:
   ```bash
   BACKEND_URL=http://backend-server-ip:3001
   ```
3. Deploy and test

---

## 🔍 Configuration Priority

The app checks in this order:
1. `BACKEND_URL` environment variable ← **USE THIS**
2. `NEXT_PUBLIC_BACKEND_URL` (if set) ← Client-side visible
3. `http://localhost:3001` ← Fallback for development

---

## ✨ Best Practices Implemented

✅ **Single Responsibility:** Config centralized in `src/lib/config.ts`  
✅ **Environment-Based:** Different values for dev/prod  
✅ **Sensible Defaults:** Works locally without extra setup  
✅ **Type-Safe:** Full TypeScript support  
✅ **Validated:** URL format checked on startup  
✅ **Documented:** Clear comments in code  
✅ **Flexible:** Works with Docker, VPS, external servers  

---

## 🧪 Testing

### Verify Configuration
```bash
# Local development
npm run dev
# Should use BACKEND_URL from .env.local

# Production build
npm run build
# Should use BACKEND_URL from .env.production
```

### Check Backend Connection
```bash
# In your test, should NOT see error 502
# Should see speed test results loaded
```

---

## 📝 Next Steps

1. ✅ Configuration is now production-ready
2. Test locally: `npm run dev` (should work as before)
3. Build: `npm run build` (verify no errors)
4. Deploy with proper `BACKEND_URL` environment variable

---

**Issue Status: ✅ RESOLVED**
- Hardcoded URL: ✅ Fixed
- Environment Configuration: ✅ Implemented
- Best Practices: ✅ Applied
- Documentation: ✅ Complete
