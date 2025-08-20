// Application-wide constants

export const APP_CONFIG = {
  name: "فني صحي الكويت",
  description: "منصة للفنيين الصحيين ��ي الك����ت",
  version: "1.0.0",
} as const;

export const API_ENDPOINTS = {
  // Posts
  POSTS: "/api/posts",
  POST_BY_ID: (id: number) => `/api/posts/${id}`,
  POST_LIKE: (id: number) => `/api/posts/${id}/like`,

  // Comments
  COMMENTS: "/api/comments",
  COMMENT_BY_ID: (id: number) => `/api/comments/${id}`,

  // Replies
  REPLIES: "/api/replies",
  REPLY_BY_ID: (id: number) => `/api/replies/${id}`,

  // Users
  USERS: "/api/users",
  USER_BY_ID: (id: string) => `/api/users/${id}`,

  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  REFRESH: "/api/auth/refresh",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  EMAIL_CONFIRMATION: "/email-confirmation",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  POSTS: "/posts",
  POST_DETAIL: (id: number) => `/posts/${id}`,
  ADD_POST: "/posts/new",
  PLUMBERS: "/plumbers",
  PLUMBER_DETAIL: (id: string) => `/plumber/${id}`,
  PROFILE: "/profile",
  PROFILE_DETAIL: (id: string) => `/profile/${id}`,
  CHAT: "/chat",
  CHAT_WITH_USER: (id: string) => `/chat/${id}`,
  ARTICLES: "/articles",
  ARTICLE_DETAIL: (id: string) => `/articles/${id}`,
  ADD_ARTICLE: "/articles/new",
  SERVICES: "/services",
  SERVICE_DETAIL: (id: string) => `/services/${id}`,
  COMPLAIN: "/complain",
  COMPLAINTS: "/complaints",
  NOTIFICATIONS: "/notifications",
  HOW_TO_CHOOSE: "/how-to-choose-plumber",
  HOW_CAN_WE_HELP: "/how-can-we-help-you",
  PLUMBER_DASHBOARD: "/plumber-dashboard",
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  THEME: "theme",
  LANGUAGE: "language",
} as const;

export const VALIDATION_RULES = {
  POST_MIN_LENGTH: 10,
  POST_MAX_LENGTH: 500,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_PATTERN: /^(\+965)?[0-9]{8}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Password validation patterns
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_PATTERNS: {
    // At least one lowercase letter
    LOWERCASE: /[a-z]/,
    // At least one uppercase letter
    UPPERCASE: /[A-Z]/,
    // At least one number
    NUMBER: /[0-9]/,
    // At least one special character
    SPECIAL: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  },
} as const;

export const KUWAIT_CITIES = [
  "الكويت",
  "حولي",
  "الفروانية",
  "الأحمدي",
  "الجهراء",
  "مبارك الكبير",
  "العاصمة",
  "السالمية",
  "الفحيحيل",
  "جليب الشيوخ",
  "الفنطاس",
  "المنقف",
  "ضاحية ��باح السالم",
  "صباح الأحمد البحرية",
  "الوفرة السكنية",
  "جنوب الصباحية",
  "الخيران السكنية",
  "شرق الأحمدي",
  "ميناء عبدالله",
  "الزور",
] as const;

export const USER_ROLES = {
  USER: "client",
  PLUMBER: "plumber",
  ADMIN: "admin",
} as const;

export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: "تم تسجيل الدخول بنجاح",
  LOGIN_ERROR: "فشل في تسجيل الدخول",
  LOGOUT_SUCCESS: "تم تسجيل الخروج بنجاح",
  POST_CREATED: "تم إنشاء المنشور بنجاح",
  POST_UPDATED: "تم تحديث المنشور بنجاح",
  POST_DELETED: "تم حذف المنشور بنجاح",
  PROFILE_UPDATED: "تم تحديث الملف الشخصي بنجاح",
  COMMENT_ADDED: "تم إضافة التعليق بنجاح",
  GENERIC_ERROR: "حدث خطأ غير متوقع",
  NETWORK_ERROR: "خطأ في الاتصال بالشبكة",
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const BREAKPOINTS = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;
