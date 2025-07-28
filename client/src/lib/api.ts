import { apiRequest } from "./queryClient";

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiRequest('POST', '/api/auth/login', credentials),
  
  register: (userData: any) =>
    apiRequest('POST', '/api/auth/register', userData),
};

// User API
export const userAPI = {
  getProfile: () => apiRequest('GET', '/api/user/profile'),
  getStats: () => apiRequest('GET', '/api/user/stats'),
  getRecentActivity: () => apiRequest('GET', '/api/user/recent-activity'),
  getBadges: () => apiRequest('GET', '/api/user/badges'),
};

// Topics API
export const topicsAPI = {
  getAll: () => apiRequest('GET', '/api/topics'),
  getRecommended: () => apiRequest('GET', '/api/topics/recommended'),
};

// Explanations API
export const explanationsAPI = {
  create: (explanationData: FormData) =>
    apiRequest('POST', '/api/explanations', explanationData),
  
  getPublic: () => apiRequest('GET', '/api/explanations/public'),
  
  vote: (explanationId: string, isUpvote: boolean) =>
    apiRequest('POST', `/api/explanations/${explanationId}/vote`, { isUpvote }),
};

// Leaderboard API
export const leaderboardAPI = {
  get: () => apiRequest('GET', '/api/leaderboard'),
};

// Reports API
export const reportsAPI = {
  get: (type?: string) => {
    const params = type ? `?type=${type}` : '';
    return apiRequest('GET', `/api/reports${params}`);
  },
  
  generate: (type: string, period?: string) =>
    apiRequest('POST', '/api/reports/generate', { type, period }),
};

// Admin API
export const adminAPI = {
  seed: () => apiRequest('POST', '/api/admin/seed'),
};
