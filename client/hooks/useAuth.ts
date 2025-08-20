import { useState, useEffect } from "react";
import { storage } from "@/utils";
import { STORAGE_KEYS } from "@/constants";
import type { User, AuthState, UserRole } from "@/types";

// Re-export types for backward compatibility
export type { User, UserRole };

// Mock authentication - in real app this would connect to API
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = storage.getJSON<any>(STORAGE_KEYS.USER_DATA);

        if (storedUser) {
          // Migrate old user format to new format
          const migratedUser: User = {
            id: typeof storedUser.id === 'string' ? parseInt(storedUser.id) : storedUser.id,
            name: storedUser.name,
            email: storedUser.email,
            phone: storedUser.phone,
            location: storedUser.location || { id: 1, city: storedUser.city || "الكويت" },
            avatar: storedUser.avatar,
            role: storedUser.role,
            status: storedUser.status,
            joinDate: storedUser.joinDate,
          };

          // Save migrated user back to storage
          storage.setJSON(STORAGE_KEYS.USER_DATA, migratedUser);

          setAuthState({
            user: migratedUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error loading authentication state:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    try {
      storage.setJSON(STORAGE_KEYS.USER_DATA, userData);
      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error saving user data:", error);
      // Still update state even if storage fails
      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  };

  const logout = () => {
    try {
      storage.remove(STORAGE_KEYS.USER_DATA);
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const switchToPlumberAccount = () => {
    // Mock function to switch user account to plumber account
    if (authState.user) {
      const plumberUser: User = {
        ...authState.user,
        role: "plumber",
        name: "أحمد الراشد", // Switch to plumber name for demo
      };
      login(plumberUser);
    }
  };

  const switchToUserAccount = () => {
    // Mock function to switch plumber account to user account
    if (authState.user) {
      const regularUser: User = {
        ...authState.user,
        role: "client",
        name: "فاطمة الكندري", // Switch to user name for demo
      };
      login(regularUser);
    }
  };

  return {
    ...authState,
    login,
    logout,
    switchToPlumberAccount,
    switchToUserAccount,
    isPlumber: authState.user?.role === "plumber",
    isUser: authState.user?.role === "client",
    isAdmin: authState.user?.role === "admin",
  };
}
