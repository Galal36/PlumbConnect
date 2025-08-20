import { formatError } from "@/utils";

// Real API Service for Backend Integration
const API_BASE_URL = 'http://localhost:8001/api';

// Types for API requests and responses
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  location_id: number;
  role: "client" | "plumber";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface Location {
  id: number;
  city: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: {
    id: number;
    city: string;
  };
  role: "client" | "plumber" | "admin";
  status?: string;
  image?: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  image?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user: User;
  ai_review_score?: number;
  ai_review_summary?: string;
  ai_review_concerns?: {
    safety: string[];
    inappropriate: boolean;
  };
}

// Utility function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: any = await response.json().catch(() => ({}));

    // Try to extract a meaningful message from common DRF/JWT shapes
    let extracted =
      (errorData && (errorData.detail || errorData.message)) ||
      (Array.isArray(errorData?.non_field_errors) && errorData.non_field_errors[0]) ||
      // pick first field error if exists { field: [msg] }
      (errorData && typeof errorData === 'object'
        ? (() => {
            const firstKey = Object.keys(errorData)[0];
            const val = firstKey ? errorData[firstKey] : undefined;
            if (Array.isArray(val) && val.length) return val[0];
            if (typeof val === 'string') return val;
            return undefined;
          })()
        : undefined);

    let message = typeof extracted === 'string' && extracted.trim().length > 0
      ? extracted
      : `HTTP error! status: ${response.status}`;

    const url = response.url || '';
    const lower = String(message).toLowerCase();

    // Friendly Arabic messages for auth endpoints
    if (url.includes('/api/token/')) {
      if (response.status === 400) {
        if (
          lower.includes('invalid') ||
          lower.includes('no active account') ||
          lower.includes('credentials')
        ) {
          message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        } else if (lower.includes('not active') || lower.includes('inactive')) {
          message = 'حسابك غير مُفعل. يرجى تفعيل بريدك الإلكتروني أولاً.';
        } else {
          message = 'تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى';
        }
      } else if (response.status === 401) {
        message = 'غير مصرح به. يرجى تسجيل الدخول مرة أخرى.';
      }
    }

    // Friendly Arabic messages for user update endpoints (including password change)
    if (url.includes('/api/users/') && url.includes('/')) {
      if (response.status === 400) {
        if (lower.includes('old_password') || lower.includes('current password')) {
          message = 'كلمة المرور الحالية غير صحيحة';
        } else if (lower.includes('new_password') || lower.includes('password')) {
          message = 'كلمة المرور الجديدة لا تستوفي المتطلبات';
        } else if (lower.includes('validation') || lower.includes('invalid')) {
          message = 'بيانات غير صحيحة، يرجى التحقق من المدخلات';
        } else if (lower.includes('phone') && lower.includes('exists')) {
          message = 'رقم الهاتف مستخدم بالفعل';
        } else if (lower.includes('email') && lower.includes('exists')) {
          message = 'البريد الإلكتروني مستخدم بالفعل';
        } else {
          message = 'تعذر تحديث البيانات. تحقق من المدخلات وحاول مرة أخرى';
        }
      } else if (response.status === 403) {
        message = 'غير مصرح لك بتحديث هذه البيانات';
      } else if (response.status === 404) {
        message = 'المستخدم غير موجود';
      }
    }

    throw {
      message,
      status: response.status,
      errors: errorData?.errors || errorData,
    } as ApiError;
  }
  return response.json();
}

// API Service Class
export class RealApiService {
  private baseUrl = API_BASE_URL;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const newAccessToken = data.access;
      
      // Store the new access token
      localStorage.setItem('access_token', newAccessToken);
      
      // If we also get a new refresh token, store it too
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      
      return newAccessToken;
    } catch (error) {
      // If refresh fails, clear all tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      // Redirect to login page
      window.location.href = '/login';
      throw error;
    }
  }

  public async makeAuthenticatedRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    let accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Add authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      // If token is expired, try to refresh it
      if (response.status === 401) {
        if (this.isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => this.makeAuthenticatedRequest(url, options));
        }

        this.isRefreshing = true;

        try {
          const newToken = await this.refreshToken();
          this.isRefreshing = false;
          this.processQueue(null, newToken);
          
          // Retry the original request with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(url, { ...options, headers });
        } catch (error) {
          this.isRefreshing = false;
          this.processQueue(error, null);
          throw error;
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get available locations
  async getLocations(): Promise<Location[]> {
    const response = await fetch(`${this.baseUrl}/locations/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await handleApiResponse<{ results: Location[] }>(response);
    return data.results || [];
  }

  // Get all plumbers
  async getPlumbers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/users/plumbers/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await handleApiResponse<{ results: User[] }>(response);
    return data.results || [];
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleApiResponse<{ message: string }>(response);
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleApiResponse<AuthResponse>(response);
  }

  // Get current user data
  async getCurrentUser(): Promise<User> {
    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/users/me/`);
    return handleApiResponse<User>(response);
  }

  // Update user profile
  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    location_id?: number;
    image?: string | File;
  }): Promise<User> {
    // Check if we have image data (File object or base64)
    const hasImage = profileData.image && (
      profileData.image instanceof File || 
      (typeof profileData.image === 'string' && profileData.image.startsWith('data:image/'))
    );

    if (hasImage) {
      // Use FormData for file uploads
      const formData = new FormData();
      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.phone) formData.append('phone', profileData.phone);
      if (profileData.location_id) formData.append('location_id', profileData.location_id.toString());
      
      if (profileData.image instanceof File) {
        // Direct file upload
        formData.append('image', profileData.image);
      } else if (typeof profileData.image === 'string' && profileData.image.startsWith('data:image/')) {
        // Convert base64 to file
        const base64Data = profileData.image;
        const byteString = atob(base64Data.split(',')[1]);
        const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], 'profile-image.jpg', { type: mimeString });
        formData.append('image', file);
      }

      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/users/me/`, {
        method: 'PATCH',
        body: formData,
      });
      return handleApiResponse<User>(response);
    } else {
      // No image, use JSON
      const { image, ...jsonData } = profileData;
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/users/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });
      return handleApiResponse<User>(response);
    }
  }

  // Change password
  async changePassword(passwordData: {
    old_password: string;
    new_password: string;
  }): Promise<{ message: string }> {
    // Use the /users/me/ endpoint directly for better performance
    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/users/me/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: passwordData.old_password,
        password: passwordData.new_password,
      }),
    });
    return handleApiResponse<{ message: string }>(response);
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleApiResponse<{ message: string }>(response);
  }

  // Confirm password reset
  async confirmPasswordReset(uidb64: string, token: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/password-reset/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uidb64,
        token,
        new_password: newPassword,
      }),
    });
    return handleApiResponse<{ message: string }>(response);
  }

  // Activate account
  async activateAccount(uidb64: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/activate/${uidb64}/${token}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleApiResponse<{ message: string }>(response);
  }

  // Article methods
  async createArticle(articleData: {
    title: string;
    description: string;
    image?: File;
  }): Promise<Article> {
    const formData = new FormData();
    formData.append('title', articleData.title);
    formData.append('description', articleData.description);
    
    if (articleData.image) {
      formData.append('image', articleData.image);
    }

    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/articles/`, {
      method: 'POST',
      body: formData,
    });
    return handleApiResponse<Article>(response);
  }

  async getArticles(): Promise<Article[]> {
    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/articles/`);
    return handleApiResponse<Article[]>(response);
  }

  async getArticle(id: string): Promise<Article> {
    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/articles/${id}/`);
    return handleApiResponse<Article>(response);
  }

  async approveArticle(id: string, isApproved: boolean): Promise<Article> {
    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/articles/${id}/approve/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_approved: isApproved }),
    });
    return handleApiResponse<Article>(response);
  }

  async deleteArticle(id: string): Promise<{ message: string }> {
    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/articles/${id}/`, {
      method: 'DELETE',
    });
    return handleApiResponse<{ message: string }>(response);
  }

  async updateArticle(id: string, articleData: {
    title?: string;
    description?: string;
    image?: File;
  }): Promise<Article> {
    const formData = new FormData();
    if (articleData.title) formData.append('title', articleData.title);
    if (articleData.description) formData.append('description', articleData.description);
    if (articleData.image) formData.append('image', articleData.image);

    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/articles/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
    return handleApiResponse<Article>(response);
  }

  async getUser(id: string): Promise<User> {
    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/users/${id}/`);
    return handleApiResponse<User>(response);
  }
}

// Export singleton instance
export const realApiService = new RealApiService();
export default realApiService;