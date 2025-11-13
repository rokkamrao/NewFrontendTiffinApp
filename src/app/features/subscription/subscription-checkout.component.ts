import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-subscription-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Subscription Checkout</h1>
        
        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Order Summary -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div *ngIf="selectedPlan" class="border rounded-lg p-4 mb-4">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ selectedPlan.name }}</h3>
                  <p class="text-gray-600 text-sm">{{ selectedPlan.description }}</p>
                  <div class="mt-2">
                    <span class="text-sm text-gray-500">Duration:</span>
                    <span class="ml-1 text-sm font-medium">{{ selectedPlan.duration }}</span>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Meals:</span>
                    <span class="ml-1 text-sm font-medium">{{ selectedPlan.mealsPerDay }} per {{ selectedPlan.duration }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-900">₹{{ selectedPlan.price }}</div>
                  <div *ngIf="selectedPlan.originalPrice" class="text-sm text-gray-500 line-through">₹{{ selectedPlan.originalPrice }}</div>
                  <div *ngIf="selectedPlan.savings" class="text-sm text-green-600 font-medium">Save {{ selectedPlan.savings }}%</div>
                </div>
              </div>
            </div>
            
            <div *ngIf="!selectedPlan" class="text-center py-8 text-gray-500">
              No plan selected. <a routerLink="/subscription" class="text-blue-600 hover:text-blue-800">Go back to select a plan</a>
            </div>
            
            <!-- Features -->
            <div *ngIf="selectedPlan" class="mt-4">
              <h4 class="font-medium text-gray-900 mb-2">What's included:</h4>
              <ul class="space-y-1">
                <li *ngFor="let feature of selectedPlan.features" class="flex items-start text-sm text-gray-600">
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Payment Options -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
            
            <div class="space-y-4">
              <div class="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                   [class.border-blue-500]="paymentMethod === 'razorpay'"
                   [class.bg-blue-50]="paymentMethod === 'razorpay'"
                   (click)="paymentMethod = 'razorpay'">
                <div class="flex items-center">
                  <input type="radio" 
                         [checked]="paymentMethod === 'razorpay'"
                         (change)="paymentMethod = 'razorpay'"
                         class="w-4 h-4 text-blue-600">
                  <label class="ml-3 text-sm font-medium text-gray-900">Online Payment</label>
                </div>
                <p class="ml-7 text-xs text-gray-500">Pay securely with UPI, Credit/Debit Card, Net Banking</p>
              </div>
              
              <div class="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                   [class.border-blue-500]="paymentMethod === 'cod'"
                   [class.bg-blue-50]="paymentMethod === 'cod'"
                   (click)="paymentMethod = 'cod'">
                <div class="flex items-center">
                  <input type="radio" 
                         [checked]="paymentMethod === 'cod'"
                         (change)="paymentMethod = 'cod'"
                         class="w-4 h-4 text-blue-600">
                  <label class="ml-3 text-sm font-medium text-gray-900">Cash on Delivery</label>
                </div>
                <p class="ml-7 text-xs text-gray-500">Pay when your first meal is delivered</p>
              </div>
            </div>
            
            <!-- Proceed Button -->
            <div class="mt-6">
              <button (click)="proceedToPayment()"
                      [disabled]="!selectedPlan || processing"
                      [class]="getButtonClass()"
                      class="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200">
                <span *ngIf="processing">Processing...</span>
                <span *ngIf="!processing">Complete Subscription - ₹{{ selectedPlan?.price || 0 }}</span>
              </button>
            </div>
            
            <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-800 text-sm">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubscriptionCheckoutComponent implements OnInit {
  private router = inject(Router);
  private session = inject(SessionService);
  private platformId = inject(PLATFORM_ID);

  selectedPlan: any = null;
  paymentMethod = 'razorpay';
  processing = false;
  errorMessage = '';

  ngOnInit() {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // First priority: Check if a plan has been selected
    this.loadSelectedPlan();
    
    // If no plan is selected, redirect immediately to subscription page
    if (!this.selectedPlan) {
      console.warn('[SubscriptionCheckout] No plan selected, redirecting to subscription page');
      this.router.navigate(['/subscription'], {
        queryParams: { message: 'Please select a subscription plan first' }
      });
      return;
    }

    // TEMPORARY: For testing purposes, bypass authentication
    // TODO: Remove this after authentication system is fixed
    const BYPASS_AUTH_FOR_TESTING = true;

    // Check authentication only after plan validation
    const sessionState = this.session.getCurrentSession();
    if (!sessionState.isLoggedIn && !BYPASS_AUTH_FOR_TESTING) {
      console.log('[SubscriptionCheckout] User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/subscription/checkout' }
      });
      return;
    }

    if (!sessionState.isLoggedIn && BYPASS_AUTH_FOR_TESTING) {
      console.log('[SubscriptionCheckout] ⚠️  BYPASSING AUTH FOR TESTING - User not authenticated but continuing anyway');
    }

    console.log('[SubscriptionCheckout] Plan validation passed, proceeding with checkout for plan:', this.selectedPlan?.name);

    // Load selected plan from sessionStorage
    this.loadSelectedPlan();
  }

  loadSelectedPlan() {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const planData = sessionStorage.getItem('selectedSubscriptionPlan');
      if (planData) {
        try {
          this.selectedPlan = JSON.parse(planData);
          console.log('[SubscriptionCheckout] ✅ Loaded selected plan:', this.selectedPlan);
          
          // Validate plan has required properties
          if (!this.selectedPlan.id || !this.selectedPlan.name || !this.selectedPlan.price) {
            console.error('[SubscriptionCheckout] ❌ Invalid plan data, missing required properties');
            this.selectedPlan = null;
          }
        } catch (error) {
          console.error('[SubscriptionCheckout] ❌ Error parsing plan data:', error);
          this.selectedPlan = null;
          // Clear invalid data
          sessionStorage.removeItem('selectedSubscriptionPlan');
        }
      } else {
        console.warn('[SubscriptionCheckout] ❌ No plan data found in sessionStorage');
        this.selectedPlan = null;
      }
    } else {
      console.warn('[SubscriptionCheckout] ⚠️  Browser storage not available (SSR)');
      this.selectedPlan = null;
    }
  }

  proceedToPayment() {
    if (!this.selectedPlan) {
      this.errorMessage = 'Please select a plan first';
      // Redirect back to subscription page
      setTimeout(() => {
        this.router.navigate(['/subscription'], {
          queryParams: { message: 'Please select a subscription plan first' }
        });
      }, 2000);
      return;
    }

    // Store payment method for the payment component
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('subscriptionPaymentMethod', this.paymentMethod);
    }

    console.log('[SubscriptionCheckout] ✅ Proceeding to payment with plan:', this.selectedPlan.name, 'and method:', this.paymentMethod);

    // Navigate to subscription payment
    this.router.navigate(['/subscription/payment']);
  }

  getButtonClass() {
    const baseClasses = 'w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    if (!this.selectedPlan || this.processing) {
      return `${baseClasses} bg-gray-400 text-white cursor-not-allowed`;
    }
    
    return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
  }
}