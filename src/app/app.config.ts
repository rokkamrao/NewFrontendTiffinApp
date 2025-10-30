import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { SessionService } from './core/services/session.service';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';

/**
 * Initialize SessionService on app startup to restore any existing session
 */
function initializeSession(sessionService: SessionService) {
  return () => {
    // SessionService constructor already handles initialization
    // This just ensures it's instantiated early in the app lifecycle
    console.log('[AppConfig] SessionService initialized');
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Initialize SessionService on app startup for auto-login
    {
      provide: APP_INITIALIZER,
      useFactory: initializeSession,
      deps: [SessionService],
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
