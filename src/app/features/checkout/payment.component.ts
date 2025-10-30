import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { OrderService, CreateOrderRequest } from '../../core/services/order.service';
import { ApiService } from '../../core/services/api.service';
import { SessionService } from '../../core/services/session.service';
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
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {
  private cart = inject(CartService);
  private orderService = inject(OrderService);
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private session = inject(SessionService);

  processing = false;
  errorMessage = '';

  ngOnInit() {
    // Only check authentication in browser (not during SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if user is logged in before allowing payment
    const sessionState = this.session.getCurrentSession();
    
    if (!sessionState.isLoggedIn) {
      console.log('[Payment] User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/checkout/payment' }
      });
    }
  }

  async pay(method: string){
    console.log('[PaymentComponent] pay() - Payment method:', method);
    
    // Verify authentication before processing payment
    const sessionState = this.session.getCurrentSession();
    if (!sessionState.isLoggedIn) {
      console.warn('[PaymentComponent] User not authenticated');
      this.errorMessage = 'Please login to complete your order';
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/checkout/payment' }
      });
      return;
    }
    
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[PaymentComponent] Payment processing only available in browser');
      return;
    }

    this.processing = true;
    this.errorMessage = '';

    try {
      // Get cart items
      const cartItems: CartItem[] = await firstValueFrom(this.cart.items$);
      console.log('[PaymentComponent] Cart items:', cartItems);
      
      if (!cartItems || cartItems.length === 0) {
        this.errorMessage = 'Cart is empty';
        this.processing = false;
        console.warn('[PaymentComponent] Cart is empty');
        return;
      }

      // Calculate total
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.dish.price * item.qty), 0);
      console.log('[PaymentComponent] Total amount:', totalAmount);

      // Create order request (to be used after payment)
      const orderRequest: CreateOrderRequest = {
        items: cartItems.map(item => ({
          dishId: Number(item.dish.id) || 0,
          dishName: item.dish.name,
          quantity: item.qty,
          unitPrice: item.dish.price,
          totalPrice: item.dish.price * item.qty
        })),
        paymentMethod: (method && method.toLowerCase() === 'cod') ? 'COD' : 'UPI',
        deliveryAddressId: undefined
      };
      console.log('[PaymentComponent] Order request prepared:', orderRequest);

      if (method.toLowerCase() === 'razorpay' || method.toLowerCase() === 'online') {
        // For Razorpay: Create payment order first (not our order)
        console.log('[PaymentComponent] Creating Razorpay payment order...');
        const paymentResponse = await firstValueFrom(
          this.api.post<any>('/payments', {
            amount: totalAmount,
            currency: 'INR',
            paymentMethod: 'RAZORPAY'
          })
        );
        console.log('[PaymentComponent] Razorpay order created:', paymentResponse);
        
        // Launch Razorpay checkout
        this.launchRazorpay(paymentResponse, orderRequest, totalAmount);
      } else if (method.toLowerCase() === 'cod') {
        // For COD: Create order directly
        console.log('[PaymentComponent] Creating COD order...');
        const createdOrder = await firstValueFrom(this.orderService.create(orderRequest));
        console.log('[PaymentComponent] ✓ COD order created:', createdOrder);
        this.cart.clear();
        this.processing = false;
        this.router.navigate(['/orders', createdOrder.id]);
      }
    } catch (error: any) {
      console.error('[PaymentComponent] ✗ Payment initialization failed:', error);
      this.errorMessage = error.message || 'Payment failed';
      this.processing = false;
    }
  }

  private launchRazorpay(paymentData: any, orderRequest: CreateOrderRequest, totalAmount: number) {
    if (typeof Razorpay === 'undefined') {
      this.errorMessage = 'Razorpay SDK not loaded';
      this.processing = false;
      return;
    }

    const amountPaise = Math.round(totalAmount * 100);
    const options: RazorpayOptions = {
      key: 'rzp_test_RXfBZEH79up8IS',
      amount: amountPaise,
      currency: paymentData.currency || 'INR',
      name: 'TiffinApp',
      description: 'Order Payment',
      order_id: paymentData.transactionId || paymentData.razorpayOrderId,
      handler: (response: any) => {
        // Payment successful - now create our order with payment details
        this.createOrderAfterPayment(response, orderRequest);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#F37254'
      }
    };

    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', (response: any) => {
      console.error('[PaymentComponent] Payment failed:', response);
      this.errorMessage = 'Payment failed: ' + response.error.description;
      this.processing = false;
    });

    rzp.open();
  }

  private createOrderAfterPayment(razorpayResponse: any, orderRequest: CreateOrderRequest) {
    console.log('[PaymentComponent] Payment successful, creating order:', razorpayResponse);
    
    // Add payment details to order request
    const orderWithPayment = {
      ...orderRequest,
      paymentId: razorpayResponse.razorpay_payment_id
    };
    
    // Create order with payment details
    this.orderService.create(orderWithPayment).subscribe({
      next: (order) => {
        console.log('[PaymentComponent] ✓ Order created after payment:', order);
        
        // Verify payment on backend
        this.api.post<any>('/payments/verify', {
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        }).subscribe({
          next: (verificationResult) => {
            console.log('[PaymentComponent] ✓ Payment verified:', verificationResult);
            this.cart.clear();
            this.processing = false;
            // Navigate to order success page
            this.router.navigate(['/orders/success', order.id]);
          },
          error: (error) => {
            console.error('[PaymentComponent] ✗ Payment verification failed:', error);
            // Order created but verification failed - still navigate to success page
            this.cart.clear();
            this.processing = false;
            this.router.navigate(['/orders/success', order.id]);
          }
        });
      },
      error: (error) => {
        console.error('[PaymentComponent] ✗ Order creation failed after payment:', error);
        this.processing = false;
        // Navigate to payment success page with payment info
        this.router.navigate(['/checkout/payment-success'], {
          queryParams: {
            paymentId: razorpayResponse.razorpay_payment_id
          }
        });
      }
    });
  }
}
