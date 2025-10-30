import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface DeliveryStats {
  todayDeliveries: number;
  pendingPickups: number;
  inTransit: number;
  completed: number;
  earnings: number;
}

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="delivery-dashboard">
      <!-- Header -->
      <div class="bg-primary text-white p-3 shadow-sm">
        <div class="container">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
              <i class="bi bi-truck" style="font-size: 2rem;"></i>
              <div>
                <h5 class="mb-0">{{ deliveryPerson?.name }}</h5>
                <small>{{ deliveryPerson?.vehicleNumber }}</small>
              </div>
            </div>
            <button class="btn btn-light btn-sm" (click)="logout()">
              <i class="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </div>
      </div>

      <div class="container py-4">
        <!-- Stats Cards -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="bi bi-clock-history text-warning" style="font-size: 2rem;"></i>
                <h4 class="mt-2 mb-0">{{ stats.pendingPickups }}</h4>
                <small class="text-muted">Pending Pickup</small>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="bi bi-arrow-repeat text-info" style="font-size: 2rem;"></i>
                <h4 class="mt-2 mb-0">{{ stats.inTransit }}</h4>
                <small class="text-muted">In Transit</small>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="bi bi-check-circle text-success" style="font-size: 2rem;"></i>
                <h4 class="mt-2 mb-0">{{ stats.completed }}</h4>
                <small class="text-muted">Completed</small>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <i class="bi bi-currency-rupee text-primary" style="font-size: 2rem;"></i>
                <h4 class="mt-2 mb-0">₹{{ stats.earnings }}</h4>
                <small class="text-muted">Today's Earnings</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Rating -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-1">Your Rating</h6>
                <div class="d-flex align-items-center gap-2">
                  <span class="h4 mb-0">{{ deliveryPerson?.rating }}</span>
                  <div>
                    <i class="bi bi-star-fill text-warning"></i>
                    <i class="bi bi-star-fill text-warning"></i>
                    <i class="bi bi-star-fill text-warning"></i>
                    <i class="bi bi-star-fill text-warning"></i>
                    <i class="bi bi-star-half text-warning"></i>
                  </div>
                </div>
                <small class="text-muted">{{ deliveryPerson?.deliveriesCompleted }} deliveries completed</small>
              </div>
              <i class="bi bi-award text-warning" style="font-size: 3rem;"></i>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row g-3 mb-4">
          <div class="col-6">
            <a routerLink="/delivery/orders" class="card border-0 shadow-sm text-decoration-none h-100">
              <div class="card-body text-center p-4">
                <i class="bi bi-list-check text-primary" style="font-size: 3rem;"></i>
                <h6 class="mt-3 mb-0">View Orders</h6>
              </div>
            </a>
          </div>
          <div class="col-6">
            <button class="card border-0 shadow-sm text-decoration-none h-100 w-100 btn btn-outline-primary">
              <div class="card-body text-center p-4">
                <i class="bi bi-geo-alt-fill text-danger" style="font-size: 3rem;"></i>
                <h6 class="mt-3 mb-0">Navigate</h6>
              </div>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h6 class="mb-0">Recent Activity</h6>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div class="timeline-item mb-3">
                <div class="d-flex gap-3">
                  <div class="timeline-icon bg-success rounded-circle p-2">
                    <i class="bi bi-check text-white"></i>
                  </div>
                  <div>
                    <div class="fw-semibold">Delivered to Priya Sharma</div>
                    <small class="text-muted">Order #ORD-001 • 30 mins ago</small>
                  </div>
                </div>
              </div>
              <div class="timeline-item mb-3">
                <div class="d-flex gap-3">
                  <div class="timeline-icon bg-info rounded-circle p-2">
                    <i class="bi bi-arrow-repeat text-white"></i>
                  </div>
                  <div>
                    <div class="fw-semibold">Picked up from Kitchen</div>
                    <small class="text-muted">Order #ORD-002 • 1 hour ago</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class DeliveryDashboardComponent implements OnInit {
  deliveryPerson: any = null;
  stats: DeliveryStats = {
    todayDeliveries: 12,
    pendingPickups: 3,
    inTransit: 2,
    completed: 7,
    earnings: 840
  };

  constructor(private router: Router) {}

  ngOnInit() {
    const isLoggedIn = localStorage.getItem('deliveryLoggedIn');
    if (isLoggedIn !== 'true') {
      this.router.navigate(['/delivery/login']);
      return;
    }

    const personData = localStorage.getItem('deliveryPerson');
    if (personData) {
      this.deliveryPerson = JSON.parse(personData);
    }
  }

  logout() {
    localStorage.removeItem('deliveryLoggedIn');
    localStorage.removeItem('deliveryPerson');
    this.router.navigate(['/delivery/login']);
  }
}
