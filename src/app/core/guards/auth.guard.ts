import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

function decodeJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Skip localStorage check during SSR
  if (!isPlatformBrowser(platformId)) {
    console.log('[AuthGuard] SSR detected, allowing access');
    return true;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('[AuthGuard] No token found, redirecting to login');
      return router.parseUrl(`/auth/login?returnUrl=${encodeURIComponent(state.url)}`);
    }

    // Check if token is valid and not expired
    const payload = decodeJwt(token);
    if (!payload) {
      console.log('[AuthGuard] Invalid token, redirecting to login');
      localStorage.removeItem('authToken');
      return router.parseUrl(`/auth/login?returnUrl=${encodeURIComponent(state.url)}`);
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.log('[AuthGuard] Token expired, redirecting to login');
      localStorage.removeItem('authToken');
      return router.parseUrl(`/auth/login?returnUrl=${encodeURIComponent(state.url)}`);
    }

    console.log('[AuthGuard] User authenticated, allowing access');
    return true;
    
  } catch (error) {
    console.error('[AuthGuard] Error checking authentication:', error);
    if (isPlatformBrowser(platformId)) {
      localStorage.removeItem('authToken');
    }
    return router.parseUrl(`/auth/login?returnUrl=${encodeURIComponent(state.url)}`);
  }
};