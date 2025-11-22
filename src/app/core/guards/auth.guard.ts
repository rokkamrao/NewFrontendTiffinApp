import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * 🛡️ Enhanced AuthGuard - Protects routes that require authentication
 * 
 * ✅ Logged-in users → Allow access
 * 🔄 Token exists but no user → Validate session with backend
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
  
  console.log('[AuthGuard] 🛡️ Checking auth state for:', state.url);
  
  return authService.user$.pipe(
    take(1),
    switchMap(user => {
      if (user) {
        console.log('[AuthGuard] ✅ User authenticated, allowing access');
        return of(true);
      } else {
        // Check if we have stored auth data but user subject is null
        const token = authService.getToken();
        if (token) {
          console.log('[AuthGuard] 🔄 Token found but no user, validating session');
          return authService.validateSessionWithBackend().pipe(
            map(isValid => {
              if (isValid) {
                console.log('[AuthGuard] ✅ Session valid, allowing access');
                return true;
              } else {
                console.log('[AuthGuard] ❌ Session invalid, redirecting to login');
                return router.parseUrl(`/auth/login?returnUrl=${encodeURIComponent(state.url)}`);
              }
            })
          );
        } else {
          console.log('[AuthGuard] ❌ No authentication found, redirecting to login');
          return of(router.parseUrl(`/auth/login?returnUrl=${encodeURIComponent(state.url)}`));
        }
      }
    })
  );
};