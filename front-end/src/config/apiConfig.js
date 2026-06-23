/**
 * API Configuration
 * Dynamically determines the API base URL based on environment
 */

const getApiBaseUrl = () => {
  // In development with Vite dev server, use relative paths (leverages proxy in vite.config.js)
  if (import.meta.env.DEV) {
    return '';  // Empty string = use relative paths, proxy will handle it
  }

  // In production (built app)
  const { protocol, hostname, port } = window.location;
  
  // Common VPS/production patterns
  // If port is 3000 (backend on same machine), connect to backend
  if (port === '3000') {
    return '';  // Same port, use relative
  }
  
  // If port is 5173 (Vite dev) but compiled, try localhost:3000
  if (port === '5173') {
    return `${protocol}//${hostname}:3000`;
  }

  // For other ports or no port (standard HTTP/HTTPS)
  // Try to detect if backend is on the same domain
  // Assume backend is on same domain with :3000 port for VPS
  const backendPort = protocol === 'https:' ? '3000' : '3000';
  
  // If we're on a domain (not localhost), try same domain with backend port
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:${backendPort}`;
  }

  // Default: same domain, same port
  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
};

export const API_BASE_URL = getApiBaseUrl();

export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Already a full URL
  if (String(imagePath).startsWith('http')) {
    return imagePath;
  }
  
  // Relative path like /uploads/payment-proofs/file.jpg
  if (API_BASE_URL) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Use relative path directly (for proxy in dev)
  return imagePath;
};
