import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Dish, DietType, DishCategory } from '../models/dish.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private api = inject(ApiService);

  /**
   * Fetch all dishes from the backend
   */
  list(category?: DishCategory, onlyAvailable: boolean = false): Observable<Dish[]>{
    console.log('[MenuService] list() - Fetching dishes', { category, onlyAvailable });
    
    const params: any = {};
    if (category) params.category = category;
    if (onlyAvailable) params.onlyAvailable = 'true';
    
    return this.api.get<Dish[]>('/dishes', { params }).pipe(
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

  /**
   * Fetch dishes by category
   */
  getByCategory(category: DishCategory): Observable<Dish[]> {
    console.log('[MenuService] getByCategory() - Fetching dishes for category:', category);
    return this.api.get<Dish[]>(`/dishes/category/${category}`).pipe(
      tap({
        next: (dishes) => console.log('[MenuService] getByCategory() - Success:', dishes.length, 'dishes'),
        error: (error) => console.error('[MenuService] getByCategory() - Error:', error)
      }),
      catchError((err) => {
        console.error('[MenuService] getByCategory() - Recovering with [] due to error:', err);
        return of([] as Dish[]);
      })
    );
  }

  /**
   * Fetch only available dishes
   */
  getAvailable(): Observable<Dish[]> {
    console.log('[MenuService] getAvailable() - Fetching available dishes');
    return this.api.get<Dish[]>('/dishes/available').pipe(
      tap({
        next: (dishes) => console.log('[MenuService] getAvailable() - Success:', dishes.length, 'dishes'),
        error: (error) => console.error('[MenuService] getAvailable() - Error:', error)
      }),
      catchError((err) => {
        console.error('[MenuService] getAvailable() - Recovering with [] due to error:', err);
        return of([] as Dish[]);
      })
    );
  }

  /**
   * Fetch vegetarian dishes
   */
  getVegetarian(): Observable<Dish[]> {
    console.log('[MenuService] getVegetarian() - Fetching vegetarian dishes');
    return this.api.get<Dish[]>('/dishes/vegetarian').pipe(
      tap({
        next: (dishes) => console.log('[MenuService] getVegetarian() - Success:', dishes.length, 'dishes'),
        error: (error) => console.error('[MenuService] getVegetarian() - Error:', error)
      }),
      catchError((err) => {
        console.error('[MenuService] getVegetarian() - Recovering with [] due to error:', err);
        return of([] as Dish[]);
      })
    );
  }

  /**
   * Fetch bestseller dishes
   */
  getBestsellers(): Observable<Dish[]> {
    console.log('[MenuService] getBestsellers() - Fetching bestseller dishes');
    return this.api.get<Dish[]>('/dishes/bestsellers').pipe(
      tap({
        next: (dishes) => console.log('[MenuService] getBestsellers() - Success:', dishes.length, 'dishes'),
        error: (error) => console.error('[MenuService] getBestsellers() - Error:', error)
      }),
      catchError((err) => {
        console.error('[MenuService] getBestsellers() - Recovering with [] due to error:', err);
        return of([] as Dish[]);
      })
    );
  }
}
