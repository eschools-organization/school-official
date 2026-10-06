"use client";

/**
 * Clears all authentication and session data stored in localStorage.
 */
export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('login');
    localStorage.removeItem('studentId');
    localStorage.removeItem('classId');
    localStorage.removeItem('authToken');
    localStorage.removeItem('seen_incoming_messages_count');
    localStorage.removeItem('seen_notices_count');
    localStorage.removeItem('seen_incoming_messages_count_teacher');
    localStorage.removeItem('seen_notices_count_teacher');
  } catch (e) {
    console.error('Error clearing auth session:', e);
  }
}

/**
 * Checks if an API response is 401 Unauthorized or 403 Forbidden.
 * If so, clears session and immediately redirects to login page.
 */
export function checkResponseAuth(res: Response): boolean {
  if (res.status === 401 || res.status === 403) {
    clearAuthSession();
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      const now = Date.now();
      const lastRedirect = parseInt(sessionStorage.getItem('last_auth_redirect') || '0', 10);
      if (now - lastRedirect > 3000) {
        sessionStorage.setItem('last_auth_redirect', now.toString());
        window.location.href = '/';
      }
    }
    return false;
  }
  return true;
}

/**
 * Validates if the current stored session in localStorage is valid and complete.
 * @param requiredRole Optional role to check against ('student' | 'teacher' | 'admin' | 'superadmin' | 'resource_center')
 */
export function validateSession(requiredRole?: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const loginDataStr = localStorage.getItem('login');
    if (!loginDataStr) return false;

    const loginData = JSON.parse(loginDataStr);
    if (!loginData || typeof loginData !== 'object' || !loginData.role) {
      return false;
    }

    if (requiredRole) {
      if (requiredRole === 'admin') {
        if (
          loginData.role !== 'admin' &&
          loginData.role !== 'superadmin' &&
          loginData.role !== 'resource_center'
        ) {
          return false;
        }
      } else if (loginData.role !== requiredRole) {
        return false;
      }
    }

    if (loginData.role === 'student') {
      const studentId = localStorage.getItem('studentId');
      const classId = localStorage.getItem('classId');
      if (!studentId || !classId) return false;
    } else if (
      loginData.role === 'teacher' ||
      loginData.role === 'admin' ||
      loginData.role === 'superadmin' ||
      loginData.role === 'resource_center'
    ) {
      if (!loginData.user_ID) return false;
    } else {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Asynchronously verifies authentication and role directly with the backend.
 * Clears localStorage session and returns false if backend authentication fails.
 */
export async function verifyServerAuth(requiredRole?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/auth/me', { headers });
    if (!res.ok) {
      clearAuthSession();
      return false;
    }
    const data = await res.json();
    if (!data.authenticated) {
      clearAuthSession();
      return false;
    }

    if (requiredRole) {
      const role = data.role;
      if (requiredRole === 'admin') {
        if (role !== 'admin' && role !== 'superadmin' && role !== 'resource_center') {
          clearAuthSession();
          return false;
        }
      } else if (role !== requiredRole && role !== 'superadmin') {
        clearAuthSession();
        return false;
      }
    }

    return true;
  } catch (e) {
    clearAuthSession();
    return false;
  }
}
