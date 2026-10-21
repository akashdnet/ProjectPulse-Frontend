import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const formatBaseUrl = (url?: string): string => {
  let formatted = (url || "https://project-pulse-backend-rose.vercel.app/api/v1").trim();

  // Ensure protocol is present
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  // Remove trailing slashes
  formatted = formatted.replace(/\/+$/, "");

  // Ensure /api/v1 suffix is present
  if (!/\/api\/v1$/i.test(formatted)) {
    formatted = `${formatted}/api/v1`;
  }

  return formatted;
};

const baseURL = formatBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Authorization Bearer token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token: string | null | undefined = null;

    if (typeof window !== "undefined") {
      // Check localStorage first, fallback to js-cookie
      token = localStorage.getItem("accessToken") || Cookies.get("accessToken");
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { axiosInstance };
export default axiosInstance;
