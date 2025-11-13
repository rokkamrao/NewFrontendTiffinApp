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
} from '../models/index';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  public user$ = this.userSubject.asObservable();

  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'userProfile';

  constructor(
    private api: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeAuthState();
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
        this.userSubject.next(user);
      } else {
        console.log('[AuthService] ❌ No valid session found');
        this.userSubject.next(null);
      }
    } catch (error) {
      console.error('[AuthService] ⚠️ Error initializing auth state:', error);
      this.clearAuthData();
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
    const hasToken = !!this.getToken();
    const hasUser = !!this.getCurrentUser();
    console.log('[AuthService] 🔍 Checking login status:', { hasToken, hasUser });
    return hasToken && hasUser;
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
        }
      }),
      map(response => response.success && response.data?.user ? response.data.user : null),
      catchError(() => of(null))
    );
  }

  public logout(): void {
    console.log('[AuthService] 🚪 Logging out user');
    this.clearAuthData();
    this.userSubject.next(null);
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
    }
  }
}