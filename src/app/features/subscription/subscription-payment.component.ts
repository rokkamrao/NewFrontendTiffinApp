import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { ApiService } from '../../core/services/api.service';
import { SubscriptionPlanType } from '../../core/models/subscription.model';
import { firstValueFrom } from 'rxjs';

// Razorpay types
declare var Razorpay: any;

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
}

@Component({
  selector: 'app-subscription-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-2xl mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Complete Your Subscription</h1>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <!-- Plan Summary -->
          <div *ngIf="selectedPlan" class="border-b pb-4 mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ selectedPlan.name }}</h3>
            <p class="text-gray-600 text-sm">{{ selectedPlan.description }}</p>
            <div class="mt-4 flex justify-between items-center">
              <div>
                <div class="text-sm text-gray-500">Total Amount</div>
                <div class="text-2xl font-bold text-gray-900">₹{{ selectedPlan.price }}</div>
                <div *ngIf="selectedPlan.savings" class="text-sm text-green-600">Save {{ selectedPlan.savings }}% on this plan</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">{{ selectedPlan.mealsPerDay }} meals</div>
                <div class="text-sm text-gray-500">{{ selectedPlan.duration }}</div>
              </div>
            </div>
          </div>
          
          <!-- Payment Method Info -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-2">Payment Method</h4>
            <div class="flex items-center text-sm text-gray-600">
              <span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              <span *ngIf="paymentMethod === 'razorpay'">Online Payment (UPI/Card/Net Banking)</span>
              <span *ngIf="paymentMethod === 'cod'">Cash on Delivery</span>
            </div>
          </div>
          
          <!-- Payment Button -->
          <div class="space-y-4">
            <button (click)="processPayment()"
                    [disabled]="processing || !selectedPlan"
                    [class]="getButtonClass()"
                    class="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200">
              <span *ngIf="processing">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
              <span *ngIf="!processing && paymentMethod === 'razorpay'">
                Pay ₹{{ selectedPlan?.price || 0 }} Securely
              </span>
              <span *ngIf="!processing && paymentMethod === 'cod'">
                Confirm Subscription (COD)
              </span>
            </button>
            
            <button (click)="goBack()" 
                    [disabled]="processing"
                    class="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Back to Checkout
            </button>
          </div>
          
          <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800 text-sm">{{ errorMessage }}</p>
          </div>
          
          <!-- Security Notice -->
          <div class="mt-6 text-center text-xs text-gray-500">
            <div class="flex items-center justify-center mb-2">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
              </svg>
              Secure Payment
            </div>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubscriptionPaymentComponent implements OnInit {
  private router = inject(Router);
  private session = inject(SessionService);
  private subscriptionService = inject(SubscriptionService);
  private api = inject(ApiService);
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

    // Check authentication
    const sessionState = this.session.getCurrentSession();
    if (!sessionState.isLoggedIn) {
      console.log('[SubscriptionPayment] User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/subscription/payment' }
      });
      return;
    }

    this.loadSubscriptionData();
  }

  loadSubscriptionData() {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      // Load selected plan
      const planData = sessionStorage.getItem('selectedSubscriptionPlan');
      if (planData) {
        this.selectedPlan = JSON.parse(planData);
      }

      // Load payment method
      const paymentMethodData = sessionStorage.getItem('subscriptionPaymentMethod');
      if (paymentMethodData) {
        this.paymentMethod = paymentMethodData;
      }

      if (!this.selectedPlan) {
        console.warn('[SubscriptionPayment] No plan selected, redirecting to subscription page');
        this.router.navigate(['/subscription']);
      }
    }
  }

  async processPayment() {
    if (!this.selectedPlan) {
      this.errorMessage = 'No plan selected';
      return;
    }

    this.processing = true;
    this.errorMessage = '';

    try {
      if (this.paymentMethod === 'razorpay') {
        await this.processOnlinePayment();
      } else if (this.paymentMethod === 'cod') {
        await this.processCODSubscription();
      }
    } catch (error: any) {
      console.error('[SubscriptionPayment] Payment failed:', error);
      this.errorMessage = error.message || 'Payment failed. Please try again.';
      this.processing = false;
    }
  }

  private async processOnlinePayment() {
    console.log('[SubscriptionPayment] Processing online payment for plan:', this.selectedPlan);

    // Create payment order
    const paymentResponse = await firstValueFrom(
      this.api.post<any>('/payments', {
        amount: this.selectedPlan.price,
        currency: 'INR',
        paymentMethod: 'RAZORPAY',
        type: 'SUBSCRIPTION'
      })
    );

    console.log('[SubscriptionPayment] Payment order created:', paymentResponse);
    this.launchRazorpay(paymentResponse);
  }

  private launchRazorpay(paymentData: any) {
    if (typeof Razorpay === 'undefined') {
      this.errorMessage = 'Razorpay SDK not loaded. Please refresh and try again.';
      this.processing = false;
      return;
    }

    const amountPaise = Math.round(this.selectedPlan.price * 100);
    const options: RazorpayOptions = {
      key: 'rzp_test_RXfBZEH79up8IS',
      amount: amountPaise,
      currency: paymentData.currency || 'INR',
      name: 'TiffinApp',
      description: `${this.selectedPlan.name} Subscription`,
      order_id: paymentData.transactionId || paymentData.razorpayOrderId,
      handler: (response: any) => {
        console.log('[SubscriptionPayment] Payment successful:', response);
        this.createSubscriptionAfterPayment(response);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#2563eb'
      }
    };

    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', (response: any) => {
      console.error('[SubscriptionPayment] Payment failed:', response);
      this.errorMessage = 'Payment failed: ' + response.error.description;
      this.processing = false;
    });

    rzp.open();
  }

  private async createSubscriptionAfterPayment(razorpayResponse: any) {
    try {
      console.log('[SubscriptionPayment] Creating subscription after successful payment');
      
      // Map plan type to API format
      const planTypeMap: { [key: string]: SubscriptionPlanType } = {
        'daily': SubscriptionPlanType.DAILY,
        'weekly': SubscriptionPlanType.WEEKLY, 
        'monthly': SubscriptionPlanType.MONTHLY
      };

      const subscriptionData = {
        planType: planTypeMap[this.selectedPlan.type] || SubscriptionPlanType.MONTHLY,
        paymentId: razorpayResponse.razorpay_payment_id,
        paymentMethod: 'RAZORPAY',
        amount: this.selectedPlan.price
      };

      console.log('[SubscriptionPayment] Subscription data:', subscriptionData);
      
      const subscription = await firstValueFrom(
        this.subscriptionService.create(subscriptionData)
      );

      console.log('[SubscriptionPayment] ✓ Subscription created:', subscription);
      
      // Verify payment
      try {
        await firstValueFrom(this.api.post<any>('/payments/verify', {
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        }));
        console.log('[SubscriptionPayment] ✓ Payment verified');
      } catch (verifyError) {
        console.warn('[SubscriptionPayment] Payment verification failed, but subscription created:', verifyError);
      }

      // Clear session data
      this.clearSessionData();
      
      // Navigate to success page
      this.router.navigate(['/subscription/success'], {
        queryParams: { subscriptionId: subscription.id }
      });
      
    } catch (error: any) {
      console.error('[SubscriptionPayment] ✗ Subscription creation failed:', error);
      this.errorMessage = 'Subscription creation failed. Please contact support.';
      this.processing = false;
    }
  }

  private async processCODSubscription() {
    try {
      console.log('[SubscriptionPayment] Processing COD subscription for plan:', this.selectedPlan);

      // Map plan type to API format  
      const planTypeMap: { [key: string]: SubscriptionPlanType } = {
        'daily': SubscriptionPlanType.DAILY,
        'weekly': SubscriptionPlanType.WEEKLY,
        'monthly': SubscriptionPlanType.MONTHLY
      };

      const subscriptionData = {
        planType: planTypeMap[this.selectedPlan.type] || SubscriptionPlanType.MONTHLY,
        paymentMethod: 'COD',
        amount: this.selectedPlan.price
      };

      const subscription = await firstValueFrom(
        this.subscriptionService.create(subscriptionData)
      );

      console.log('[SubscriptionPayment] ✓ COD subscription created:', subscription);

      // Clear session data
      this.clearSessionData();
      
      // Navigate to success page
      this.router.navigate(['/subscription/success'], {
        queryParams: { subscriptionId: subscription.id }
      });

    } catch (error: any) {
      console.error('[SubscriptionPayment] ✗ COD subscription creation failed:', error);
      throw error;
    }
  }

  goBack() {
    this.router.navigate(['/subscription/checkout']);
  }

  private clearSessionData() {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('selectedSubscriptionPlan');
      sessionStorage.removeItem('subscriptionPaymentMethod');
    }
  }

  getButtonClass() {
    const baseClasses = 'w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    if (this.processing || !this.selectedPlan) {
      return `${baseClasses} bg-gray-400 text-white cursor-not-allowed`;
    }
    
    return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
  }
}