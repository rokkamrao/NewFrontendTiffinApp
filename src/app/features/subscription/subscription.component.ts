import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';

// Services
import { SubscriptionService } from '../../core/services/subscription.service';
import { MembershipService, MembershipPlan, UserMembership, LoyaltyPoints, SubscriptionRequest } from '../../core/services/membership.service';

// Components
import { DsButton } from '../../design-system/button.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DsButton],
  templateUrl: './subscription.component.html'
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State
  plans: MembershipPlan[] = [];
  currentMembership: UserMembership | null = null;
  loyaltyPoints: LoyaltyPoints | null = null;
  selectedPlanId: number | null = null;
  selectedBillingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' = 'MONTHLY';
  promoCode: string = '';
  loading = false;
  error: string | null = null;
  
  // UI State
  showPlanComparison = false;
  showLoyaltyDetails = false;
  showCancelConfirmation = false;
  activeTab: 'plans' | 'current' | 'loyalty' | 'history' = 'plans';

  // Legacy properties for backward compatibility
  activeSubscription: any = null;

  constructor(
    private ss: SubscriptionService,
    private membershipService: MembershipService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== DATA LOADING ====================

  private loadData(): void {
    this.loading = true;
    
    // Load membership data
    combineLatest([
      this.membershipService.getPlans(),
      this.membershipService.getCurrentMembership(),
      this.membershipService.getLoyaltyPoints()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([plans, membership, loyalty]) => {
        this.plans = plans;
        this.currentMembership = membership;
        this.loyaltyPoints = loyalty;
        this.loading = false;
        
        // Set active tab based on membership status
        if (membership) {
          this.activeTab = 'current';
        }
      },
      error: (error) => {
        console.error('Error loading membership data:', error);
        this.error = 'Failed to load membership data';
        this.loading = false;
      }
    });

    // Legacy subscription loading for backward compatibility
    this.ss.getPlans().subscribe(p => {
      // Convert new plans to legacy format if needed
    });
    
    this.activeSubscription = { 
      planName: 'Premium Plan', 
      status: 'Active', 
      nextDelivery: 'Tomorrow 8 AM', 
      renewalDate: 'Jan 31, 2025' 
    };
  }

  private setupSubscriptions(): void {
    // Subscribe to membership changes
    this.membershipService.currentMembership$
      .pipe(takeUntil(this.destroy$))
      .subscribe(membership => {
        this.currentMembership = membership;
      });

    // Subscribe to loyalty points changes
    this.membershipService.loyaltyPoints$
      .pipe(takeUntil(this.destroy$))
      .subscribe(points => {
        this.loyaltyPoints = points;
      });
  }

  // ==================== PLAN SUBSCRIPTION ====================

  selectPlan(planId: number): void {
    this.selectedPlanId = planId;
    this.error = null;
  }

  subscribeToPlan(plan?: any): void {
    // Handle legacy method call
    if (plan && typeof plan === 'object' && plan.id) {
      this.selectedPlanId = plan.id;
      this.ss.subscribe(plan.id).subscribe(() => {
        // Legacy subscription handled
      });
      return;
    }

    // New membership subscription
    if (!this.selectedPlanId) {
      this.error = 'Please select a plan';
      return;
    }

    this.loading = true;
    this.error = null;

    const request: SubscriptionRequest = {
      planId: this.selectedPlanId,
      billingCycle: this.selectedBillingCycle,
      promoCode: this.promoCode || undefined
    };

    this.membershipService.subscribe(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (membership) => {
          this.currentMembership = membership;
          this.selectedPlanId = null;
          this.promoCode = '';
          this.loading = false;
          this.activeTab = 'current';
          console.log('Successfully subscribed to plan:', membership);
        },
        error: (error) => {
          console.error('Subscription failed:', error);
          this.error = 'Failed to subscribe to plan. Please try again.';
          this.loading = false;
        }
      });
  }

  upgradePlan(newPlanId: number): void {
    if (!this.currentMembership) {
      this.error = 'No active membership found';
      return;
    }

    this.loading = true;
    this.error = null;

    this.membershipService.upgrade(newPlanId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (membership) => {
          this.currentMembership = membership;
          this.loading = false;
          console.log('Successfully upgraded plan:', membership);
        },
        error: (error) => {
          console.error('Upgrade failed:', error);
          this.error = 'Failed to upgrade plan. Please try again.';
          this.loading = false;
        }
      });
  }

  // ==================== MEMBERSHIP MANAGEMENT ====================

  cancelMembership(): void {
    if (!this.currentMembership) return;

    this.loading = true;
    this.error = null;

    this.membershipService.cancel('User requested cancellation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.currentMembership = null;
          this.loading = false;
          this.showCancelConfirmation = false;
          this.activeTab = 'plans';
          console.log('Successfully cancelled membership');
        },
        error: (error) => {
          console.error('Cancellation failed:', error);
          this.error = 'Failed to cancel membership. Please try again.';
          this.loading = false;
        }
      });
  }

  // ==================== LOYALTY POINTS ====================

  redeemPoints(points: number, description: string): void {
    if (!this.loyaltyPoints || this.loyaltyPoints.availablePoints < points) {
      this.error = 'Insufficient loyalty points';
      return;
    }

    this.loading = true;
    this.error = null;

    this.membershipService.redeemPoints(points, description)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.success) {
            console.log('Points redeemed successfully:', result.message);
            // Refresh loyalty points
            this.membershipService.getLoyaltyPoints().subscribe();
          } else {
            this.error = result.message;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Point redemption failed:', error);
          this.error = 'Failed to redeem points. Please try again.';
          this.loading = false;
        }
      });
  }

  // ==================== UI HELPERS ====================

  setActiveTab(tab: 'plans' | 'current' | 'loyalty' | 'history'): void {
    this.activeTab = tab;
    this.error = null;
  }

  togglePlanComparison(): void {
    this.showPlanComparison = !this.showPlanComparison;
  }

  toggleLoyaltyDetails(): void {
    this.showLoyaltyDetails = !this.showLoyaltyDetails;
  }

  getPlanByTier(tier: string): MembershipPlan | undefined {
    return this.plans.find(plan => plan.tier === tier);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTierBadgeClass(tier: string): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (tier) {
      case 'FREE': return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'BASIC': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'PREMIUM': return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'VIP': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'ENTERPRISE': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getLoyaltyTierColor(tier: string): string {
    switch (tier) {
      case 'BRONZE': return 'text-orange-600';
      case 'SILVER': return 'text-gray-600';
      case 'GOLD': return 'text-yellow-600';
      case 'PLATINUM': return 'text-purple-600';
      case 'DIAMOND': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }

  canUpgradeTo(planTier: string): boolean {
    if (!this.currentMembership) return true;
    
    const tierOrder = ['FREE', 'BASIC', 'PREMIUM', 'VIP', 'ENTERPRISE'];
    const currentIndex = tierOrder.indexOf(this.currentMembership.plan.tier);
    const targetIndex = tierOrder.indexOf(planTier);
    
    return targetIndex > currentIndex;
  }

  isCurrentPlan(planId: number): boolean {
    return this.currentMembership?.plan.id === planId;
  }
}
