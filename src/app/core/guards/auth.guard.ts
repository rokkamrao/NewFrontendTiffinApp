import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * 🟢 AuthGuard - Protects routes that require authentication
 * 
 * ✅ Logged-in users → Allow access
 * ❌ Not logged-in users → Redirect to login with returnUrl
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Skip auth check during SSR
  if (!isPlatformBrowser(platformId)) {
    console.log('[AuthGuard] SSR detected, allowing access');
    return true;
  }
  
  console.log('[AuthGuard] 🔍 Checking auth state for:', state.url);
  
  if (authService.isLoggedIn()) {
    console.log('[AuthGuard] ✅ User authenticated, allowing access');
    return true;
  }
  
  console.log('[AuthGuard] ❌ User not authenticated, redirecting to login');
  return router.parseUrl(`/auth/login?returnUrl=${encodeURIComponent(state.url)}`);
};