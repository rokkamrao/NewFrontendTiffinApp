import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Subscription, SubscriptionStatus, SubscriptionModel, SubscriptionPlan, SubscriptionPlanType } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private api = inject(ApiService);

  constructor(){ 
    // No longer loading from localStorage - all data comes from API
  }

  /**
   * Fetch subscription plans from API
   */
  fetchPlans(): Observable<SubscriptionPlan[]> {
    console.log('[SubscriptionService] fetchPlans() - Fetching plans from API');
    return this.api.get<SubscriptionPlan[]>('/subscription-plans').pipe(
      tap({
        next: (plans) => console.log('[SubscriptionService] fetchPlans() - Success:', plans),
        error: (error) => console.error('[SubscriptionService] fetchPlans() - Error:', error)
      })
    );
  }

  // Legacy methods for backward compatibility - now using API
  getCurrent(): Observable<SubscriptionModel | null> { 
    console.log('[SubscriptionService] getCurrent() - Fetching current subscription from API');
    return this.list().pipe(
      map(subs => subs.length > 0 ? subs[0] as unknown as SubscriptionModel : null),
      catchError(() => of(null))
    );
  }
  
  getPlans(): Observable<SubscriptionPlan[]> { 
    console.log('[SubscriptionService] getPlans() - Using legacy method, redirecting to fetchPlans()');
    return this.fetchPlans(); 
  }
  
  subscribe(planId: string): Observable<SubscriptionModel> {
    console.log('[SubscriptionService] subscribe() - Creating subscription for plan:', planId);
    const subscription = {
      planId: planId,
      status: SubscriptionStatus.ACTIVE
    };
    return this.create(subscription).pipe(
      map(sub => sub as unknown as SubscriptionModel)
    );
  }
  
  pause(): Observable<SubscriptionModel | null> { 
    console.log('[SubscriptionService] pause() - Using API to pause subscription');
    return this.getCurrent().pipe(
      switchMap(current => {
        if (current) {
          return this.updateStatus(current.id as unknown as number, SubscriptionStatus.PAUSED).pipe(
            map(sub => sub as unknown as SubscriptionModel)
          );
        }
        return of(null);
      })
    );
  }
  
  resume(): Observable<SubscriptionModel | null> { 
    console.log('[SubscriptionService] resume() - Using API to resume subscription');
    return this.getCurrent().pipe(
      switchMap(current => {
        if (current) {
          return this.updateStatus(current.id as unknown as number, SubscriptionStatus.ACTIVE).pipe(
            map(sub => sub as unknown as SubscriptionModel)
          );
        }
        return of(null);
      })
    );
  }
  
  cancel(): Observable<boolean> { 
    console.log('[SubscriptionService] cancel() - Using API to cancel subscription');
    return this.getCurrent().pipe(
      switchMap(current => {
        if (current) {
          return this.updateStatus(current.id as unknown as number, SubscriptionStatus.CANCELLED).pipe(
            map(() => true)
          );
        }
        return of(true);
      })
    );
  }

  // New API-based methods
  /**
   * Create a new subscription
   */
  create(subscription: Partial<Subscription>): Observable<Subscription> {
    console.log('[SubscriptionService] create() - Creating subscription:', subscription);
    return this.api.post<Subscription>('/subscriptions', subscription).pipe(
      tap({
        next: (createdSub) => console.log('[SubscriptionService] create() - Success:', createdSub),
        error: (error) => console.error('[SubscriptionService] create() - Error:', error)
      })
    );
  }

  /**
   * List all subscriptions for the current user
   */
  list(): Observable<Subscription[]> {
    console.log('[SubscriptionService] list() - Fetching subscriptions');
    return this.api.get<Subscription[]>('/subscriptions').pipe(
      tap({
        next: (subs) => console.log('[SubscriptionService] list() - Success:', subs),
        error: (error) => console.error('[SubscriptionService] list() - Error:', error)
      })
    );
  }

  /**
   * Update subscription status
   */
  updateStatus(id: number, status: SubscriptionStatus): Observable<Subscription> {
    console.log('[SubscriptionService] updateStatus() - Updating subscription:', id, 'to', status);
    return this.api.patch<Subscription>(`/subscriptions/${id}/status?status=${status}`, {}).pipe(
      tap({
        next: (updatedSub) => console.log('[SubscriptionService] updateStatus() - Success:', updatedSub),
        error: (error) => console.error('[SubscriptionService] updateStatus() - Error:', error)
      })
    );
  }

  /**
   * Renew a subscription
   */
  renew(id: number): Observable<Subscription> {
    console.log('[SubscriptionService] renew() - Renewing subscription:', id);
    return this.api.post<Subscription>(`/subscriptions/${id}/renew`, {}).pipe(
      tap({
        next: (renewedSub) => console.log('[SubscriptionService] renew() - Success:', renewedSub),
        error: (error) => console.error('[SubscriptionService] renew() - Error:', error)
      })
    );
  }
}
