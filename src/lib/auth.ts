"use client";

/**
 * Clears all authentication and session data stored in localStorage.
 */
export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove = [
      'login',
      'studentId',
      'classId',
      'authToken',
      'seen_incoming_messages_count',
      'seen_notices_count',
      'seen_incoming_messages_count_teacher',
      'seen_notices_count_teacher',
      'admin_current_view',
      'admin_selected_student_card',
      'admin_selected_class_history',
      'admin_selected_subject_history',
      'edit_class_selected_id',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Also remove cached history or drafts from previous sessions
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (key.startsWith('history_cache_') || key.startsWith('teacher_grades_draft_')) {
        localStorage.removeItem(key);
      }
    }
    sessionStorage.clear();
  } catch (e) {
    console.error('Error clearing auth session:', e);
  }
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
