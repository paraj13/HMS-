import * as jwt_decode from "jwt-decode";

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token) {
    redirectToSignin();
    return null;
  }

  try {
    // decode and cast instead of using type argument
    const decoded = ((jwt_decode as any).default(token) as DecodedToken) || {};
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp && decoded.exp < currentTime) {
      removeTokenAndRedirect();
      return null;
    }
  } catch (err) {
    removeTokenAndRedirect();
    return null;
  }

  return token;
}

function removeTokenAndRedirect() {
  localStorage.removeItem("token");
  redirectToSignin();
}

function redirectToSignin() {
  window.location.href = "/signin";
}

export function getRole(): string {
  if (typeof window === "undefined") return "guest";

  // ✅ If role is already stored in localStorage
  const storedRole = localStorage.getItem("role");
  if (storedRole) return storedRole;

  // ✅ Otherwise, decode role from token
  const token = localStorage.getItem("token");
  if (!token) return "guest";

  try {
    const decoded = ((jwt_decode as any).default(token) as DecodedToken) || {};
    return decoded.role || "guest";
  } catch {
    return "guest";
  }
}