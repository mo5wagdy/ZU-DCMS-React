import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/api/auth.api";

export function useAuth() {
  const { accessToken, refreshToken, role, userId, fullName, isAuthenticated, setAuth, clearAuth } =
    useAuthStore();

  const logout = async () => {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (e) {
        console.error("Logout failed on server", e);
      }
    }
    clearAuth();
  };

  return { accessToken, refreshToken, role, userId, fullName, isAuthenticated, setAuth, clearAuth, logout };
}
