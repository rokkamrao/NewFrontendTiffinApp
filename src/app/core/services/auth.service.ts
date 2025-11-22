import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  UserProfile,
  AuthResponse,
  OtpRequest,
  OtpVerificationRequest,
  SignUpRequest,
  SignInRequest
} from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  public user$ = this.userSubject.asObservable();
  
  // Add auth status observable
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus = this.authStatusSubject.asObservable();

  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'userProfile';

  constructor(
    private api: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('[AuthService] 🚀 Constructor called, platform:', isPlatformBrowser(this.platformId) ? 'Browser' : 'Server');
    
    // Initialize auth state immediately and with retries for browser platform
    if (isPlatformBrowser(this.platformId)) {
      console.log('[AuthService] 🔄 Browser detected, initializing auth state immediately');
      this.initializeAuthState();
      
      // Also add delayed initialization in case the first one happens too early
      setTimeout(() => {
        console.log('[AuthService] 🔄 Delayed auth state initialization (50ms)');
        this.refreshAuthState();
      }, 50);
      
      // Add another check after 200ms
      setTimeout(() => {
        console.log('[AuthService] 🔄 Secondary auth state check (200ms)');
        this.refreshAuthState();
      }, 200);
      
      // Add a final check after 1 second to ensure browser is ready
      setTimeout(() => {
        console.log('[AuthService] 🔄 Final auth state check (1000ms)');
        this.forceAuthStateCheck();
      }, 1000);
    } else {
      console.log('[AuthService] 🖥️ Server detected, skipping initialization');
    }
  }
  
  
  private forceAuthStateCheck(): void {
    console.log('[AuthService] 🔄 Forcing auth state check');
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.USER_KEY);
      
      if (token && userJson && !this.userSubject.value) {
        const user = JSON.parse(userJson);
        console.log('[AuthService] 🔄 Found stored auth but no current user, forcing update:', user.name || user.phone);
        
        // Force update both subjects
        this.userSubject.next(user);
        this.authStatusSubject.next(true);
        
        console.log('[AuthService] 🔄 Forced auth state updated');
      }
    } catch (error) {
      console.error('[AuthService] 🔄 Error in force auth check:', error);
    }
  }
  
  private refreshAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const userJson = localStorage.getItem(this.USER_KEY);
        
        console.log('[AuthService] 🔍 Refresh auth state check:', {
          hasToken: !!token,
          hasUser: !!userJson,
          currentUserValue: this.userSubject.value ? this.userSubject.value.name : 'null'
        });
        
        if (token && userJson && !this.userSubject.value) {
          console.log('[AuthService] 🔄 Found stored auth data but subject is null, reinitializing');
          this.initializeAuthState();
        } else if (!token || !userJson) {
          console.log('[AuthService] 🧹 No stored auth data, ensuring user is logged out');
          this.userSubject.next(null);
          this.authStatusSubject.next(false); // Update auth status
        }
      } catch (error) {
        console.error('[AuthService] ⚠️ Error in refresh auth state:', error);
      }
    }
  }

  private initializeAuthState(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    console.log('[AuthService] 🔄 Initializing auth state...');
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.USER_KEY);
      console.log('[AuthService] 📋 Found in localStorage:', { 
        hasToken: !!token, 
        hasUser: !!userJson,
        tokenKey: this.TOKEN_KEY,
        userKey: this.USER_KEY
      });
      
      if (token && userJson) {
        const user = JSON.parse(userJson) as UserProfile;
        console.log('[AuthService] ✅ Restoring user session:', user);
        
        // Check if token is expired
        if (this.isTokenExpired(token)) {
          console.log('[AuthService] ❌ Token expired, clearing auth data');
          this.clearAuthData();
          this.userSubject.next(null);
          return;
        }
        
        this.userSubject.next(user);
        this.authStatusSubject.next(true); // Update auth status
        console.log('[AuthService] ✅ Auth state initialized - user logged in:', user.name || user.phone);
      } else {
        console.log('[AuthService] ❌ No valid session found');
        this.clearAuthData();
        this.userSubject.next(null);
        this.authStatusSubject.next(false); // Update auth status
      }
    } catch (error) {
      console.error('[AuthService] ⚠️ Error initializing auth state:', error);
      this.clearAuthData();
      this.userSubject.next(null);
      this.authStatusSubject.next(false); // Update auth status
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeJwt(token);
      if (!payload || !payload.exp) return false;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('[AuthService] Error checking token expiration:', error);
      return true; // Treat invalid tokens as expired
    }
  }

  private decodeJwt(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (e) {
      return null;
    }
  }

  private storeAuthData(token: string, user: UserProfile): void {
    if (!isPlatformBrowser(this.platformId)) return;
    console.log('[AuthService] 💾 Storing auth data:', { 
      token: token.substring(0, 20) + '...', 
      user: user.name || user.phone,
      tokenKey: this.TOKEN_KEY,
      userKey: this.USER_KEY
    });
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearAuthData(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  public isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    if (!token || !user) {
      console.log('[AuthService] 🔍 No token or user found');
      return false;
    }
    
    // Check if token is expired
    if (this.isTokenExpired(token)) {
      console.log('[AuthService] 🔍 Token expired, auto-logout');
      this.logout();
      return false;
    }
    
    console.log('[AuthService] 🔍 User is logged in:', { user: user.name || user.phone });
    return true;
  }

  public getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public getCurrentUser(): UserProfile | null {
    return this.userSubject.value;
  }

  public login(phoneOrEmail: string, password: string): Observable<AuthResponse> {
    const signInRequest: SignInRequest = { phone: phoneOrEmail, password: password };
    console.log('[AuthService] 🔑 Attempting login for:', phoneOrEmail);
    return this.api.post<any>('/auth/sign-in', signInRequest).pipe(
      tap(response => {
        console.log('[AuthService] 🔐 Login response received:', { 
          success: response.success, 
          hasUser: !!response.data?.user,
          hasToken: !!response.data?.token
        });
        if (response.success && response.data?.token && response.data?.user) {
          console.log('[AuthService] ✅ Login successful, storing auth data');
          this.storeAuthData(response.data.token, response.data.user);
          this.userSubject.next(response.data.user);
          this.authStatusSubject.next(true); // Update auth status
        } else {
          console.log('[AuthService] ❌ Login failed or incomplete data');
        }
      }),
      map(response => {
        if (response.success && response.data?.user) {
          return { 
            success: true, 
            user: response.data.user, 
            token: response.data.token,
            role: response.data.user.role,
            message: 'Login successful' 
          };
        }
        return { success: false, message: 'Login failed' };
      }),
      catchError(error => {
        console.error('[AuthService] ⚠️ Login error:', error);
        return of({ success: false, message: 'Login failed' });
      })
    );
  }

  public signup(userData: SignUpRequest): Observable<UserProfile | null> {
    return this.api.post<any>('/auth/complete-signup', userData).pipe(
      tap(response => {
        if (response.success && response.data?.token && response.data?.user) {
          this.storeAuthData(response.data.token, response.data.user);
          this.userSubject.next(response.data.user);
          this.authStatusSubject.next(true); // Update auth status
        }
      }),
      map(response => response.success && response.data?.user ? response.data.user : null),
      catchError(() => of(null))
    );
  }

  /**
   * Validate session with backend
   */
  public validateSessionWithBackend(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      console.log('[AuthService] 🔍 No token found for validation');
      return of(false);
    }

    console.log('[AuthService] 🔍 Validating session with backend');
    return this.api.get<AuthResponse>('/auth/validate-session').pipe(
      tap(response => {
        console.log('[AuthService] 🔍 Backend validation response:', response);
        if (response.success && response.data?.user) {
          // Update user data from backend
          this.userSubject.next(response.data.user);
          this.authStatusSubject.next(true);
          this.storeAuthData(token, response.data.user);
        } else {
          // Invalid session, clear data
          console.log('[AuthService] ❌ Session invalid, clearing data');
          this.clearAuthData();
          this.userSubject.next(null);
          this.authStatusSubject.next(false);
        }
      }),
      map(response => response.success),
      catchError(error => {
        console.error('[AuthService] ❌ Session validation failed:', error);
        this.clearAuthData();
        this.userSubject.next(null);
        this.authStatusSubject.next(false);
        return of(false);
      })
    );
  }

  /**
   * Enhanced logout with backend notification
   */
  public logoutWithBackend(): Observable<boolean> {
    console.log('[AuthService] 🚪 Logout with backend notification');
    
    const token = this.getToken();
    if (token) {
      return this.api.post<AuthResponse>('/auth/logout', {}).pipe(
        tap(() => {
          console.log('[AuthService] ✅ Backend notified of logout');
        }),
        map(response => response.success),
        catchError(error => {
          console.error('[AuthService] ⚠️ Backend logout notification failed:', error);
          return of(true); // Still logout locally even if backend fails
        }),
        tap(() => {
          // Always clear local data
          this.clearAuthData();
          this.userSubject.next(null);
          this.authStatusSubject.next(false);
        })
      );
    } else {
      // No token, just clear local data
      this.clearAuthData();
      this.userSubject.next(null);
      this.authStatusSubject.next(false);
      return of(true);
    }
  }

  public logout(): void {
    console.log('[AuthService] 🚪 Logging out user');
    this.clearAuthData();
    this.userSubject.next(null);
    this.authStatusSubject.next(false); // Update auth status
    
    // Also clear any session service data
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tiffin_session');
    }
  }

  public signIn(request: SignInRequest): Observable<AuthResponse> {
    return this.login(request.phone, request.password);
  }

  public signOut(): void {
    this.logout();
  }



  public sendOtp(request: OtpRequest): Observable<AuthResponse> {
    return this.api.post<any>('/auth/send-otp', request).pipe(
      map(response => ({
        success: response.success,
        message: response.message || 'OTP sent successfully'
      })),
      catchError(() => of({ success: false, message: 'Failed to send OTP' }))
    );
  }

  public verifyOtp(request: OtpVerificationRequest): Observable<AuthResponse> {
    return this.api.post<any>('/auth/verify-otp', request).pipe(
      tap(response => {
        if (response.success && response.data?.token && response.data?.user) {
          this.storeAuthData(response.data.token, response.data.user);
          this.userSubject.next(response.data.user);
          this.authStatusSubject.next(true); // Update auth status
        }
      }),
      map(response => ({
        success: response.success,
        user: response.data?.user,
        token: response.data?.token,
        message: response.message || 'OTP verified successfully'
      })),
      catchError(() => of({ success: false, message: 'Failed to verify OTP' }))
    );
  }

  public sendPasswordResetOtp(phone: string): Observable<AuthResponse> {
    return this.api.post<any>('/auth/forgot-password', { phone }).pipe(
      map(response => ({
        success: response.success,
        message: response.message || 'OTP sent successfully'
      })),
      catchError(() => of({ success: false, message: 'Failed to send OTP' }))
    );
  }

  public resetPassword(request: { phone: string; otp: string; newPassword: string }): Observable<AuthResponse> {
    return this.api.post<any>('/auth/reset-password', request).pipe(
      map(response => ({
        success: response.success,
        message: response.message || 'Password reset successfully'
      })),
      catchError(() => of({ success: false, message: 'Failed to reset password' }))
    );
  }

  public signInWithGoogle(): Promise<string> {
    return Promise.reject('Google sign-in not implemented');
  }

  public googleSignIn(request: { token: string }): Observable<AuthResponse> {
    return of({ success: false, message: 'Google sign-in not implemented' });
  }

  public register(request: SignUpRequest): Observable<AuthResponse> {
    return this.signup(request).pipe(
      map(user => ({
        success: !!user,
        user,
        message: user ? 'Registration successful' : 'Registration failed'
      }))
    );
  }

  public getUser(): UserProfile | null {
    return this.getCurrentUser();
  }

  public updateUser(updates: Partial<UserProfile>): Observable<UserProfile | null> {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.userSubject.next(updatedUser);
      this.storeAuthData(this.getToken() || '', updatedUser);
      return of(updatedUser);
    }
    return of(null);
  }

  public updateProfile(updates: Partial<UserProfile>): Observable<UserProfile | null> {
    return this.updateUser(updates);
  }

  public storeToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      console.log('[AuthService] Token stored:', token.substring(0, 20) + '...');
    }
  }
  
  public setAuthData(token: string, user: UserProfile): void {
    console.log('[AuthService] Setting complete auth data for user:', user.name);
    this.storeAuthData(token, user);
    this.userSubject.next(user);
    this.authStatusSubject.next(true); // Update auth status
  }

  public validateSession(): boolean {
    console.log('[AuthService] 🔍 Validating current session');
    return this.isLoggedIn();
  }

  public forceRefreshState(): void {
    console.log('[AuthService] 🔄 Force refreshing auth state from storage');
    this.refreshAuthState();
  }

  public debugAuthState(): void {
    console.log('[AuthService] 🐛 DEBUG AUTH STATE:');
    console.log('  - Platform is browser:', isPlatformBrowser(this.platformId));
    
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.USER_KEY);
      console.log('  - Token in storage:', token ? 'YES' : 'NO');
      console.log('  - User in storage:', userJson ? 'YES' : 'NO');
      console.log('  - Token length:', token?.length || 0);
      console.log('  - Current user from subject:', this.userSubject.value);
      console.log('  - Current auth status:', this.authStatusSubject.value);
      console.log('  - isLoggedIn() result:', this.isLoggedIn());
      
      if (token) {
        console.log('  - Token preview:', token.substring(0, 50) + '...');
      }
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          console.log('  - Stored user:', user);
        } catch (e) {
          console.log('  - User JSON parse error:', e);
        }
      }
    } else {
      console.log('  - Running in SSR mode');
    }
  }
}