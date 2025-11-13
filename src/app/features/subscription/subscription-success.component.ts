import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-subscription-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-md mx-auto px-4">
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <!-- Success Icon -->
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Subscription Confirmed!</h1>
          <p class="text-gray-600 mb-6">Your subscription has been successfully activated. You'll start receiving your delicious meals soon!</p>
          
          <div *ngIf="subscriptionId" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p class="text-sm text-blue-800">
              <span class="font-medium">Subscription ID:</span> #{{ subscriptionId }}
            </p>
          </div>
          
          <!-- Next Steps -->
          <div class="text-left mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">What's Next?</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Check your email for subscription confirmation</span>
              </li>
              <li class="flex items-start">
                <span class="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Your first meal will be delivered according to your selected schedule</span>
              </li>
              <li class="flex items-start">
                <span class="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Manage your subscription anytime in your account</span>
              </li>
            </ul>
          </div>
          
          <!-- Action Buttons -->
          <div class="space-y-3">
            <button (click)="goToAccount()" 
                    class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              View My Subscriptions
            </button>
            
            <button (click)="goToHome()" 
                    class="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              Go to Dashboard
            </button>
          </div>
          
          <!-- Support Info -->
          <div class="mt-6 pt-6 border-t text-center">
            <p class="text-xs text-gray-500 mb-2">Need help with your subscription?</p>
            <button (click)="goToSupport()" 
                    class="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubscriptionSuccessComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  subscriptionId: string | null = null;

  ngOnInit() {
    // Get subscription ID from query params
    this.route.queryParams.subscribe(params => {
      this.subscriptionId = params['subscriptionId'];
    });
  }

  goToAccount() {
    this.router.navigate(['/account']);
  }

  goToHome() {
    this.router.navigate(['/user-dashboard']);
  }

  goToSupport() {
    this.router.navigate(['/support']);
  }
}