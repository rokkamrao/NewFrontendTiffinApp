import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, map, tap, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { SessionService } from './session.service';

export interface UserProfile {
	id?: number;
	phone: string;
	fullName?: string;
	name?: string;
	email?: string;
	role?: 'USER' | 'ADMIN' | 'DELIVERY_PARTNER';
	dietary?: string[] | string;
	allergies?: any;
	address?: any;
	avatarUrl?: string;
	addresses?: Array<{ id: string; label?: string; line?: string; lat?: number; lng?: number }>;
}

export interface AuthResponse {
	success: boolean;
	token?: string;
	user?: UserProfile;
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

export interface LoginRequest {
	phone?: string;
	email?: string;
	password: string;
}

export interface SignupRequest {
	phone: string;
	password: string;
	name: string;
	email?: string;
	dietary?: string[];
	allergies?: string[];
	address?: any;
}

const STORAGE_KEY = 'userProfile';
const TOKEN_KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
	// 🎯 CENTRALIZED AUTH STATE MANAGEMENT
	private userSubject = new BehaviorSubject<UserProfile | null>(this.getStoredUser());
	public user$ = this.userSubject.asObservable();
	
	private api = inject(ApiService);
	private platformId = inject(PLATFORM_ID);
	private sessionService: SessionService | null = null;

	constructor() {
		console.log('[AuthService] 🚀 Initializing centralized auth service');
		
		// Try to inject SessionService, but don't fail if circular dependency
		try {
			this.sessionService = inject(SessionService);
		} catch (e) {
			console.warn('[AuthService] SessionService will be injected later to avoid circular dependency');
		}
	}

	// ✅ CORE AUTH STATE METHODS
	private getStoredUser(): UserProfile | null {
		if (isPlatformBrowser(this.platformId)) {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				const token = localStorage.getItem(TOKEN_KEY);
				if (raw && token && this.isTokenValid(token)) {
					return JSON.parse(raw);
				}
			} catch (e) {
				console.warn('[AuthService] Failed to read user from storage', e);
			}
		}
		return null;
	}

	private isTokenValid(token: string): boolean {
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			const currentTime = Math.floor(Date.now() / 1000);
			return payload.exp > currentTime;
		} catch {
			return false;
		}
	}

	private storeAuthData(token: string, user: UserProfile) {
		if (isPlatformBrowser(this.platformId)) {
			try {
				localStorage.setItem(TOKEN_KEY, token);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
				// Legacy compatibility
				localStorage.setItem('isLoggedIn', 'true');
			} catch (e) {
				console.warn('[AuthService] Failed to store auth data', e);
			}
		}
	}

	private clearAuthData() {
		if (isPlatformBrowser(this.platformId)) {
			localStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(STORAGE_KEY);
			localStorage.removeItem('isLoggedIn');
		}
	}

	// 🎯 PUBLIC API METHODS

	/**
	 * Get current user (synchronous)
	 */
	getUser(): UserProfile | null {
		return this.userSubject.value;
	}

	/**
	 * Check if user is currently logged in
	 */
	isLoggedIn(): boolean {
		const user = this.userSubject.value;
		const token = isPlatformBrowser(this.platformId) ? localStorage.getItem(TOKEN_KEY) : null;
		return !!(user && token && this.isTokenValid(token));
	}

	/**
	 * Login with email/phone and password
	 */
	login(credentials: LoginRequest): Observable<AuthResponse> {
		console.log('[AuthService] 🔐 Login attempt for:', credentials.phone || credentials.email);
		
		return this.api.post<{ token: string; user: UserProfile }>('/auth/login', credentials).pipe(
			tap(response => {
				console.log('[AuthService] ✅ Login successful');
				this.storeAuthData(response.token, response.user);
				this.userSubject.next(response.user);
				
				// Create session for persistence
				if (this.sessionService) {
					try {
						this.sessionService.createSession(response.token, response.user);
					} catch (e) {
						console.warn('[AuthService] Session creation failed:', e);
					}
				}
			}),
			map(response => ({ success: true, token: response.token, user: response.user })),
			catchError(error => {
				console.error('[AuthService] ❌ Login failed:', error);
				return of({
					success: false,
					message: error.error?.message || error.message || 'Login failed'
				});
			})
		);
	}

	/**
	 * Register new user account
	 */
	signup(data: SignupRequest): Observable<AuthResponse> {
		console.log('[AuthService] 📝 Signup attempt for:', data.phone);
		
		return this.api.post<{ token: string; user: UserProfile }>('/auth/signup', data).pipe(
			tap(response => {
				console.log('[AuthService] ✅ Signup successful');
				this.storeAuthData(response.token, response.user);
				this.userSubject.next(response.user);
				
				// Create session for persistence
				if (this.sessionService) {
					try {
						this.sessionService.createSession(response.token, response.user);
					} catch (e) {
						console.warn('[AuthService] Session creation failed:', e);
					}
				}
			}),
			map(response => ({ success: true, token: response.token, user: response.user })),
			catchError(error => {
				console.error('[AuthService] ❌ Signup failed:', error);
				return of({
					success: false,
					message: error.error?.message || error.message || 'Signup failed'
				});
			})
		);
	}

	/**
	 * Logout and clear all auth state
	 */
	logout(): void {
		console.log('[AuthService] 🚪 Logging out user');
		this.clearAuthData();
		this.userSubject.next(null);
		
		// Clear session
		if (this.sessionService) {
			try {
				this.sessionService.clearSession();
			} catch (e) {
				console.warn('[AuthService] Session clearing failed:', e);
			}
		}
	}

	/**
	 * Get current user profile from server (refresh from backend)
	 */
	getCurrentUserProfile(): Observable<UserProfile> {
		return this.api.get<UserProfile>('/auth/me').pipe(
			tap(user => {
				console.log('[AuthService] 🔄 User profile refreshed');
				this.userSubject.next(user);
				if (isPlatformBrowser(this.platformId)) {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
				}
			}),
			catchError(error => {
				console.error('[AuthService] ❌ Failed to get user profile:', error);
				// Token might be invalid, logout
				this.logout();
				throw error;
			})
		);
	}

	// 🎯 OTP-BASED AUTH (EXISTING METHODS - KEPT FOR COMPATIBILITY)
	sendOtp(request: OtpRequest): Observable<AuthResponse> {
		console.log('[AuthService] 📱 Sending OTP to:', request.phone);
		return this.api.post<AuthResponse>('/auth/send-otp', request).pipe(
			map(response => ({ ...response, success: true })),
			catchError(error => {
				console.error('[AuthService] ❌ OTP sending failed:', error);
				return of({
					success: false,
					message: error.error?.message || error.message || 'Failed to send OTP'
				});
			})
		);
	}

	verifyOtp(request: VerifyOtpRequest): Observable<AuthResponse> {
		console.log('[AuthService] 🔑 Verifying OTP for:', request.phone);
		return this.api.post<{ token: string; user: UserProfile; isNewUser: boolean }>('/auth/verify-otp', request).pipe(
			tap(response => {
				console.log('[AuthService] ✅ OTP verification successful');
				this.storeAuthData(response.token, response.user);
				this.userSubject.next(response.user);
				
				// Create session
				if (this.sessionService) {
					try {
						this.sessionService.createSession(response.token, response.user);
					} catch (e) {
						console.warn('[AuthService] Session creation failed:', e);
					}
				}
			}),
			map(response => ({ 
				success: true, 
				token: response.token, 
				user: response.user, 
				isNewUser: response.isNewUser 
			})),
			catchError(error => {
				console.error('[AuthService] ❌ OTP verification failed:', error);
				return of({
					success: false,
					message: error.error?.message || error.message || 'OTP verification failed'
				});
			})
		);
	}

	// 🎯 LEGACY COMPATIBILITY METHODS
	updateUser(partial: Partial<UserProfile>): Observable<UserProfile> {
		const currentUser = this.userSubject.value;
		if (currentUser) {
			const updatedUser = { ...currentUser, ...partial };
			this.userSubject.next(updatedUser);
			if (isPlatformBrowser(this.platformId)) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
			}
			return of(updatedUser);
		}
		return of(currentUser!);
	}

	storeToken(token: string) {
		console.warn('[AuthService] storeToken() is deprecated. Use login() or signup() instead.');
		if (isPlatformBrowser(this.platformId)) {
			localStorage.setItem(TOKEN_KEY, token);
			localStorage.setItem('isLoggedIn', 'true');
		}
	}
}