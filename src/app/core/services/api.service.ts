import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl: string;

  constructor() {
    // Determine base URL in a way that's SSR-safe and dev-friendly
    let resolved = '/api';
    try {
      // Guard against SSR where window is undefined
      const w: any = (globalThis as any)?.window;
      const loc = w?.location?.host as string | undefined;
      // If running the Angular dev server on 4200, bypass proxy flakiness and hit backend directly
      if (loc && (loc.includes('localhost:4200') || loc.includes('127.0.0.1:4200'))) {
        resolved = 'http://localhost:8081/api';
      }
    } catch {
      // Keep default '/api' on SSR or if any error occurs
    }
    this.baseUrl = resolved;
    console.log(`[ApiService] Initialized with baseUrl=${this.baseUrl}`);
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
