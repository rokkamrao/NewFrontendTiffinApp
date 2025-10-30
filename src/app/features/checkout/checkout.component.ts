import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  public cart = inject(CartService);
  private os = inject(OrderService);
  private session = inject(SessionService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // Only check authentication in browser (not during SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if user is logged in
    const sessionState = this.session.getCurrentSession();
    
    if (!sessionState.isLoggedIn) {
      console.log('[Checkout] User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/checkout' }
      });
    }
  }

  proceedToPayment() {
    const sessionState = this.session.getCurrentSession();
    
    if (!sessionState.isLoggedIn) {
      // Double-check authentication before payment
      console.log('[Checkout] User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/checkout/payment' }
      });
      return;
    }
    
    // User is logged in, proceed to payment
    this.router.navigate(['/checkout/payment']);
  }

  clear() { 
    this.cart.clear(); 
  }
}
