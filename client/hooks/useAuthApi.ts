import { useState, useEffect } from "react";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "client" | "plumber" | "admin";
  image?: string;
  is_verified: boolean;
  access_token?: string;
  refresh_token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  location_id: number;
  role: "client" | "plumber";
  image?: File;
}

// Mock users for authentication
const mockUsers: AuthUser[] = [
  {
    id: 1,
    name: "محمد أحمد",
    email: "client@example.com",
    role: "client",
    is_verified: false,
    access_token: "mock_access_token_client",
    refresh_token: "mock_refresh_token_client",
  },
  {
    id: 2,
    name: "علي السباك",
    email: "fahad.plumber@example.com",
    role: "plumber",
    image: "/placeholder.svg",
    is_verified: true,
    access_token: "mock_access_token_plumber",
    refresh_token: "mock_refresh_token_plumber",
  },
  {
    id: 3,
    name: "أحمد علاء",
    email: "alaa@gmail.com",
    role: "admin",
    is_verified: true,
    access_token: "mock_access_token_admin",
    refresh_token: "mock_refresh_token_admin",
  },
];

// Authentication API functions
export const authApi = {
  // POST /api/token/
  login: async (credentials: LoginCredentials): Promise<AuthUser> => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

    const user = mockUsers.find((u) => u.email === credentials.email);

    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    // In real implementation, you would verify password here
    // For mock, we accept any password

    // Store tokens in localStorage (in real app, handle this securely)
    localStorage.setItem("access_token", user.access_token!);
    localStorage.setItem("refresh_token", user.refresh_token!);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  },

  // POST /api/users/
  register: async (data: RegisterData): Promise<AuthUser> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === data.email);
    if (existingUser) {
      throw new Error("البريد الإلكتروني مستخدم بالفعل");
    }

    const newUser: AuthUser = {
      id: mockUsers.length + 1,
      name: data.name,
      email: data.email,
      role: data.role,
      image: data.image ? "/placeholder.svg" : undefined,
      is_verified: false,
      access_token: `mock_access_token_${data.email}`,
      refresh_token: `mock_refresh_token_${data.email}`,
    };

    mockUsers.push(newUser);

    // Auto-login after registration
    localStorage.setItem("access_token", newUser.access_token!);
    localStorage.setItem("refresh_token", newUser.refresh_token!);
    localStorage.setItem("user", JSON.stringify(newUser));

    return newUser;
  },

  // POST /api/token/refresh/
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In real implementation, validate refresh token
    const newAccessToken = `new_access_token_${Date.now()}`;
    localStorage.setItem("access_token", newAccessToken);

    return { access: newAccessToken };
  },

  // Logout (client-side only for mock)
  logout: async (): Promise<void> => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },

  // Get current user from storage
  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("access_token");
    const user = authApi.getCurrentUser();
    return !!(token && user);
  },

  // Get authorization header for API requests
  getAuthHeader: (): { Authorization: string } | {} => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Custom hook for authentication
export function useAuthApi() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authApi.login(credentials);
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authApi.register(data);
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ أثناء التسجيل";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) throw new Error("No refresh token");

      await authApi.refreshToken(refreshToken);
    } catch (err) {
      console.error("Error refreshing token:", err);
      // If refresh fails, logout user
      logout();
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    clearError: () => setError(null),
  };
}
