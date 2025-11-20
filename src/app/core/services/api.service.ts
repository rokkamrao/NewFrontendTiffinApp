import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = this.detectApiUrl();
    console.log(`[ApiService] Initialized with baseUrl=${this.baseUrl}`);
  }

  /**
   * Auto-detect the correct API URL based on environment
   */
  private detectApiUrl(): string {
    // If environment has a specific API URL, use it
    if (environment.apiUrl) {
      return environment.apiUrl;
    }

    // Auto-detection logic
    if (isPlatformBrowser(this.platformId)) {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      
      console.log(`[ApiService] Detecting API URL from hostname: ${hostname}`);

      // Production detection patterns
      if (hostname.includes('vercel.app')) {
        // Try multiple Railway URL patterns
        const possibleUrls = [
          'https://stellar-radiance-production.up.railway.app/api',
          'https://tiffin-api-production.railway.app/api',
          'https://tiffin-api.railway.app/api',
          'https://newbackendtiffinapp-production.railway.app/api',
          'https://backend-production.railway.app/api'
        ];
        
        // Return the first URL and let the app try them in order
        console.log(`[ApiService] Detected Vercel deployment, trying Railway URLs`);
        return possibleUrls[0];
      }
      
      if (hostname.includes('netlify.app')) {
        // For Netlify deployments, try Railway backend
        const railwayUrl = 'https://stellar-radiance-production.up.railway.app/api';
        console.log(`[ApiService] Detected Netlify deployment, using Railway: ${railwayUrl}`);
        return railwayUrl;
      }
      
      if (hostname.includes('railway.app')) {
        // If frontend is also on Railway
        return `${protocol}//${hostname.replace('frontend', 'api')}/api`;
      }
      
      // Development mode
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log(`[ApiService] Local development detected, using proxy`);
        return '/api';
      }
    }

    // Fallback for production
    console.log(`[ApiService] Using fallback API URL`);
    return 'https://tiffin-api-production.railway.app/api';
  }

  /**
   * Test if the API endpoint is reachable
   */
  async testApiConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        mode: 'cors'
      });
      return response.ok;
    } catch (error) {
      console.error(`[ApiService] API connection test failed:`, error);
      return false;
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[ApiService] GET ${endpoint} -> ${url}`, options);
    return this.http.get<T>(url, options).pipe(
      tap({
        next: (data) => console.log(`[ApiService] GET ${endpoint} - Success`, data),
        error: (error) => console.error(`[ApiService] GET ${endpoint} - Error`, error)
      })
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[ApiService] POST ${endpoint} -> ${url}`, { body, options });
    return this.http.post<T>(url, body, options).pipe(
      tap({
        next: (data) => console.log(`[ApiService] POST ${endpoint} - Success`, data),
        error: (error) => console.error(`[ApiService] POST ${endpoint} - Error`, error)
      })
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[ApiService] PUT ${endpoint} -> ${url}`, { body, options });
    return this.http.put<T>(url, body, options).pipe(
      tap({
        next: (data) => console.log(`[ApiService] PUT ${endpoint} - Success`, data),
        error: (error) => console.error(`[ApiService] PUT ${endpoint} - Error`, error)
      })
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[ApiService] DELETE ${endpoint} -> ${url}`, options);
    return this.http.delete<T>(url, options).pipe(
      tap({
        next: (data) => console.log(`[ApiService] DELETE ${endpoint} - Success`, data),
        error: (error) => console.error(`[ApiService] DELETE ${endpoint} - Error`, error)
      })
    );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[ApiService] PATCH ${endpoint} -> ${url}`, { body, options });
    return this.http.patch<T>(url, body, options).pipe(
      tap({
        next: (data) => console.log(`[ApiService] PATCH ${endpoint} - Success`, data),
        error: (error) => console.error(`[ApiService] PATCH ${endpoint} - Error`, error)
      })
    );
  }
}
