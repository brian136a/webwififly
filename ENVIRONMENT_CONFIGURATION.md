# Environment Configuration

## Development (.env.local)

```bash
# Backend URL for local development
# Defaults to http://localhost:3001 if not set
BACKEND_URL=http://localhost:3001
```

## Production (.env.production)

```bash
# For Docker Compose (app runs in same network)
BACKEND_URL=http://wififly-app:3001

# For external backend server
# BACKEND_URL=http://your-vps-ip:3001

# For HTTPS (if behind reverse proxy)
# BACKEND_URL=https://wififly.example.com/api/backend
```

## Docker Compose Setup

Update `docker-compose.yml` to pass environment variables:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://wififly-app:3001
    depends_on:
      - backend
  
  backend:
    image: node:20-alpine
    # ... your backend config
```

## VPS Deployment

When deploying to a VPS with environment variables:

```bash
# Set in your deployment script or systemd service
export BACKEND_URL="http://localhost:3001"

# Or pass to docker run
docker run -e BACKEND_URL=http://localhost:3001 wififly-app
```

## Configuration Priority

The application checks environment variables in this order:

1. `BACKEND_URL` - Recommended, use this
2. `NEXT_PUBLIC_BACKEND_URL` - Client-side visible (avoid secrets here)
3. `http://localhost:3001` - Default for local development

## How It Works

- **GET requests** (/api/backend/empty.php) → Proxied to backend
- **POST requests** (/api/backend/garbage.php) → Proxied with body
- All requests preserve query parameters and headers
- Backend must be reachable from the Next.js app server

## Troubleshooting

If you see "Backend error (502)" in tests:

1. Check backend is running: `curl http://localhost:3001/getIP.php`
2. Verify BACKEND_URL is correct: `echo $BACKEND_URL`
3. Check Docker network (if containerized): `docker network ls`
4. Verify firewall rules allow the connection
5. Check backend logs for errors
