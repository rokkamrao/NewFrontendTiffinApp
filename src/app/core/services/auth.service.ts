import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, map, tap, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { SessionService } from './session.service';

export interface UserProfile {
	phone: string;
	fullName?: string;
	name?: string;
	email?: string;
	dietary?: string[] | string;
	allergies?: any;
	address?: any;
	avatarUrl?: string;
	addresses?: Array<{ id: string; label?: string; line?: string; lat?: number; lng?: number }>;
}

export interface AuthResponse {
	success: boolean;
	token?: string;
	phone?: string;
	name?: string;
	message?: string;
	role?: string;
  isNewUser?: boolean;
}

export interface OtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface GoogleSignInRequest {
  token: string;
}

// Legacy interfaces for backward compatibility
export interface RegisterRequest {
	phone: string;
	password: string;
	name: string;
	email?: string;
	dietary?: string[];
	allergies?: string[];
	address?: any;
}

export interface LoginRequest {
	phone?: string;
	email?: string;
	password: string;
}

const STORAGE_KEY = 'userProfile';
const TOKEN_KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private _user: UserProfile | null = null;
	private api = inject(ApiService);
	private platformId = inject(PLATFORM_ID);
	private sessionService: SessionService | null = null;

	constructor() {
		// Try to inject SessionService, but don't fail if circular dependency
		try {
			this.sessionService = inject(SessionService);
		} catch (e) {
			console.warn('[AuthService] SessionService will be injected later to avoid circular dependency');
		}
		
		if (isPlatformBrowser(this.platformId)) {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw) this._user = JSON.parse(raw);
			} catch (e) {
				console.warn('Failed to read user from storage', e);
			}
		}
	}

	private persist(){
		if (isPlatformBrowser(this.platformId)) {
			try { 
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this._user)); 
			} catch(e){ 
				console.warn('Failed to persist user', e); 
			}
		}
	}

	private storeToken(token: string) {
		if (isPlatformBrowser(this.platformId)) {
			try {
				localStorage.setItem(TOKEN_KEY, token);
			} catch (e) {
				console.warn('Failed to store token', e);
			}
		}
	}

	getUser(): UserProfile | null { return this._user; }

	updateUser(partial: Partial<UserProfile>){
		this._user = { ...(this._user||{ phone: '' }), ...partial };
		this.persist();
		return of(this._user);
	}

	logout(){
		console.log('[AuthService] logout() - Clearing auth state and session');
		this._user = null; 
		if (isPlatformBrowser(this.platformId)) {
			localStorage.removeItem(STORAGE_KEY);
			localStorage.removeItem(TOKEN_KEY);
		}
		// Clear session via SessionService
		if (this.sessionService) {
			try {
				this.sessionService.clearSession();
				console.log('[AuthService] Session cleared successfully');
			} catch (e) {
				console.warn('[AuthService] Error clearing session:', e);
			}
		}
	}

	// New OTP-based authentication methods
	sendOtp(request: OtpRequest): Observable<AuthResponse> {
    console.log('[AuthService] sendOtp() called with:', request);
    return this.api.post<AuthResponse>('/auth/send-otp', request).pipe(
      map(response => {
        console.log('[AuthService] sendOtp() - Backend response:', response);
        return { ...response, success: true };
      }),
      catchError(error => {
        console.error('[AuthService] sendOtp() - Error:', error);
        return of({
          success: false,
          message: error.error?.message || error.message || 'Failed to send OTP'
        });
      })
    );
  }

  verifyOtp(request: VerifyOtpRequest): Observable<AuthResponse> {
    console.log('[AuthService] verifyOtp() called with:', request);
    return this.api.post<{ token: string; phone: string; name: string; isNewUser: boolean }>('/auth/verify-otp', request).pipe(
      map(response => {
        console.log('[AuthService] verifyOtp() - Backend response:', response);
        if (response.token) {
          this.storeToken(response.token);
          console.log('[AuthService] Token stored successfully');
        }
        this._user = {
          phone: response.phone || request.phone,
          name: response.name,
          fullName: response.name,
        };
        this.persist();
        console.log('[AuthService] User profile persisted:', this._user);
        if (response.token && this._user) {
          if (this.sessionService) {
            try {
              this.sessionService.createSession(response.token, this._user);
              console.log('[AuthService] Session created for persistent login');
            } catch (e) {
              console.warn('[AuthService] Error creating session:', e);
            }
          }
        }
        return { ...response, success: true };
      }),
      catchError(error => {
        console.error('[AuthService] verifyOtp() - Error:', error);
        return of({
          success: false,
          message: error.error?.message || error.message || 'OTP verification failed'
        });
      })
    );
  }

  googleSignIn(request: GoogleSignInRequest): Observable<AuthResponse> {
    console.log('[AuthService] googleSignIn() called');
    return this.api.post<{ token: string; phone: string; name: string; email: string; isNewUser: boolean }>('/auth/google-signin', request).pipe(
      map(response => {
        console.log('[AuthService] googleSignIn() - Backend response:', response);
        if (response.token) {
          this.storeToken(response.token);
          console.log('[AuthService] Token stored successfully');
        }
        this._user = {
          phone: response.phone,
          name: response.name,
          fullName: response.name,
          email: response.email,
        };
        this.persist();
        console.log('[AuthService] User profile persisted:', this._user);
        if (response.token && this._user) {
          if (this.sessionService) {
            try {
              this.sessionService.createSession(response.token, this._user);
              console.log('[AuthService] Session created for persistent login');
            } catch (e) {
              console.warn('[AuthService] Error creating session:', e);
            }
          }
        }
        return { ...response, success: true };
      }),
      catchError(error => {
        console.error('[AuthService] googleSignIn() - Error:', error);
        return of({
          success: false,
          message: error.error?.message || error.message || 'Google Sign-In failed'
        });
      })
    );
  }

  // Google Sign-In integration method
  async signInWithGoogle(): Promise<string | null> {
    // TODO: Implement Google Sign-In SDK integration
    // For now, return a mock token for development
    console.log('[AuthService] signInWithGoogle() - Mock implementation');
    return Promise.resolve('mock_google_token_' + Date.now());
  }

	// Legacy methods - kept for backward compatibility
	/**
	 * @deprecated Use sendOtp() and verifyOtp() instead
	 */
	register(request: RegisterRequest): Observable<AuthResponse> {
		console.log('[AuthService] register() called with:', { ...request, password: '***' });
		return this.api.post<{ token: string; phone: string; name: string }>('/auth/register', request).pipe(
			map(response => {
				console.log('[AuthService] register() - Backend response:', response);
				if (response.token) {
					this.storeToken(response.token);
					console.log('[AuthService] Token stored successfully');
				}
				this._user = {
					phone: response.phone || request.phone,
					name: response.name || request.name,
					fullName: request.name,
					email: request.email,
					dietary: request.dietary,
					allergies: request.allergies,
					address: request.address
				};
				this.persist();
				console.log('[AuthService] User profile persisted:', this._user);
				
				if (response.token && this._user) {
					if (this.sessionService) {
						try {
							this.sessionService.createSession(response.token, this._user);
							console.log('[AuthService] Session created for persistent login');
						} catch (e) {
							console.warn('[AuthService] Error creating session:', e);
						}
					}
				}
				
				return { success: true, ...response };
			}),
			catchError(error => {
				console.error('[AuthService] register() - Error:', error);
				return of({ 
					success: false, 
					message: error.error?.message || error.message || 'Registration failed' 
				});
			})
		);
	}

	/**
	 * @deprecated Use sendOtp() and verifyOtp() instead
	 */
	login(request: LoginRequest): Observable<AuthResponse> {
		console.log('[AuthService] login() called with:', { ...request, password: '***' });
		return this.api.post<{ token: string; phone: string; name: string }>('/auth/login', request).pipe(
			map(response => {
				console.log('[AuthService] login() - Backend response:', response);
				if (response.token) {
					this.storeToken(response.token);
					console.log('[AuthService] Token stored successfully');
				}
				this._user = {
					phone: response.phone || request.phone || request.email || '',
					name: response.name,
					fullName: response.name,
					email: request.email
				};
				this.persist();
				console.log('[AuthService] User profile persisted:', this._user);
				
				if (response.token && this._user) {
					if (this.sessionService) {
						try {
							this.sessionService.createSession(response.token, this._user);
							console.log('[AuthService] Session created for persistent login');
						} catch (e) {
							console.warn('[AuthService] Error creating session:', e);
						}
					}
				}
				
				return { success: true, ...response };
			}),
			catchError(error => {
				console.error('[AuthService] login() - Error:', error);
				return of({ 
					success: false, 
					message: error.error?.message || error.message || 'Login failed' 
				});
			})
		);
	}

	// Forgot Password methods (kept for backward compatibility)
	sendPasswordResetOtp(phone: string): Observable<AuthResponse> {
		console.log('[AuthService] sendPasswordResetOtp() - Phone:', phone);
		return this.api.post<AuthResponse>('/auth/forgot-password', { phone });
	}

	resetPassword(request: { phone: string; otp: string; newPassword: string }): Observable<AuthResponse> {
		console.log('[AuthService] resetPassword() - Phone:', request.phone);
		return this.api.post<AuthResponse>('/auth/reset-password', request);
	}

	mockSignIn(phone: string){
		console.warn('mockSignIn is deprecated. Use verifyOtp()');
		this._user = { phone };
		this.persist();
		return this._user;
	}
}

