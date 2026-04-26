import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  const { accessToken, role, userId, fullName, isAuthenticated, setAuth, clearAuth } =
    useAuthStore();
  return { accessToken, role, userId, fullName, isAuthenticated, setAuth, clearAuth };
}
