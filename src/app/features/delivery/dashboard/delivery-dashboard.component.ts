import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeliveryService } from '../services/delivery.service';
import { DeliveryPartner } from '../models/delivery-partner.model';
import { DeliveryStats, Delivery } from '../models/delivery.model';

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
                <h5 class="mb-0">{{ deliveryPartner?.name || 'Loading...' }}</h5>
                <small>{{ deliveryPartner?.vehicleNumber || '' }}</small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <!-- Online/Offline Toggle -->
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="onlineSwitch"
                  [checked]="deliveryPartner?.isOnline || false"
                  (change)="toggleOnlineStatus($event)"
                  [disabled]="isTogglingOnline">
                <label class="form-check-label text-white" for="onlineSwitch">
                  {{ deliveryPartner?.isOnline ? 'Online' : 'Offline' }}
                </label>
              </div>
              
              <button class="btn btn-light btn-sm" (click)="logout()">
                <i class="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container py-4">
        <!-- Loading State -->
        @if (isLoading) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading dashboard...</p>
          </div>
        }

        <!-- Error State -->
        @if (error && !isLoading) {
          <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
            <button class="btn btn-sm btn-outline-danger ms-2" (click)="loadDashboardData()">
              <i class="bi bi-arrow-clockwise me-1"></i>Retry
            </button>
          </div>
        }

        <!-- Dashboard Content -->
        @if (!isLoading && !error) {
          <!-- Stats Cards -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body text-center">
                  <i class="bi bi-clock-history text-warning" style="font-size: 2rem;"></i>
                  <h4 class="mt-2 mb-0">{{ stats?.pendingPickups || 0 }}</h4>
                  <small class="text-muted">Pending Pickup</small>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body text-center">
                  <i class="bi bi-arrow-repeat text-info" style="font-size: 2rem;"></i>
                  <h4 class="mt-2 mb-0">{{ stats?.inTransit || 0 }}</h4>
                  <small class="text-muted">In Transit</small>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body text-center">
                  <i class="bi bi-check-circle text-success" style="font-size: 2rem;"></i>
                  <h4 class="mt-2 mb-0">{{ stats?.completed || 0 }}</h4>
                  <small class="text-muted">Completed</small>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body text-center">
                  <i class="bi bi-currency-rupee text-primary" style="font-size: 2rem;"></i>
                  <h4 class="mt-2 mb-0">₹{{ stats?.todayEarnings || 0 }}</h4>
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
                    <span class="h4 mb-0">{{ deliveryPartner?.rating || 0 }}</span>
                    <div>
                      @for (star of getStarArray(deliveryPartner?.rating || 0); track $index) {
                        <i [class]="star.class" class="text-warning"></i>
                      }
                    </div>
                  </div>
                  <small class="text-muted">{{ deliveryPartner?.totalDeliveries || 0 }} deliveries completed</small>
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
                  @if (activeDeliveries.length > 0) {
                    <small class="text-danger">{{ activeDeliveries.length }} active</small>
                  }
                </div>
              </a>
            </div>
            <div class="col-6">
              <button 
                class="card border-0 shadow-sm text-decoration-none h-100 w-100 btn btn-outline-primary"
                (click)="openNavigationApp()">
                <div class="card-body text-center p-4">
                  <i class="bi bi-geo-alt-fill text-danger" style="font-size: 3rem;"></i>
                  <h6 class="mt-3 mb-0">Navigate</h6>
                </div>
              </button>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Recent Activity</h6>
              <button class="btn btn-sm btn-outline-primary" (click)="loadDashboardData()">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div class="card-body">
              @if (recentDeliveries.length === 0) {
                <div class="text-center py-4 text-muted">
                  <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                  <p class="mt-2">No recent activity</p>
                </div>
              } @else {
                <div class="timeline">
                  @for (delivery of recentDeliveries.slice(0, 5); track delivery.id) {
                    <div class="timeline-item mb-3">
                      <div class="d-flex gap-3">
                        <div class="timeline-icon rounded-circle p-2" [class]="getStatusIconClass(delivery.status)">
                          <i [class]="getStatusIcon(delivery.status)" class="text-white"></i>
                        </div>
                        <div>
                          <div class="fw-semibold">{{ getStatusText(delivery.status) }}</div>
                          <small class="text-muted">
                            Order #{{ delivery.orderId }} • {{ getTimeAgo(delivery.createdAt) }}
                            @if (delivery.customerName) {
                              • {{ delivery.customerName }}
                            }
                          </small>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
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
    
    .form-check-input:checked {
      background-color: #28a745;
      border-color: #28a745;
    }
    
    .form-check-label {
      cursor: pointer;
    }
    
    .btn:disabled {
      opacity: 0.6;
    }
  `]
})
export class DeliveryDashboardComponent implements OnInit, OnDestroy {
  deliveryPartner: DeliveryPartner | null = null;
  stats: DeliveryStats | null = null;
  recentDeliveries: Delivery[] = [];
  activeDeliveries: Delivery[] = [];
  
  isLoading = true;
  error = '';
  isTogglingOnline = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.deliveryService.isLoggedIn()) {
      this.router.navigate(['/delivery/login']);
      return;
    }

    // Subscribe to current partner
    this.deliveryService.currentPartner$
      .pipe(takeUntil(this.destroy$))
      .subscribe(partner => {
        this.deliveryPartner = partner;
      });

    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    const partnerId = this.deliveryService.getPartnerId();
    if (!partnerId) {
      this.error = 'Partner not found';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = '';

    // Load stats
    this.deliveryService.getPartnerStats(partnerId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.error = 'Failed to load dashboard data';
        this.isLoading = false;
      }
    });

    // Load recent deliveries
    this.deliveryService.getPartnerDeliveries(partnerId).subscribe({
      next: (deliveries) => {
        this.recentDeliveries = deliveries;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading deliveries:', error);
        this.error = 'Failed to load deliveries';
        this.isLoading = false;
      }
    });

    // Load active deliveries
    this.deliveryService.getActiveDeliveries(partnerId).subscribe({
      next: (deliveries) => {
        this.activeDeliveries = deliveries;
      },
      error: (error) => {
        console.error('Error loading active deliveries:', error);
      }
    });
  }

  toggleOnlineStatus(event: any): void {
    const partnerId = this.deliveryService.getPartnerId();
    if (!partnerId) return;

    const isOnline = event.target.checked;
    this.isTogglingOnline = true;

    this.deliveryService.updateOnlineStatus(partnerId, isOnline).subscribe({
      next: (partner) => {
        this.deliveryPartner = partner;
        this.isTogglingOnline = false;
        console.log('Online status updated:', isOnline);
      },
      error: (error) => {
        console.error('Error updating online status:', error);
        this.isTogglingOnline = false;
        // Revert the toggle
        event.target.checked = !isOnline;
      }
    });
  }

  openNavigationApp(): void {
    // This would open Google Maps or other navigation app
    // For now, we'll just show an alert
    if (this.activeDeliveries.length > 0) {
      const delivery = this.activeDeliveries[0];
      const destination = `${delivery.deliveryLatitude},${delivery.deliveryLongitude}`;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
      if (typeof window !== 'undefined') {
        window.open(googleMapsUrl, '_blank');
      }
    } else {
      alert('No active deliveries to navigate to');
    }
  }

  logout(): void {
    this.deliveryService.logout();
    this.router.navigate(['/delivery/login']);
  }

  getStarArray(rating: number): Array<{class: string}> {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push({ class: 'bi bi-star-fill' });
    }
    
    if (hasHalfStar) {
      stars.push({ class: 'bi bi-star-half' });
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push({ class: 'bi bi-star' });
    }

    return stars;
  }

  getStatusIconClass(status: string): string {
    switch (status) {
      case 'DELIVERED': return 'bg-success';
      case 'IN_TRANSIT': return 'bg-info';
      case 'PICKED_UP': return 'bg-warning';
      case 'ACCEPTED': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'DELIVERED': return 'bi bi-check';
      case 'IN_TRANSIT': return 'bi bi-arrow-repeat';
      case 'PICKED_UP': return 'bi bi-box';
      case 'ACCEPTED': return 'bi bi-hand-thumbs-up';
      default: return 'bi bi-clock';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'DELIVERED': return 'Delivered Successfully';
      case 'IN_TRANSIT': return 'On the way to customer';
      case 'PICKED_UP': return 'Picked up from restaurant';
      case 'ACCEPTED': return 'Order accepted';
      case 'ASSIGNED': return 'New order assigned';
      default: return status;
    }
  }

  getTimeAgo(dateString?: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
}
