import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthUtilsService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false; // During SSR, treat as not authenticated
    }

    try {
      const token = localStorage.getItem('authToken');
      const user = this.authService.getCurrentUser();
      
      if (!token || !user) {
        return false;
      }

      // Check if token is valid and not expired
      const payload = this.decodeJwt(token);
      if (!payload) {
        return false;
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        // Token expired, clear auth data
        this.authService.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('[AuthUtilsService] Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      const payload = this.decodeJwt(token);
      return payload?.role === role;
    } catch (error) {
      console.error('[AuthUtilsService] Error checking role:', error);
      return false;
    }
  }

  /**
   * Get current user's role
   */
  getUserRole(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const payload = this.decodeJwt(token);
      return payload?.role || 'USER';
    } catch (error) {
      console.error('[AuthUtilsService] Error getting user role:', error);
      return null;
    }
  }

  /**
   * Clear authentication and logout
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Decode JWT token
   */
  private decodeJwt(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (e) {
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(): Date | null {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const payload = this.decodeJwt(token);
      if (!payload?.exp) return null;

      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('[AuthUtilsService] Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Check if token will expire soon (within next 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) return false;

    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return expiration <= fiveMinutesFromNow;
  }
}