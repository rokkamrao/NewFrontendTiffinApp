import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SubscriptionModel, SubscriptionPlan, SubscriptionPlanType } from '../models/subscription.model';

const STORAGE_KEY = 'tk_subscription_v1';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private _sub: SubscriptionModel | null = null;

  plans: SubscriptionPlan[] = [
    { id: 'p1', name: 'Basic', pricePerMonth: 1299, mealsPerDay: 1, features: ['1 meal/day', 'Veg only', 'Change menu daily'] },
    { id: 'p2', name: 'Standard', pricePerMonth: 1899, mealsPerDay: 2, features: ['2 meals/day', 'Veg/Non-Veg', 'Priority support'] },
    { id: 'p3', name: 'Premium', pricePerMonth: 2499, mealsPerDay: 3, features: ['3 meals/day', 'Customizable', 'Free add-ons'] },
  ];

  constructor(){ this.load(); }

  getCurrent(): Observable<SubscriptionModel | null> { return of(this._sub); }

  getPlans(): Observable<SubscriptionPlan[]> { return of(this.plans); }

  subscribe(planId: string): Observable<SubscriptionModel> {
    const plan = this.plans.find(p => p.id === planId)!;
    const sub: SubscriptionModel = {
      id: 's' + Date.now(),
      plan,
      status: 'Active',
      startedAt: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      remainingMeals: plan.mealsPerDay * 30
    };
    this._sub = sub; this.save();
    return of(sub);
  }

  pause(): Observable<SubscriptionModel | null> { if(this._sub){ this._sub.status = 'Paused'; this.save(); } return of(this._sub); }
  resume(): Observable<SubscriptionModel | null> { if(this._sub){ this._sub.status = 'Active'; this.save(); } return of(this._sub); }
  cancel(): Observable<boolean> { this._sub = null; this.save(); return of(true); }

  private save(){ try{ if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(this._sub)); }catch(e){}}
  private load(){ try{ if (typeof window !== 'undefined' && typeof localStorage !== 'undefined'){ const r = localStorage.getItem(STORAGE_KEY); if(r) this._sub = JSON.parse(r); } }catch(e){} }
}
