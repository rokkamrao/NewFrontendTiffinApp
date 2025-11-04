import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

// ==================== INTERFACES ====================

export interface MembershipPlan {
  id: number;
  name: string;
  tier: 'FREE' | 'BASIC' | 'PREMIUM' | 'VIP' | 'ENTERPRISE';
  price: number;
  duration: number;
  durationUnit: 'DAYS' | 'MONTHS' | 'YEARS';
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  features: string[];
  benefits: {
    deliveryFeeDiscount: number;
    orderMinimumReduction: number;
    exclusiveDeals: boolean;
    prioritySupport: boolean;
    freeDeliveries: number;
    loyaltyMultiplier: number;
  };
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
}

export interface UserMembership {
  id: number;
  plan: MembershipPlan;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING' | 'SUSPENDED';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  autoRenew: boolean;
  totalSavings: number;
  ordersPlaced: number;
  deliveriesUsed: number;
  loyaltyPointsEarned: number;
}

export interface LoyaltyPoints {
  id: number;
  totalPoints: number;
  availablePoints: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  tierProgress: number;
  pointsToNextTier: number;
  expiringPoints: number;
  expirationDate: string;
}

export interface SubscriptionRequest {
  planId: number;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  promoCode?: string;
}

export interface BenefitsCalculation {
  deliveryDiscount: number;
  totalDiscount: number;
  loyaltyPointsEarned: number;
  freeDeliveryApplied: boolean;
  estimatedSavings: number;
}

// ==================== SERVICE ====================

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private api = inject(ApiService);
  
  // State management
  private currentMembershipSubject = new BehaviorSubject<UserMembership | null>(null);
  private loyaltyPointsSubject = new BehaviorSubject<LoyaltyPoints | null>(null);
  private plansSubject = new BehaviorSubject<MembershipPlan[]>([]);
  
  // Public observables
  public currentMembership$ = this.currentMembershipSubject.asObservable();
  public loyaltyPoints$ = this.loyaltyPointsSubject.asObservable();
  public plans$ = this.plansSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  // ==================== PUBLIC API ====================

  /**
   * Load all membership plans
   */
  getPlans(): Observable<MembershipPlan[]> {
    console.log('[MembershipService] getPlans() - Fetching membership plans');
    return this.api.get<MembershipPlan[]>('/api/membership/plans').pipe(
      tap({
        next: (plans) => {
          console.log('[MembershipService] getPlans() - Success:', plans);
          this.plansSubject.next(plans);
        },
        error: (error) => console.error('[MembershipService] getPlans() - Error:', error)
      }),
      catchError(() => of(this.getMockPlans()))
    );
  }

  /**
   * Get featured plans for homepage
   */
  getFeaturedPlans(): Observable<MembershipPlan[]> {
    console.log('[MembershipService] getFeaturedPlans() - Fetching featured plans');
    return this.api.get<MembershipPlan[]>('/api/membership/plans/featured').pipe(
      tap({
        next: (plans) => console.log('[MembershipService] getFeaturedPlans() - Success:', plans),
        error: (error) => console.error('[MembershipService] getFeaturedPlans() - Error:', error)
      }),
      catchError(() => of(this.getMockPlans().filter(p => p.isFeatured)))
    );
  }

  /**
   * Get current user's membership
   */
  getCurrentMembership(): Observable<UserMembership | null> {
    console.log('[MembershipService] getCurrentMembership() - Fetching current membership');
    return this.api.get<UserMembership>('/api/membership/current').pipe(
      tap({
        next: (membership) => {
          console.log('[MembershipService] getCurrentMembership() - Success:', membership);
          this.currentMembershipSubject.next(membership);
        },
        error: (error) => {
          console.error('[MembershipService] getCurrentMembership() - Error:', error);
          this.currentMembershipSubject.next(null);
        }
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Subscribe to a membership plan
   */
  subscribe(request: SubscriptionRequest): Observable<UserMembership> {
    console.log('[MembershipService] subscribe() - Subscribing to plan:', request);
    return this.api.post<UserMembership>('/api/membership/subscribe', request).pipe(
      tap({
        next: (membership) => {
          console.log('[MembershipService] subscribe() - Success:', membership);
          this.currentMembershipSubject.next(membership);
        },
        error: (error) => console.error('[MembershipService] subscribe() - Error:', error)
      })
    );
  }

  /**
   * Upgrade membership plan
   */
  upgrade(newPlanId: number): Observable<UserMembership> {
    console.log('[MembershipService] upgrade() - Upgrading to plan:', newPlanId);
    return this.api.post<UserMembership>('/api/membership/upgrade', { newPlanId }).pipe(
      tap({
        next: (membership) => {
          console.log('[MembershipService] upgrade() - Success:', membership);
          this.currentMembershipSubject.next(membership);
        },
        error: (error) => console.error('[MembershipService] upgrade() - Error:', error)
      })
    );
  }

  /**
   * Cancel membership
   */
  cancel(reason?: string): Observable<void> {
    console.log('[MembershipService] cancel() - Cancelling membership:', reason);
    return this.api.post<void>('/api/membership/cancel', { reason }).pipe(
      tap({
        next: () => {
          console.log('[MembershipService] cancel() - Success');
          this.currentMembershipSubject.next(null);
        },
        error: (error) => console.error('[MembershipService] cancel() - Error:', error)
      })
    );
  }

  /**
   * Get loyalty points
   */
  getLoyaltyPoints(): Observable<LoyaltyPoints> {
    console.log('[MembershipService] getLoyaltyPoints() - Fetching loyalty points');
    return this.api.get<LoyaltyPoints>('/api/membership/loyalty').pipe(
      tap({
        next: (points) => {
          console.log('[MembershipService] getLoyaltyPoints() - Success:', points);
          this.loyaltyPointsSubject.next(points);
        },
        error: (error) => console.error('[MembershipService] getLoyaltyPoints() - Error:', error)
      }),
      catchError(() => of(this.getMockLoyaltyPoints()))
    );
  }

  /**
   * Redeem loyalty points
   */
  redeemPoints(points: number, description: string): Observable<{success: boolean, message: string}> {
    console.log('[MembershipService] redeemPoints() - Redeeming points:', points, description);
    return this.api.post<{success: boolean, message: string}>('/api/membership/loyalty/redeem', 
      { points, description }).pipe(
      tap({
        next: (result) => {
          console.log('[MembershipService] redeemPoints() - Success:', result);
          if (result.success) {
            // Refresh loyalty points after successful redemption
            this.getLoyaltyPoints().subscribe();
          }
        },
        error: (error) => console.error('[MembershipService] redeemPoints() - Error:', error)
      })
    );
  }

  /**
   * Calculate benefits for an order
   */
  calculateBenefits(orderAmount: number): Observable<BenefitsCalculation> {
    console.log('[MembershipService] calculateBenefits() - Calculating for amount:', orderAmount);
    return this.api.post<BenefitsCalculation>('/api/membership/benefits/calculate', 
      { orderAmount }).pipe(
      tap({
        next: (benefits) => console.log('[MembershipService] calculateBenefits() - Success:', benefits),
        error: (error) => console.error('[MembershipService] calculateBenefits() - Error:', error)
      }),
      catchError(() => of(this.getMockBenefits(orderAmount)))
    );
  }

  /**
   * Record order usage for membership benefits tracking
   */
  recordOrderUsage(orderAmount: number, savingsAmount: number): Observable<void> {
    console.log('[MembershipService] recordOrderUsage() - Recording usage:', orderAmount, savingsAmount);
    return this.api.post<void>('/api/membership/usage/order', 
      { orderAmount, savingsAmount }).pipe(
      tap({
        next: () => console.log('[MembershipService] recordOrderUsage() - Success'),
        error: (error) => console.error('[MembershipService] recordOrderUsage() - Error:', error)
      })
    );
  }

  // ==================== HELPER METHODS ====================

  /**
   * Check if user has active membership
   */
  hasActiveMembership(): boolean {
    const current = this.currentMembershipSubject.value;
    return current?.status === 'ACTIVE';
  }

  /**
   * Get current membership tier
   */
  getCurrentTier(): string {
    const current = this.currentMembershipSubject.value;
    return current?.plan?.tier || 'FREE';
  }

  /**
   * Check if user can access premium features
   */
  canAccessPremiumFeatures(): boolean {
    const tier = this.getCurrentTier();
    return ['PREMIUM', 'VIP', 'ENTERPRISE'].includes(tier);
  }

  // ==================== PRIVATE METHODS ====================

  private loadInitialData(): void {
    this.getPlans().subscribe();
    this.getCurrentMembership().subscribe();
    this.getLoyaltyPoints().subscribe();
  }

  private getMockPlans(): MembershipPlan[] {
    return [
      {
        id: 1,
        name: 'Basic Plan',
        tier: 'BASIC',
        price: 199,
        duration: 1,
        durationUnit: 'MONTHS',
        billingCycle: 'MONTHLY',
        features: ['Free delivery on orders above ₹500', '5% cashback', 'Basic support'],
        benefits: {
          deliveryFeeDiscount: 100,
          orderMinimumReduction: 0,
          exclusiveDeals: false,
          prioritySupport: false,
          freeDeliveries: 3,
          loyaltyMultiplier: 1.2
        },
        description: 'Perfect for regular orders',
        isActive: true,
        isFeatured: false,
        isPopular: false
      },
      {
        id: 2,
        name: 'Premium Plan',
        tier: 'PREMIUM',
        price: 399,
        duration: 1,
        durationUnit: 'MONTHS',
        billingCycle: 'MONTHLY',
        features: ['Unlimited free delivery', '10% cashback', 'Priority support', 'Exclusive dishes'],
        benefits: {
          deliveryFeeDiscount: 100,
          orderMinimumReduction: 200,
          exclusiveDeals: true,
          prioritySupport: true,
          freeDeliveries: -1, // Unlimited
          loyaltyMultiplier: 2.0
        },
        description: 'Best value for food lovers',
        isActive: true,
        isFeatured: true,
        isPopular: true
      },
      {
        id: 3,
        name: 'VIP Plan',
        tier: 'VIP',
        price: 799,
        duration: 1,
        durationUnit: 'MONTHS',
        billingCycle: 'MONTHLY',
        features: ['All Premium features', '15% cashback', 'Personal food consultant', 'Early access to new dishes'],
        benefits: {
          deliveryFeeDiscount: 100,
          orderMinimumReduction: 500,
          exclusiveDeals: true,
          prioritySupport: true,
          freeDeliveries: -1,
          loyaltyMultiplier: 3.0
        },
        description: 'Ultimate foodie experience',
        isActive: true,
        isFeatured: true,
        isPopular: false
      }
    ];
  }

  private getMockLoyaltyPoints(): LoyaltyPoints {
    return {
      id: 1,
      totalPoints: 1250,
      availablePoints: 850,
      tier: 'GOLD',
      tierProgress: 70,
      pointsToNextTier: 150,
      expiringPoints: 50,
      expirationDate: '2024-12-31'
    };
  }

  private getMockBenefits(orderAmount: number): BenefitsCalculation {
    const membership = this.currentMembershipSubject.value;
    if (!membership) {
      return {
        deliveryDiscount: 0,
        totalDiscount: 0,
        loyaltyPointsEarned: Math.floor(orderAmount * 0.01),
        freeDeliveryApplied: false,
        estimatedSavings: 0
      };
    }

    const deliveryDiscount = membership.plan.benefits.deliveryFeeDiscount;
    const cashbackPercent = membership.plan.tier === 'PREMIUM' ? 10 : 
                           membership.plan.tier === 'VIP' ? 15 : 5;
    const cashback = orderAmount * (cashbackPercent / 100);
    
    return {
      deliveryDiscount,
      totalDiscount: deliveryDiscount + cashback,
      loyaltyPointsEarned: Math.floor(orderAmount * membership.plan.benefits.loyaltyMultiplier * 0.01),
      freeDeliveryApplied: true,
      estimatedSavings: deliveryDiscount + cashback
    };
  }
}