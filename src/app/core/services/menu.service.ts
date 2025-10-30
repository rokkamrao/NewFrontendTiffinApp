import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Dish, DietType } from '../models/dish.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private api = inject(ApiService);

  /**
   * Fetch all dishes from the backend
   */
  list(): Observable<Dish[]>{
    console.log('[MenuService] list() - Fetching all dishes');
    return this.api.get<Dish[]>('/dishes').pipe(
      tap({
        next: (dishes) => console.log('[MenuService] list() - Success:', dishes.length, 'dishes'),
        error: (error) => console.error('[MenuService] list() - Error:', error)
      }),
      // Prevent SSR hydration from timing out if the API fails by returning an empty list
      catchError((err) => {
        console.error('[MenuService] list() - Recovering with [] due to error:', err);
        return of([] as Dish[]);
      })
    );
  }

  /**
   * Fetch a single dish by ID from the backend
   */
  get(id: string): Observable<Dish>{
    console.log('[MenuService] get() - Fetching dish:', id);
    return this.api.get<Dish>(`/dishes/${id}`).pipe(
      tap({
        next: (dish) => console.log('[MenuService] get() - Success:', dish),
        error: (error) => console.error('[MenuService] get() - Error:', error)
      })
    );
  }
}
