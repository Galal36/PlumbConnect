// Utility functions for the application

import { VALIDATION_RULES } from "@/constants";
import type { ApiError, LoadingState } from "@/types";

/**
 * Format error messages for display
 */
export const formatError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return "حدث خطأ غير متوقع";
};

/**
 * Create API error object
 */
export const createApiError = (
  message: string,
  status?: number,
  code?: string,
): ApiError => ({
  message,
  status,
  code,
});

/**
 * Format date to Arabic locale
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-KW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format time ago in Arabic
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "الآن";
  if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`;
  if (diffInHours < 24) return `قبل ${diffInHours} ساعة`;
  if (diffInDays < 7) return `قبل ${diffInDays} يوم`;

  return formatDate(dateString);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL_PATTERN.test(email);
};

/**
 * Validate phone number format (Kuwait)
 */
export const isValidPhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE_PATTERN.test(phone);
};

/**
 * Validate strong password
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "يرجى إدخال كلمة المرور";
  }

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return `يجب أن تكون كلمة المرور ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} أحرف على الأقل`;
  }

  const requirements = [];

  if (!VALIDATION_RULES.PASSWORD_PATTERNS.LOWERCASE.test(password)) {
    requirements.push("حرف صغير واحد على الأقل");
  }

  if (!VALIDATION_RULES.PASSWORD_PATTERNS.UPPERCASE.test(password)) {
    requirements.push("حرف كبير واحد على الأقل");
  }

  if (!VALIDATION_RULES.PASSWORD_PATTERNS.NUMBER.test(password)) {
    requirements.push("رقم واحد على الأقل");
  }

  if (!VALIDATION_RULES.PASSWORD_PATTERNS.SPECIAL.test(password)) {
    requirements.push("رمز خاص واحد على الأقل (!@#$%^&*)");
  }

  if (requirements.length > 0) {
    return `كلمة المرور ضعيفة. يجب أن تحتوي على: ${requirements.join("، ")}`;
  }

  return null;
};

/**
 * Get password strength score (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;

  let score = 0;

  // Length check
  if (password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH) score++;

  // Pattern checks
  if (VALIDATION_RULES.PASSWORD_PATTERNS.LOWERCASE.test(password)) score++;
  if (VALIDATION_RULES.PASSWORD_PATTERNS.UPPERCASE.test(password)) score++;
  if (VALIDATION_RULES.PASSWORD_PATTERNS.NUMBER.test(password)) score++;
  if (VALIDATION_RULES.PASSWORD_PATTERNS.SPECIAL.test(password)) score++;

  return Math.min(score, 4);
};

/**
 * Validate post content
 */
export const validatePost = (content: string): string | null => {
  if (!content.trim()) return "يرجى كتابة نص المنشور";
  if (content.trim().length < VALIDATION_RULES.POST_MIN_LENGTH) {
    return `يجب أن يكون نص المنشور ${VALIDATION_RULES.POST_MIN_LENGTH} أحرف على الأقل`;
  }
  if (content.trim().length > VALIDATION_RULES.POST_MAX_LENGTH) {
    return `يجب أن يكون نص المنشور ${VALIDATION_RULES.POST_MAX_LENGTH} حرف أو أقل`;
  }
  return null;
};

/**
 * Validate image file
 */
export const validateImage = (file: File): string | null => {
  if (!file.type.startsWith("image/")) {
    return "يجب أن يكون الملف صورة";
  }
  if (file.size > VALIDATION_RULES.IMAGE_MAX_SIZE) {
    return "يجب أن يكون حجم الصورة أقل من 5 ميجابايت";
  }
  return null;
};

/**
 * Generate avatar initials from name
 */
export const getAvatarInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Safe storage operations
 */
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Fail silently
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Fail silently
    }
  },

  getJSON: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  setJSON: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Fail silently
    }
  },
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if loading state is pending
 */
export const isLoading = (state: LoadingState): boolean => {
  return state === "loading";
};

/**
 * Check if loading state is successful
 */
export const isSuccess = (state: LoadingState): boolean => {
  return state === "success";
};

/**
 * Check if loading state is error
 */
export const isError = (state: LoadingState): boolean => {
  return state === "error";
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Get user role display name
 */
export const getUserRoleDisplayName = (role: string): string => {
  switch (role) {
    case "plumber":
      return "مختص فني صحي";
    case "admin":
      return "مدير";
    case "user":
    default:
      return "مستخدم";
  }
};

/**
 * Get the correct profile URL based on user role
 */
export const getProfileUrl = (userId: string | number, userRole?: string): string => {
  if (userRole === 'plumber') {
    return `/plumber/${userId}`;
  }
  return `/profile/${userId}`;
};
