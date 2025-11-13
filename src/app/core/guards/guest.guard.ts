import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * 🔴 GuestGuard - Prevents logged-in users from accessing SignIn/SignUp pages
 * 
 * ✅ Logged-in users → Redirect to /account
 * ❌ Not logged-in users → Allow access to auth pages
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('[GuestGuard] 🔍 Checking auth state for:', state.url);
  
  if (authService.isLoggedIn()) {
    console.log('[GuestGuard] ✅ User is logged in, redirecting to account');
    return router.parseUrl('/account');
  }
  
  console.log('[GuestGuard] ❌ User not logged in, allowing access to auth page');
  return true;
};