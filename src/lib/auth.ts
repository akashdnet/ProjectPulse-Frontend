import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export interface DecodedToken {
  id?: string;
  userId?: string;
  email?: string;
  role?: "STUDENT" | "MENTOR" | "ADMIN" | string;
  status?: "PENDING" | "ACTIVE" | "BLOCKED" | string;
  name?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export const TOKEN_KEY = "accessToken";

/**
 * Safely decodes a JWT token string
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (err) {
    console.error("Failed to decode JWT token:", err);
    return null;
  }
}

/**
 * Saves auth token in both localStorage and Cookies for SSR/Middleware compatibility
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    Cookies.set(TOKEN_KEY, token, { expires: 7, path: "/" });
  }
}

/**
 * Retrieves the stored auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || Cookies.get(TOKEN_KEY) || null;
}

/**
 * Removes auth token from both localStorage and Cookies
 */
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    Cookies.remove(TOKEN_KEY, { path: "/" });
  }
}

/**
 * Gets currently logged in user info from the stored JWT
 */
export function getCurrentUser(): DecodedToken | null {
  const token = getAuthToken();
  if (!token) return null;
  return decodeToken(token);
}

/**
 * Gets the role of the logged in user
 */
export function getUserRole(): string | null {
  const user = getCurrentUser();
  return user?.role || null;
}

/**
 * Checks if current logged in user has ADMIN role
 */
export function isAdmin(): boolean {
  return getUserRole()?.toUpperCase() === "ADMIN";
}

/**
 * Checks if current logged in user has MENTOR role
 */
export function isMentor(): boolean {
  return getUserRole()?.toUpperCase() === "MENTOR";
}

/**
 * Checks if current logged in user has STUDENT role
 */
export function isStudent(): boolean {
  return getUserRole()?.toUpperCase() === "STUDENT";
}

/**
 * Gets the status of the logged in user (e.g. ACTIVE, PENDING, BLOCKED)
 */
export function getUserStatus(): string | null {
  const user = getCurrentUser();
  return user?.status || null;
}

/**
 * Checks if the user is currently authenticated and token is not expired
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  const decoded = decodeToken(token);
  if (!decoded) return false;
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    removeAuthToken();
    return false;
  }
  return true;
}
