export type AdminRole = 
  | 'Super Admin' 
  | 'Press & Media' 
  | 'Innovation Director' 
  | 'Financial Secretary';

export interface AdminSessionUser {
  id: number;
  username: string;
  name: string;
  role: AdminRole | string;
  email: string;
}

/**
 * Role-Based Access Control (RBAC) Module Permission Checker
 */
export function hasModulePermission(role: AdminRole | string, path: string): boolean {
  if (role === 'Super Admin') return true;

  if (role === 'Press & Media') {
    return path.startsWith('/admin/news') || path.startsWith('/admin/about') || path.startsWith('/admin/gallery') || path === '/admin';
  }

  if (role === 'Innovation Director') {
    return path.startsWith('/admin/innovations') || path.startsWith('/admin/opportunities') || path === '/admin';
  }

  if (role === 'Financial Secretary') {
    return path.startsWith('/admin/scholarships') || path.startsWith('/admin/resources') || path === '/admin';
  }

  return true;
}
