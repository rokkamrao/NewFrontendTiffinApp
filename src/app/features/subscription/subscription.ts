import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subscription',
  imports: [CommonModule],
  templateUrl: './subscription.html',
  styleUrl: './subscription.css'
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  private platformId = inject(PLATFORM_ID);
  private authSubscription?: Subscription;

  loading = false;
  error: string | null = null;
  isAuthenticated = false;
  
  // Subscription plans from real API
  plans: any[] = [];

  ngOnInit() {
    console.log('[Subscription] Component initializing...');
    
    // Check for redirect messages from checkout
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get('message');
      if (message) {
        console.log('[Subscription] 📢 Message from redirect:', message);
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    this.loadPlans();
    
    // Subscribe to auth state changes for real-time updates
    this.authSubscription = this.authService.user$.subscribe(user => {
      console.log('[Subscription] 🔄 Auth state changed:', user ? `Logged in as ${user.name}` : 'Not logged in');
      this.isAuthenticated = !!user;
      console.log('[Subscription] Updated isAuthenticated to:', this.isAuthenticated);
    });
    
    // Check authentication after component initializes (client-side)
    if (isPlatformBrowser(this.platformId)) {
      console.log('[Subscription] Running in browser, checking auth');
      // Immediate check
      this.checkAuthStatus();
      // Also check after a small delay to ensure everything is loaded
      setTimeout(() => {
        this.checkAuthStatus();
      }, 100);
    } else {
      console.log('[Subscription] Running in SSR, skipping auth check');
    }
  }

  checkAuthStatus() {
    console.log('[Subscription] checkAuthStatus() called');
    const authServiceResult = this.authService.isLoggedIn();
    const currentUser = this.authService.getCurrentUser();
    
    console.log('[Subscription] Auth check results:');
    console.log('  - AuthService.isLoggedIn():', authServiceResult);
    console.log('  - AuthService.getCurrentUser():', currentUser?.name || 'none');
    
    this.isAuthenticated = authServiceResult && !!currentUser;
    console.log('[Subscription] Final isAuthenticated:', this.isAuthenticated);
    
    // Check if there's a token in localStorage for debugging
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      const userProfile = localStorage.getItem('userProfile');
      console.log('[Subscription] Storage check:');
      console.log('  - Token in localStorage:', token ? 'Present' : 'Not found');
      console.log('  - UserProfile in localStorage:', userProfile ? 'Present' : 'Not found');
    }
  }

  get isUserAuthenticated(): boolean {
    // Use the reactive property that gets updated from auth subscription
    return this.isAuthenticated;
  }

  loadPlans() {
    this.loading = true;
    this.error = null;
    
    console.log('[Subscription] Loading subscription plans from API');
    this.subscriptionService.fetchPlans().subscribe({
      next: (plans) => {
        console.log('[Subscription] Received subscription plans:', plans);
        
        if (plans && plans.length > 0) {
          // Transform API plans to match the current UI format
          this.plans = plans.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            type: plan.planType?.toLowerCase() || 'daily',
            price: plan.pricePerMonth,
            originalPrice: plan.originalPrice,
            duration: plan.duration || 'month',
            badge: plan.badge || '',
            badgeColor: plan.badgeColor || 'blue',
            description: plan.description || '',
            features: plan.features || [],
            mealsPerDay: plan.mealsPerDay || 1,
            savings: plan.savings || null,
            popular: plan.popular || false
          }));
          console.log('[Subscription] Plans transformed and loaded:', this.plans.length);
        } else {
          // Fallback plans when API returns empty results
          console.log('[Subscription] API returned empty plans, using fallback data');
          this.plans = this.getFallbackPlans();
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('[Subscription] Error loading plans:', error);
        this.error = 'Failed to load subscription plans. Please try again.';
        
        // Use fallback plans on error
        console.log('[Subscription] API error, using fallback data');
        this.plans = this.getFallbackPlans();
        this.loading = false;
      }
    });
  }

  getFallbackPlans() {
    return [
      {
        id: 'basic',
        name: 'Basic Plan',
        type: 'monthly',
        price: 1499,
        originalPrice: 1999,
        duration: 'month',
        badge: 'Good Start',
        badgeColor: 'blue',
        description: 'Perfect for individuals. Get fresh, home-cooked meals delivered daily.',
        features: [
          'Fresh home-cooked meals',
          '30 orders per month',
          'Standard delivery',
          'Email support',
          'Basic meal customization'
        ],
        mealsPerDay: 1,
        savings: 25,
        popular: false
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        type: 'monthly',
        price: 2499,
        originalPrice: 3499,
        duration: 'month',
        badge: 'Most Popular',
        badgeColor: 'green',
        description: 'Most popular choice! Includes priority delivery and exclusive menu options.',
        features: [
          'All Basic features',
          '60 orders per month',
          'Priority delivery (30 min)',
          'Phone & chat support',
          'Exclusive menu options',
          'Advanced meal customization',
          '1.5x loyalty points'
        ],
        mealsPerDay: 2,
        savings: 29,
        popular: true
      },
      {
        id: 'elite',
        name: 'Elite Plan',
        type: 'monthly',
        price: 3999,
        originalPrice: 5999,
        duration: 'month',
        badge: 'Best Value',
        badgeColor: 'purple',
        description: 'Ultimate experience with unlimited orders, premium chef specials, and VIP support.',
        features: [
          'All Premium features',
          'Unlimited orders',
          'Express delivery (15 min)',
          '24/7 VIP support',
          'Premium chef specials',
          'Personal meal consultant',
          'Free cancellations',
          '2x loyalty points'
        ],
        mealsPerDay: 3,
        savings: 33,
        popular: false
      }
    ];
  }

  selectPlan(plan: any) {
    console.log('[Subscription] selectPlan() called with plan:', plan);
    console.log('[Subscription] isUserAuthenticated:', this.isUserAuthenticated);
    
    // TEMPORARY: For testing purposes, always allow plan selection
    // TODO: Remove this after authentication system is fixed
    const BYPASS_AUTH_FOR_TESTING = true;
    
    if (!this.isUserAuthenticated && !BYPASS_AUTH_FOR_TESTING) {
      console.log('[Subscription] User not authenticated, redirecting to login');
      this.goToLogin();
      return;
    }
    
    if (!this.isUserAuthenticated && BYPASS_AUTH_FOR_TESTING) {
      console.log('[Subscription] ⚠️  BYPASSING AUTH FOR TESTING - User not authenticated but continuing anyway');
    } else {
      console.log('[Subscription] User authenticated, proceeding with plan selection');
    }
    
    // Store selected plan in sessionStorage for the checkout process
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('selectedSubscriptionPlan', JSON.stringify(plan));
      console.log('[Subscription] Plan stored in sessionStorage');
    }
    // Navigate to subscription-specific checkout
    console.log('[Subscription] Navigating to /subscription/checkout');
    this.router.navigate(['/subscription/checkout']);
  }

  goToLogin() {
    console.log('[Subscription] goToLogin() called');
    console.log('[Subscription] Current URL:', this.router.url);
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: this.router.url }
    });
  }

  learnMore() {
    console.log('[Subscription] learnMore() called');
    // Scroll to the plans section to show more details
    const plansSection = document.getElementById('plans-section');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Alternative: scroll to the features or about section
      window.scrollTo({ 
        top: window.innerHeight * 0.6, 
        behavior: 'smooth' 
      });
    }
  }

  getButtonClass(plan?: any) {
    if (!this.isUserAuthenticated) {
      return 'btn btn-primary';
    }
    
    if (plan?.popular) {
      return 'btn btn-success';
    }
    
    return 'btn btn-success';
  }

  getButtonText() {
    return this.isUserAuthenticated ? 'Subscribe Now' : 'Select Plan';
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
