import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="container container-narrow">
        <div class="card shadow-sm">
          <div class="card-body text-center py-5">
            <!-- Success Icon -->
            <div class="mb-4">
              <div class="success-checkmark mx-auto" style="width: 80px; height: 80px;">
                <svg viewBox="0 0 52 52" class="checkmark">
                  <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>

            <h2 class="h3 fw-bold text-success mb-3">Payment Successful!</h2>
            <p class="text-muted mb-4">Your payment has been processed successfully.</p>

            <div *ngIf="!orderId" class="alert alert-info d-flex align-items-start gap-2" role="alert">
              <i class="bi bi-info-circle flex-shrink-0 mt-1"></i>
              <div class="text-start">
                <p class="mb-1 fw-medium">Order Creation Failed</p>
                <p class="mb-0 small">Your payment was successful, but we encountered an issue creating your order. Please contact our support team with your payment details.</p>
              </div>
            </div>

            <div *ngIf="orderId" class="alert alert-success d-flex align-items-start gap-2" role="alert">
              <i class="bi bi-check-circle flex-shrink-0 mt-1"></i>
              <div class="text-start">
                <p class="mb-1 fw-medium">Order Created Successfully!</p>
                <p class="mb-0 small">Your order has been placed and is being processed. You can track your order status.</p>
              </div>
            </div>

            <div *ngIf="paymentId" class="bg-light p-3 rounded mb-4">
              <p class="mb-1 small text-muted">Payment ID</p>
              <p class="mb-0 font-monospace small">{{ paymentId }}</p>
            </div>

            <div *ngIf="orderId" class="bg-light p-3 rounded mb-4">
              <p class="mb-1 small text-muted">Order ID</p>
              <p class="mb-0 font-monospace small">{{ orderId }}</p>
            </div>

            <div class="d-grid gap-2 mt-4">
              <a *ngIf="orderId" [routerLink]="['/tracking', orderId]" class="btn btn-primary">
                <i class="bi bi-geo-alt me-2"></i>Track Your Order
              </a>
              <a *ngIf="!orderId" routerLink="/support" class="btn btn-primary">
                <i class="bi bi-headset me-2"></i>Contact Support
              </a>
              <a routerLink="/home" class="btn btn-outline-secondary">
                <i class="bi bi-house me-2"></i>Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
  `]
})
export class PaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  paymentId?: string;
  orderId?: string;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['paymentId'];
      this.orderId = params['orderId'];
    });
  }
}
