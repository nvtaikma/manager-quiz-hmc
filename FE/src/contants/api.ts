// API Base URL
// Sử dụng relative URLs cho API routes trong Next.js
// Điều này sẽ hoạt động với bất kỳ domain nào (localhost, manager.testhmc.site, etc.)
export const API_BASE_URL = "http://localhost:3000/api";
// export const API_BASE_URL = "http://160.30.160.161:3000/api";
// export const API_BASE_URL = "http://157.10.199.146:3000/api";
// export const API_BASE_URL = "https://manager-api.testhmc.site/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    CHECK: "/api/auth/check",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  // Accounts
  ACCOUNTS: "/api/accounts",

  // Orders (có thể mở rộng trong tương lai)
  ORDERS: "/api/orders",

  // Products (có thể mở rộng trong tương lai)
  PRODUCTS: "/api/products",

  // Exams (có thể mở rộng trong tương lai)
  EXAMS: "/api/exams",

  // Announcements
  ANNOUNCEMENTS: "/api/announcements",
} as const;

// Helper function để tạo full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Xuất các URL thường dùng
export const API_URLS = {
  AUTH_LOGIN: API_ENDPOINTS.AUTH.LOGIN,
  AUTH_LOGOUT: API_ENDPOINTS.AUTH.LOGOUT,
  AUTH_CHECK: API_ENDPOINTS.AUTH.CHECK,
  AUTH_CHANGE_PASSWORD: API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
  ACCOUNTS: API_ENDPOINTS.ACCOUNTS,
  ANNOUNCEMENTS: API_ENDPOINTS.ANNOUNCEMENTS,
} as const;
