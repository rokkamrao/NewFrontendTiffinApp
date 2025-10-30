import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';

function generateRequestId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  let token: string | null = null;

  console.log(`[AuthInterceptor] 📤 ${req.method} ${req.url}`);

  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('authToken');
    console.log(`[AuthInterceptor] Token found: ${!!token}`);
  } else {
    console.log('[AuthInterceptor] SSR mode - no token');
  }

  const requestId = generateRequestId();
  console.log(`[AuthInterceptor] Request-Id: ${requestId}`);
  
  let headers = req.headers.set('X-Request-Id', requestId);

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
    console.log('[AuthInterceptor] Authorization header added');
  }

  const cloned = req.clone({ headers });
  console.log('[AuthInterceptor] Request headers:', cloned.headers.keys());

  return next(cloned).pipe(
    tap({
      next: (event: any) => {
        if (event instanceof HttpResponse) {
          const traceId = event.headers?.get('X-Trace-Id');
          console.log(`[AuthInterceptor] 📥 ✓ ${req.method} ${req.url} - Status: ${event.status}, Trace-Id: ${traceId}`);
        }
      },
      error: (error) => {
        console.error(`[AuthInterceptor] 📥 ✗ ${req.method} ${req.url} - Error:`, {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
      }
    })
  );
};
