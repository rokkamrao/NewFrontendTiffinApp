import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-vh-100 bg-light py-4">
      <div class="container container-narrow">
        <!-- Success Header -->
        <div class="card shadow-sm mb-3">
          <div class="card-body text-center py-5">
            <!-- Success Animation -->
            <div class="mb-4">
              <div class="success-checkmark mx-auto" style="width: 80px; height: 80px;">
                <svg viewBox="0 0 52 52" class="checkmark">
                  <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>

            <h1 class="h3 fw-bold text-success mb-2">Order Placed Successfully!</h1>
            <p class="text-muted mb-0">Thank you for your order. We'll start preparing it right away.</p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="card shadow-sm">
          <div class="card-body text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mb-0">Loading order details...</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="card shadow-sm">
          <div class="card-body">
            <div class="alert alert-danger mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ error }}
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div *ngIf="order && !loading" class="card shadow-sm mb-3">
          <div class="card-header bg-white">
            <h5 class="mb-0">Order Summary</h5>
          </div>
          <div class="card-body">
            <!-- Order Info -->
            <div class="row g-3 mb-4">
              <div class="col-6">
                <p class="text-muted small mb-1">Order ID</p>
                <p class="fw-medium mb-0">#{{ order.id }}</p>
              </div>
              <div class="col-6">
                <p class="text-muted small mb-1">Order Time</p>
                <p class="fw-medium mb-0">{{ order.orderTime ? formatDate(order.orderTime) : 'N/A' }}</p>
              </div>
              <div class="col-6">
                <p class="text-muted small mb-1">Status</p>
                <span class="badge" [ngClass]="getStatusClass(order.status || 'PENDING')">
                  {{ order.status || 'PENDING' }}
                </span>
              </div>
              <div class="col-6">
                <p class="text-muted small mb-1">Payment Method</p>
                <p class="fw-medium mb-0">{{ order.paymentMethod }}</p>
              </div>
            </div>

            <!-- Order Items -->
            <div class="mb-4">
              <h6 class="mb-3">Items Ordered</h6>
              <div class="list-group list-group-flush">
                <div *ngFor="let item of order.items" class="list-group-item px-0">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="mb-1">{{ item.dishName }}</h6>
                      <p class="text-muted small mb-0">
                        ₹{{ item.unitPrice }} × {{ item.quantity }}
                      </p>
                    </div>
                    <div class="text-end">
                      <p class="fw-medium mb-0">₹{{ item.totalPrice }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Delivery Info -->
            <div *ngIf="order.deliveryTime" class="alert alert-info mb-4">
              <i class="bi bi-clock me-2"></i>
              <strong>Estimated Delivery:</strong> {{ formatDate(order.deliveryTime) }}
            </div>

            <div *ngIf="order.specialInstructions" class="mb-4">
              <h6 class="mb-2">Special Instructions</h6>
              <p class="text-muted mb-0">{{ order.specialInstructions }}</p>
            </div>

            <!-- Total -->
            <div class="border-top pt-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Total Amount</h5>
                <h4 class="mb-0 text-primary">₹{{ order.totalAmount }}</h4>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div *ngIf="order && order.paymentId" class="card shadow-sm mb-3">
          <div class="card-body">
            <h6 class="mb-3">Payment Information</h6>
            <div class="row g-3">
              <div class="col-12">
                <p class="text-muted small mb-1">Payment ID</p>
                <p class="font-monospace small mb-0">{{ order.paymentId }}</p>
              </div>
              <div class="col-6">
                <p class="text-muted small mb-1">Payment Status</p>
                <span class="badge" [ngClass]="getPaymentStatusClass(order.paymentStatus || 'PENDING')">
                  {{ order.paymentStatus || 'PENDING' }}
                </span>
              </div>
              <div class="col-6">
                <p class="text-muted small mb-1">Amount Paid</p>
                <p class="fw-medium mb-0">₹{{ order.totalAmount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-grid gap-2">
          <button (click)="trackOrder()" class="btn btn-primary btn-lg">
            <i class="bi bi-geo-alt me-2"></i>Track Your Order
          </button>
          <a routerLink="/orders" class="btn btn-outline-secondary">
            <i class="bi bi-list-ul me-2"></i>View All Orders
          </a>
          <a routerLink="/home" class="btn btn-outline-secondary">
            <i class="bi bi-house me-2"></i>Back to Home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-narrow {
      max-width: 600px;
    }

    .success-checkmark {
      margin: 0 auto;
    }

    .checkmark {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: block;
      stroke-width: 2;
      stroke: #22c55e;
      stroke-miterlimit: 10;
      animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
    }

    .checkmark-circle {
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 2;
      stroke-miterlimit: 10;
      stroke: #22c55e;
      fill: none;
      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark-check {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    @keyframes stroke {
      100% {
        stroke-dashoffset: 0;
      }
    }

    @keyframes scale {
      0%, 100% {
        transform: none;
      }
      50% {
        transform: scale3d(1.1, 1.1, 1);
      }
    }

    @keyframes fill {
      100% {
        box-shadow: inset 0px 0px 0px 30px #22c55e;
      }
    }

    .list-group-item {
      border: none;
      border-bottom: 1px solid rgba(0,0,0,.125);
    }

    .list-group-item:last-child {
      border-bottom: none;
    }
  `]
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  order?: Order;
  loading = true;
  error = '';

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.error = 'No order ID provided';
      this.loading = false;
      return;
    }

    // Fetch order details
    this.orderService.get(Number(orderId)).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load order:', err);
        this.error = 'Failed to load order details. Please try again.';
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'bg-warning text-dark',
      'CONFIRMED': 'bg-info text-white',
      'PREPARING': 'bg-primary text-white',
      'OUT_FOR_DELIVERY': 'bg-success text-white',
      'DELIVERED': 'bg-success text-white',
      'CANCELLED': 'bg-danger text-white'
    };
    return statusMap[status] || 'bg-secondary text-white';
  }

  getPaymentStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'bg-warning text-dark',
      'COMPLETED': 'bg-success text-white',
      'FAILED': 'bg-danger text-white',
      'REFUNDED': 'bg-info text-white'
    };
    return statusMap[status] || 'bg-secondary text-white';
  }

  trackOrder() {
    if (this.order) {
      this.router.navigate(['/tracking', this.order.id]);
    }
  }
}
