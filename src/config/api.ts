// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    BILLING: '/api/v1/',
    USERS: '/api/v1/users',
    COMPLIANCE: '/api/v1/compliance',
  }
} as const;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`; 