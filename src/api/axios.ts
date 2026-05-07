import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import i18next from "i18next";
import { useAuthStore } from "@/store/auth.store";

const BASE_URL = (import.meta.env.VITE_API_URL || "https://localhost:7125") + "/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Set language
  config.headers["Accept-Language"] = i18next.language || "ar-EG";
  
  return config;
});

let isRefreshing = false;
let queue: Array<(t: string | null) => void> = [];

const processQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            } else {
              reject(error);
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true });
        const newToken = data?.data?.accessToken;
        const newRefresh = data?.data?.refreshToken;
        if (newToken) {
          useAuthStore.getState().setAuth({
            accessToken: newToken,
            refreshToken: newRefresh,
            role: useAuthStore.getState().role || "",
            userId: useAuthStore.getState().userId || undefined,
            fullName: useAuthStore.getState().fullName || undefined,
          });
          processQueue(newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
        throw new Error("No token");
      } catch (e) {
        processQueue(null);
        useAuthStore.getState().clearAuth();
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth/login";
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper: unwraps ApiResponse<T> -> T (or throws with message)
export async function call<T>(
  promise: Promise<{ data: { isSuccess: boolean; message: string; data: T; errors: string[] } }>
): Promise<T> {
  try {
    const res = await promise;
    if (!res.data?.isSuccess) {
      const msg = res.data?.errors?.[0] || res.data?.message || "Request failed";
      throw new Error(i18next.t(msg));
    }
    return res.data.data as T;
  } catch (err) {
    const ax = err as AxiosError<{ message?: string; errors?: string[] }>;
    if (ax.isAxiosError) {
      const msg = ax.response?.data?.errors?.[0] || ax.response?.data?.message || ax.message;
      throw new Error(i18next.t(msg));
    }
    throw err;
  }
}
