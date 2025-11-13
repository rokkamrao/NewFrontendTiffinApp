import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

/**
 * 🔐 Token Interceptor - Automatically attaches JWT to API requests
 * 
 * Adds Authorization header: Bearer {token} to all outgoing HTTP requests
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private platformId = inject(PLATFORM_ID);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token injection during SSR
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(req);
    }

    const token = localStorage.getItem('authToken');
    
    if (token) {
      console.log('[TokenInterceptor] 🔐 Adding auth token to request:', req.url);
      const cloned = req.clone({
        setHeaders: { 
          Authorization: `Bearer ${token}` 
        }
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}