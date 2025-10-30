import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { AdminService, Order, DeliveryPartner } from '../services/admin-real-api.service';

interface DeliveryTracking {
  orderId: string;
  customerName: string;
  deliveryPartner: DeliveryPartner;
  currentLocation: { lat: number; lng: number };
  estimatedTime: number;
  status: 'picked_up' | 'in_transit' | 'nearby' | 'delivered';
  route: { lat: number; lng: number }[];
  lastUpdate: Date;
}

@Component({
  selector: 'app-delivery-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="delivery-tracking">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Delivery Tracking</h1>
          <p class="page-subtitle">Real-time delivery monitoring and management</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-primary" (click)="refreshTracking()">
            <i class="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
          <button class="btn btn-primary" (click)="openMapView()">
            <i class="bi bi-map"></i>
            Map View
          </button>
        </div>
      </div>

      <!-- Delivery Stats -->
      <div class="delivery-stats">
        <div class="row g-3">
          <div class="col-lg-3 col-md-6">
            <div class="stat-card in-transit">
              <div class="stat-icon">
                <i class="bi bi-truck"></i>
              </div>
              <div class="stat-content">
                <h3>{{ deliveriesInTransit() }}</h3>
                <p>In Transit</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card nearby">
              <div class="stat-icon">
                <i class="bi bi-geo-alt"></i>
              </div>
              <div class="stat-content">
                <h3>{{ deliveriesNearby() }}</h3>
                <p>Nearby</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card delivered">
              <div class="stat-icon">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="stat-content">
                <h3>{{ deliveredToday() }}</h3>
                <p>Delivered Today</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card avg-time">
              <div class="stat-icon">
                <i class="bi bi-clock"></i>
              </div>
              <div class="stat-content">
                <h3>{{ averageDeliveryTime() }}min</h3>
                <p>Avg Delivery Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input type="text" 
                     class="form-control" 
                     placeholder="Search orders, customers..."
                     [(ngModel)]="searchTerm"
                     (input)="applyFilters()">
            </div>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="">All Status</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="nearby">Nearby</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="partnerFilter" (change)="applyFilters()">
              <option value="">All Partners</option>
              @for (partner of availablePartners(); track partner.id) {
                <option [value]="partner.id">{{ partner.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="areaFilter" (change)="applyFilters()">
              <option value="">All Areas</option>
              <option value="Koramangala">Koramangala</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="Whitefield">Whitefield</option>
              <option value="HSR Layout">HSR Layout</option>
            </select>
          </div>
          <div class="col-md-3">
            <div class="emergency-actions">
              <button class="btn btn-warning btn-sm" (click)="showSosAlerts()">
                <i class="bi bi-exclamation-triangle"></i>
                SOS Alerts ({{ sosAlerts() }})
              </button>
              <button class="btn btn-danger btn-sm" (click)="showDelayedDeliveries()">
                <i class="bi bi-clock-history"></i>
                Delayed ({{ delayedDeliveries() }})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Deliveries -->
      <div class="deliveries-section">
        <div class="section-header">
          <h5>Active Deliveries ({{ filteredDeliveries().length }})</h5>
          <div class="view-controls">
            <div class="btn-group" role="group">
              <button class="btn btn-sm" 
                      [class]="viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'"
                      (click)="viewMode = 'cards'">
                <i class="bi bi-grid"></i>
              </button>
              <button class="btn btn-sm" 
                      [class]="viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'"
                      (click)="viewMode = 'list'">
                <i class="bi bi-list"></i>
              </button>
            </div>
          </div>
        </div>

        @if (viewMode === 'cards') {
          <div class="deliveries-grid">
            @for (delivery of filteredDeliveries(); track delivery.orderId) {
              <div class="delivery-card" [class]="'status-' + delivery.status">
                <div class="card-header">
                  <div class="order-info">
                    <h6>Order #{{ delivery.orderId }}</h6>
                    <p>{{ delivery.customerName }}</p>
                  </div>
                  <div class="status-badge" [class]="'badge-' + delivery.status">
                    {{ getStatusDisplay(delivery.status) }}
                  </div>
                </div>

                <div class="card-body">
                  <div class="delivery-partner">
                    <div class="partner-avatar">
                      <img [src]="delivery.deliveryPartner.avatar || '/assets/images/default-avatar.jpg'" 
                           [alt]="delivery.deliveryPartner.name"
                           (error)="onImageError($event)">
                    </div>
                    <div class="partner-info">
                      <div class="partner-name">{{ delivery.deliveryPartner.name }}</div>
                      <div class="partner-contact">
                        <i class="bi bi-phone"></i>
                        {{ delivery.deliveryPartner.phone }}
                      </div>
                    </div>
                    <div class="partner-rating">
                      <i class="bi bi-star-fill"></i>
                      {{ delivery.deliveryPartner.rating }}
                    </div>
                  </div>

                  <div class="delivery-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width]="getProgressPercentage(delivery.status) + '%'"></div>
                    </div>
                    <div class="progress-steps">
                      <div class="step" [class.active]="delivery.status === 'picked_up' || isAfterStatus(delivery.status, 'picked_up')">
                        <i class="bi bi-box"></i>
                        <span>Picked Up</span>
                      </div>
                      <div class="step" [class.active]="delivery.status === 'in_transit' || isAfterStatus(delivery.status, 'in_transit')">
                        <i class="bi bi-truck"></i>
                        <span>In Transit</span>
                      </div>
                      <div class="step" [class.active]="delivery.status === 'nearby' || isAfterStatus(delivery.status, 'nearby')">
                        <i class="bi bi-geo-alt"></i>
                        <span>Nearby</span>
                      </div>
                      <div class="step" [class.active]="delivery.status === 'delivered'">
                        <i class="bi bi-check-circle"></i>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  <div class="delivery-details">
                    <div class="detail-item">
                      <i class="bi bi-clock"></i>
                      <span>ETA: {{ delivery.estimatedTime }} min</span>
                    </div>
                    <div class="detail-item">
                      <i class="bi bi-geo"></i>
                      <span>{{ getDistanceDisplay(delivery) }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="bi bi-arrow-clockwise"></i>
                      <span>{{ getLastUpdateTime(delivery.lastUpdate) }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-footer">
                  <button class="btn btn-sm btn-outline-primary" 
                          (click)="viewOnMap(delivery)">
                    <i class="bi bi-map"></i>
                    View on Map
                  </button>
                  <button class="btn btn-sm btn-outline-info" 
                          (click)="contactCustomer(delivery.orderId)">
                    <i class="bi bi-telephone"></i>
                    Contact
                  </button>
                  <button class="btn btn-sm btn-outline-warning" 
                          (click)="reportIssue(delivery.orderId)">
                    <i class="bi bi-exclamation-triangle"></i>
                    Issue
                  </button>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <i class="bi bi-truck display-1 text-muted"></i>
                <h5 class="mt-3">No active deliveries</h5>
                <p class="text-muted">All deliveries have been completed</p>
              </div>
            }
          </div>
        } @else {
          <div class="deliveries-table-container">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Delivery Partner</th>
                    <th>Status</th>
                    <th>ETA</th>
                    <th>Location</th>
                    <th>Last Update</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (delivery of filteredDeliveries(); track delivery.orderId) {
                    <tr [class]="'row-status-' + delivery.status">
                      <td>
                        <div class="order-cell">
                          <strong>#{{ delivery.orderId }}</strong>
                        </div>
                      </td>
                      <td>{{ delivery.customerName }}</td>
                      <td>
                        <div class="partner-cell">
                          <img [src]="delivery.deliveryPartner.avatar || '/assets/images/default-avatar.jpg'" 
                               [alt]="delivery.deliveryPartner.name"
                               class="partner-thumb"
                               (error)="onImageError($event)">
                          <div class="partner-details">
                            <div>{{ delivery.deliveryPartner.name }}</div>
                            <small>{{ delivery.deliveryPartner.phone }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="status-badge" [class]="'badge-' + delivery.status">
                          {{ getStatusDisplay(delivery.status) }}
                        </span>
                      </td>
                      <td>{{ delivery.estimatedTime }} min</td>
                      <td>{{ getDistanceDisplay(delivery) }}</td>
                      <td>{{ getLastUpdateTime(delivery.lastUpdate) }}</td>
                      <td>
                        <div class="action-buttons">
                          <button class="btn btn-sm btn-outline-primary" 
                                  (click)="viewOnMap(delivery)"
                                  title="View on Map">
                            <i class="bi bi-map"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-info" 
                                  (click)="contactCustomer(delivery.orderId)"
                                  title="Contact Customer">
                            <i class="bi bi-telephone"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" 
                                  (click)="reportIssue(delivery.orderId)"
                                  title="Report Issue">
                            <i class="bi bi-exclamation-triangle"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="text-center py-5">
                        <div class="empty-state">
                          <i class="bi bi-truck display-1 text-muted"></i>
                          <h5 class="mt-3">No active deliveries</h5>
                          <p class="text-muted">All deliveries have been completed</p>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class DeliveryTrackingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Data signals
  deliveries = signal<DeliveryTracking[]>([]);
  availablePartners = signal<DeliveryPartner[]>([]);
  
  // UI state
  viewMode: 'cards' | 'list' = 'cards';
  
  // Filters
  searchTerm = '';
  statusFilter = '';
  partnerFilter = '';
  areaFilter = '';
  
  // Computed properties
  filteredDeliveries = computed(() => {
    let filtered = this.deliveries();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(delivery => 
        delivery.orderId.toLowerCase().includes(term) ||
        delivery.customerName.toLowerCase().includes(term) ||
        delivery.deliveryPartner.name.toLowerCase().includes(term)
      );
    }
    
    if (this.statusFilter) {
      filtered = filtered.filter(delivery => delivery.status === this.statusFilter);
    }
    
    if (this.partnerFilter) {
      filtered = filtered.filter(delivery => delivery.deliveryPartner.id === this.partnerFilter);
    }
    
    return filtered;
  });
  
  deliveriesInTransit = computed(() => 
    this.deliveries().filter(d => d.status === 'in_transit').length
  );
  
  deliveriesNearby = computed(() => 
    this.deliveries().filter(d => d.status === 'nearby').length
  );
  
  deliveredToday = computed(() => 
    this.deliveries().filter(d => d.status === 'delivered').length
  );
  
  averageDeliveryTime = computed(() => {
    const delivered = this.deliveries().filter(d => d.status === 'delivered');
    if (delivered.length === 0) return 0;
    const avg = delivered.reduce((sum, d) => sum + (30 - d.estimatedTime), 0) / delivered.length;
    return Math.round(avg);
  });
  
  sosAlerts = computed(() => 0); // Mock data
  delayedDeliveries = computed(() => 
    this.deliveries().filter(d => d.estimatedTime > 45).length
  );

  ngOnInit() {
    this.loadDeliveryData();
    this.startRealTimeUpdates();
    
    // Check for specific order tracking
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.searchTerm = params['orderId'];
        this.applyFilters();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDeliveryData() {
    // Load active deliveries (mock implementation)
    const mockDeliveries: DeliveryTracking[] = [
      {
        orderId: 'ORD001',
        customerName: 'Rajesh Kumar',
        deliveryPartner: {
          id: 'DP001',
          name: 'Vijay Singh',
          phone: '+91 9876543210',
          rating: 4.8,
          avatar: '/assets/images/partner1.jpg',
          vehicle: { type: 'bike', number: 'KA01AB1234' },
          currentLocation: { lat: 12.9716, lng: 77.5946 },
          available: true,
          status: 'busy',
          zone: 'Zone A'
        },
        currentLocation: { lat: 12.9716, lng: 77.5946 },
        estimatedTime: 15,
        status: 'in_transit',
        route: [],
        lastUpdate: new Date()
      },
      {
        orderId: 'ORD002',
        customerName: 'Priya Sharma',
        deliveryPartner: {
          id: 'DP002',
          name: 'Amit Patel',
          phone: '+91 9876543211',
          rating: 4.6,
          avatar: '/assets/images/partner2.jpg',
          vehicle: { type: 'bike', number: 'KA02CD5678' },
          currentLocation: { lat: 12.9352, lng: 77.6245 },
          available: true,
          status: 'busy',
          zone: 'Zone B'
        },
        currentLocation: { lat: 12.9352, lng: 77.6245 },
        estimatedTime: 8,
        status: 'nearby',
        route: [],
        lastUpdate: new Date()
      }
    ];
    
    this.deliveries.set(mockDeliveries);
    
    // Extract unique partners
    const partners = mockDeliveries.map(d => d.deliveryPartner)
      .filter((partner, index, self) => 
        self.findIndex(p => p.id === partner.id) === index
      );
    this.availablePartners.set(partners);
  }

  private startRealTimeUpdates() {
    interval(30000) // Update every 30 seconds
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateDeliveryLocations();
      });
  }

  private updateDeliveryLocations() {
    // Simulate real-time location updates
    const deliveries = this.deliveries();
    const updatedDeliveries = deliveries.map(delivery => ({
      ...delivery,
      estimatedTime: Math.max(0, delivery.estimatedTime - 1),
      lastUpdate: new Date()
    }));
    
    this.deliveries.set(updatedDeliveries);
  }

  refreshTracking() {
    this.loadDeliveryData();
  }

  applyFilters() {
    // Filters are applied automatically via computed properties
  }

  openMapView() {
    this.router.navigate(['/admin/delivery/map']);
  }

  showSosAlerts() {
    // Navigate to SOS alerts view
    console.log('Showing SOS alerts');
  }

  showDelayedDeliveries() {
    // Filter to show only delayed deliveries
    this.statusFilter = '';
    this.searchTerm = '';
    // Apply custom filter for delayed deliveries
  }

  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      picked_up: 'Picked Up',
      in_transit: 'In Transit',
      nearby: 'Nearby',
      delivered: 'Delivered'
    };
    return statusMap[status] || status;
  }

  getProgressPercentage(status: string): number {
    const progressMap: { [key: string]: number } = {
      picked_up: 25,
      in_transit: 50,
      nearby: 75,
      delivered: 100
    };
    return progressMap[status] || 0;
  }

  isAfterStatus(currentStatus: string, checkStatus: string): boolean {
    const order = ['picked_up', 'in_transit', 'nearby', 'delivered'];
    return order.indexOf(currentStatus) > order.indexOf(checkStatus);
  }

  getDistanceDisplay(delivery: DeliveryTracking): string {
    // Mock distance calculation
    return `${Math.round(delivery.estimatedTime / 5)} km away`;
  }

  getLastUpdateTime(lastUpdate: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  viewOnMap(delivery: DeliveryTracking) {
    this.router.navigate(['/admin/delivery/map'], { 
      queryParams: { orderId: delivery.orderId } 
    });
  }

  contactCustomer(orderId: string) {
    // Implement customer contact functionality
    console.log('Contacting customer for order:', orderId);
  }

  reportIssue(orderId: string) {
    // Navigate to issue reporting
    this.router.navigate(['/admin/support/issues/new'], { 
      queryParams: { orderId } 
    });
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/default-avatar.jpg';
  }
}