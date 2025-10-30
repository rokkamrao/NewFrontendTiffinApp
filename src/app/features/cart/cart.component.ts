import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { RouterModule, Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent{
  public cart = inject(CartService);
  private session = inject(SessionService);
  private router = inject(Router);

  proceedToCheckout() {
    const sessionState = this.session.getCurrentSession();
    
    if (!sessionState.isLoggedIn) {
      // User not logged in - redirect to login with return URL
      console.log('[Cart] User not logged in, redirecting to login');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/checkout' }
      });
      return;
    }
    
    // User is logged in, proceed to checkout
    this.router.navigate(['/checkout']);
  }
}
