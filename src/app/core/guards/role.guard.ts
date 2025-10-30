import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

function decodeJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

export const roleGuard = (requiredRoles: string[] = ['ADMIN']): CanActivateFn => () => {
  const router = inject(Router);
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      // Redirect to appropriate login page based on required role
      if (requiredRoles.includes('ADMIN')) {
        return router.parseUrl('/auth/admin-login');
      } else if (requiredRoles.includes('DELIVERY') || requiredRoles.includes('DELIVERY_PARTNER')) {
        return router.parseUrl('/auth/delivery-login');
      }
      return router.parseUrl('/auth/login');
    }

    const payload = decodeJwt(token);
    // Check the 'role' field in the token payload (backend now includes it)
    const userRole = payload?.role;
    const userRoles: string[] = userRole ? [userRole] : [];

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles?.includes(role) || 
      (role === 'ADMIN' && userRole === 'ADMIN') ||
      (role === 'DELIVERY' && userRole === 'DELIVERY_USER') ||
      (role === 'DELIVERY_PARTNER' && userRole === 'DELIVERY_USER')
    );

    if (!hasRequiredRole) {
      console.warn('[RoleGuard] Access denied. User roles:', userRoles, 'Required:', requiredRoles);
      // Redirect to appropriate login page
      if (requiredRoles.includes('ADMIN')) {
        return router.parseUrl('/auth/admin-login');
      } else if (requiredRoles.includes('DELIVERY') || requiredRoles.includes('DELIVERY_PARTNER')) {
        return router.parseUrl('/auth/delivery-login');
      }
      return router.parseUrl('/auth/login');
    }

    return true;
  } catch (error) {
    console.error('[RoleGuard] Error checking roles:', error);
    if (requiredRoles.includes('ADMIN')) {
      return router.parseUrl('/auth/admin-login');
    } else if (requiredRoles.includes('DELIVERY') || requiredRoles.includes('DELIVERY_PARTNER')) {
      return router.parseUrl('/auth/delivery-login');
    }
    return router.parseUrl('/auth/login');
  }
};
