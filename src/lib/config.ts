/**
 * Application Configuration
 * Centralized environment variable management with defaults
 */

// Backend URL - defaults to localhost:3001 for development
const getBackendUrl = (): string => {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  
  if (backendUrl) {
    return backendUrl;
  }
  
  // Development default
  return 'http://localhost:3001';
};

export const config = {
  backend: {
    // Backend server URL used by API routes (server-side)
    url: getBackendUrl(),
    
    // Request timeout in milliseconds
    timeout: 30000,
    
    // Endpoints
    endpoints: {
      empty: '/empty.php',
      garbage: '/garbage.php',
      getIp: '/getIP.php',
    },
  },
};

// Validate backend URL on startup
if (typeof window === 'undefined') {
  // Server-side only
  const backendUrl = config.backend.url;
  if (!backendUrl.startsWith('http')) {
    console.warn(
      '[Config] Backend URL does not start with http:// or https://' +
      ` Got: ${backendUrl}`
    );
  }
}

export default config;
