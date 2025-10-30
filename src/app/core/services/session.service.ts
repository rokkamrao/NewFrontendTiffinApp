import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface SessionState {
  isLoggedIn: boolean;
  user: any | null;
  token: string | null;
  lastActivity: number;
}

/**
 * SessionService manages persistent login sessions across browser sessions.
 * Features:
 * - Auto-login on app initialization if valid token exists
 * - Refresh token handling (can be extended)
 * - Session timeout tracking
 * - Persistent state in localStorage
 * - Observable session state for reactive UI updates
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  
  private readonly SESSION_KEY = 'tiffin_session';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  private sessionState$ = new BehaviorSubject<SessionState>({
    isLoggedIn: false,
    user: null,
    token: null,
    lastActivity: Date.now()
  });

  constructor() {
    console.log('[SessionService] Initializing...');
    this.initializeSession();
    
    // Track user activity for session timeout
    if (isPlatformBrowser(this.platformId)) {
      this.setupActivityTracking();
    }
  }

  /**
   * Get current session state as observable
   */
  getSessionState(): Observable<SessionState> {
    return this.sessionState$.asObservable();
  }

  /**
   * Get current session state value
   */
  getCurrentSession(): SessionState {
    return this.sessionState$.value;
  }

  /**
   * Initialize session from localStorage on app startup
   */
  private initializeSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[SessionService] SSR detected, skipping localStorage check');
      return;
    }

    try {
      const storedSession = localStorage.getItem(this.SESSION_KEY);
      const authToken = localStorage.getItem('authToken');
      const userProfile = localStorage.getItem('userProfile');

      if (storedSession) {
        const session: SessionState = JSON.parse(storedSession);
        const timeSinceLastActivity = Date.now() - session.lastActivity;

        // Check if session has expired
        if (timeSinceLastActivity < this.SESSION_TIMEOUT && session.token) {
          console.log('[SessionService] ✓ Valid session found, auto-logging in');
          console.log('[SessionService] Time since last activity:', Math.round(timeSinceLastActivity / 1000 / 60), 'minutes');
          
          // Restore session state
          this.sessionState$.next({
            ...session,
            lastActivity: Date.now()
          });
          
          this.persistSession();
        } else {
          console.warn('[SessionService] ⚠ Session expired or invalid, clearing');
          this.clearSession();
        }
      } else if (authToken && userProfile) {
        // Legacy format: migrate to new session format
        console.log('[SessionService] Migrating legacy auth format to session');
        const user = JSON.parse(userProfile);
        this.createSession(authToken, user);
      } else {
        console.log('[SessionService] No existing session found');
      }
    } catch (error) {
      console.error('[SessionService] Error initializing session:', error);
      this.clearSession();
    }
  }

  /**
   * Create a new session after successful login
   */
  createSession(token: string, user: any): void {
    console.log('[SessionService] Creating new session for user:', user.phone || user.email);
    
    const newSession: SessionState = {
      isLoggedIn: true,
      user,
      token,
      lastActivity: Date.now()
    };

    this.sessionState$.next(newSession);
    this.persistSession();
  }

  /**
   * Update session activity timestamp
   */
  updateActivity(): void {
    const currentSession = this.sessionState$.value;
    if (currentSession.isLoggedIn) {
      this.sessionState$.next({
        ...currentSession,
        lastActivity: Date.now()
      });
      this.persistSession();
    }
  }

  /**
   * Clear session and logout
   */
  clearSession(): void {
    console.log('[SessionService] Clearing session');
    
    this.sessionState$.next({
      isLoggedIn: false,
      user: null,
      token: null,
      lastActivity: Date.now()
    });

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
    }
  }

  /**
   * Persist current session to localStorage
   */
  private persistSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const session = this.sessionState$.value;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      
      // Also maintain legacy format for compatibility
      if (session.token) {
        localStorage.setItem('authToken', session.token);
      }
      if (session.user) {
        localStorage.setItem('userProfile', JSON.stringify(session.user));
      }
    } catch (error) {
      console.error('[SessionService] Error persisting session:', error);
    }
  }

  /**
   * Setup activity tracking to update lastActivity timestamp
   */
  private setupActivityTracking(): void {
    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    let activityTimeout: any = null;

    const handleActivity = () => {
      // Debounce activity updates to avoid excessive localStorage writes
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      
      activityTimeout = setTimeout(() => {
        this.updateActivity();
      }, 60000); // Update every minute of activity
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    console.log('[SessionService] Activity tracking enabled');
  }

  /**
   * Check if current session is valid
   */
  isSessionValid(): boolean {
    const session = this.sessionState$.value;
    if (!session.isLoggedIn || !session.token) {
      return false;
    }

    const timeSinceLastActivity = Date.now() - session.lastActivity;
    return timeSinceLastActivity < this.SESSION_TIMEOUT;
  }

  /**
   * Get time remaining before session expires (in milliseconds)
   */
  getSessionTimeRemaining(): number {
    const session = this.sessionState$.value;
    if (!session.isLoggedIn) return 0;

    const timeSinceLastActivity = Date.now() - session.lastActivity;
    const remaining = this.SESSION_TIMEOUT - timeSinceLastActivity;
    return Math.max(0, remaining);
  }

  /**
   * Refresh session (extend timeout)
   */
  refreshSession(): void {
    console.log('[SessionService] Refreshing session');
    this.updateActivity();
  }

  /**
   * Logout and clear session
   */
  logout(): void {
    console.log('[SessionService] User logging out');
    this.clearSession();
    this.authService.logout();
  }
}
