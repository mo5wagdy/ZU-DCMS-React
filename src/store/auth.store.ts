import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  userId: string | null;
  fullName: string | null;
  isAuthenticated: boolean;
  setAuth: (data: {
    accessToken: string;
    refreshToken?: string;
    role: string;
    userId?: string;
    fullName?: string;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      userId: null,
      fullName: null,
      isAuthenticated: false,
      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? null,
          role: data.role,
          userId: data.userId ?? null,
          fullName: data.fullName ?? null,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          role: null,
          userId: null,
          fullName: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "zudcms_auth",
      // Only persist non-sensitive flags + role/userId for routing UX.
      // accessToken kept here for SPA convenience; switch to memory-only if needed.
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        role: s.role,
        userId: s.userId,
        fullName: s.fullName,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
