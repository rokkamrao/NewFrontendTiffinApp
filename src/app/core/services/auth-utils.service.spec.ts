import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { AuthUtilsService } from './auth-utils.service';
import { AuthService } from './auth.service';

describe('AuthUtilsService', () => {
  let service: AuthUtilsService;
  let authService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthUtilsService,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(AuthUtilsService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for authentication when no token exists', () => {
    // Mock localStorage to return null
    spyOn(localStorage, 'getItem').and.returnValue(null);
    authService.getUser.and.returnValue(null);

    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return false when user is null', () => {
    // Mock localStorage to return a token but user is null
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    authService.getUser.and.returnValue(null);

    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should call logout when token is expired', () => {
    // Create an expired token (exp: 1 second ago)
    const expiredPayload = {
      exp: Math.floor(Date.now() / 1000) - 1
    };
    const expiredToken = 'header.' + btoa(JSON.stringify(expiredPayload)) + '.signature';
    
    spyOn(localStorage, 'getItem').and.returnValue(expiredToken);
    authService.getUser.and.returnValue({ phone: '1234567890', name: 'Test User' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should return current user when authenticated', () => {
    const mockUser = { phone: '1234567890', name: 'Test User' };
    authService.getUser.and.returnValue(mockUser);

    expect(service.getCurrentUser()).toEqual(mockUser);
  });

  it('should return null for getUserRole when not authenticated', () => {
    spyOn(service, 'isAuthenticated').and.returnValue(false);

    expect(service.getUserRole()).toBeNull();
  });
});