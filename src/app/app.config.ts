import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { AuthService } from './core/services/auth.service';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';

/**
 * 🚀 Initialize AuthService on app startup for auto-login
 * This ensures user sessions are restored immediately when the app loads
 */
function initializeAuth(authService: AuthService): () => Promise<void> {
  return () => {
    console.log('[AppConfig] 🚀 Initializing AuthService for session restoration');
    
    // The AuthService constructor already handles initialization
    // This ensures it's instantiated early and ready before routing begins
    authService.debugAuthState();
    
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // 🔐 HTTP CLIENT WITH TOKEN INTERCEPTOR
    provideHttpClient(withInterceptorsFromDi()),
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: TokenInterceptor, 
      multi: true 
    },
    
    // 🚀 Initialize AuthService on app startup for session restoration
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    },
    
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        includePostRequests: true
      })
    ), 
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
