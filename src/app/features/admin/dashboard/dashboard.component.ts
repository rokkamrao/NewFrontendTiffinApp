import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, interval, takeUntil, switchMap } from 'rxjs';
import { AdminService, AdminStats, RealtimeMetrics } from '../services/admin-real-api.service';

export interface OrderStatus {
  id: string;
  customerName: string;
  items: string[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  deliveryAddress: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-dashboard">
      <!-- Page Header -->
      <div class="dashboard-header mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1">Dashboard Overview</h1>
            <p class="text-muted mb-0">Real-time monitoring and management</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" (click)="refreshData()">
              <i class="bi bi-arrow-clockwise"></i>
              Refresh
            </button>
            <button class="btn btn-primary" (click)="toggleQuickActions()">
              <i class="bi bi-lightning"></i>
              Quick Actions
            </button>
          </div>
        </div>
        <div class="live-status mt-2">
          <span class="badge" [class]="'bg-' + getStatusColor()">
            <i class="bi bi-circle-fill me-1"></i>
            System {{ dashboardStats().systemHealth | titlecase }}
          </span>
          <small class="text-muted ms-2">Last updated: {{ lastUpdated() | date:'short' }}</small>
        </div>
      </div>

      <!-- Key Metrics Cards -->
      <div class="row g-3 mb-4">
        <div class="col-lg-3 col-md-6">
          <div class="card metric-card revenue-card clickable-card" (click)="navigateToRevenue()">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="metric-icon bg-success bg-opacity-10 text-success">
                  <i class="bi bi-currency-rupee"></i>
                </div>
                <div class="ms-3">
                  <h4 class="mb-0">₹{{ dashboardStats().todayRevenue | number:'1.0-0' }}</h4>
                  <p class="text-muted mb-0">Today's Revenue</p>
                  <small class="text-success">
                    <i class="bi bi-arrow-up"></i> +12.5%
                  </small>
                </div>
              </div>
              <div class="card-hover-indicator">
                <i class="bi bi-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="card metric-card orders-card clickable-card" (click)="navigateToOrders()">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="metric-icon bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-box-seam"></i>
                </div>
                <div class="ms-3">
                  <h4 class="mb-0">{{ dashboardStats().pendingOrders }}</h4>
                  <p class="text-muted mb-0">Pending Orders</p>
                  <small [class]="dashboardStats().pendingOrders > 50 ? 'text-danger' : 'text-success'">
                    {{ dashboardStats().pendingOrders > 50 ? 'High Volume' : 'Normal' }}
                  </small>
                </div>
              </div>
              <div class="card-hover-indicator">
                <i class="bi bi-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="card metric-card users-card clickable-card" (click)="navigateToUsers()">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="metric-icon bg-info bg-opacity-10 text-info">
                  <i class="bi bi-people"></i>
                </div>
                <div class="ms-3">
                  <h4 class="mb-0">{{ dashboardStats().totalUsers | number }}</h4>
                  <p class="text-muted mb-0">Total Users</p>
                  <small class="text-info">
                    {{ dashboardStats().activeSubscriptions }} active subs
                  </small>
                </div>
              </div>
              <div class="card-hover-indicator">
                <i class="bi bi-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="card metric-card delivery-card clickable-card" (click)="navigateToDeliveries()">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="metric-icon bg-warning bg-opacity-10 text-warning">
                  <i class="bi bi-truck"></i>
                </div>
                <div class="ms-3">
                  <h4 class="mb-0">{{ dashboardStats().deliveriesInProgress }}</h4>
                  <p class="text-muted mb-0">In Transit</p>
                  <small class="text-warning">
                    Avg: {{ realtimeMetrics().averageDeliveryTime }}min
                  </small>
                </div>
              </div>
              <div class="card-hover-indicator">
                <i class="bi bi-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Analytics -->
      <div class="row g-3 mb-4">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Order Flow Analytics</h5>
              <select class="form-select form-select-sm w-auto" [(ngModel)]="selectedTimeRange">
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
              </select>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <!-- Placeholder for Chart.js implementation -->
                <div class="chart-placeholder">
                  <div class="simulated-chart">
                    <div class="chart-bars d-flex align-items-end justify-content-around">
                      @for (bar of simulatedChartData; track $index) {
                        <div class="chart-bar bg-primary" [style.height.%]="bar.value"></div>
                      }
                    </div>
                    <div class="chart-info mt-2">
                      <small class="text-muted">Real-time order flow: {{ realtimeMetrics().ordersPerHour }} orders/hour</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">Performance Metrics</h5>
            </div>
            <div class="card-body">
              <div class="performance-metrics">
                <div class="metric-item mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="small">Kitchen Utilization</span>
                    <span class="small fw-bold">{{ realtimeMetrics().kitchenUtilization }}%</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-success" 
                         [style.width.%]="realtimeMetrics().kitchenUtilization">
                    </div>
                  </div>
                </div>

                <div class="metric-item mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="small">Delivery Efficiency</span>
                    <span class="small fw-bold">{{ realtimeMetrics().deliveryEfficiency }}%</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-info" 
                         [style.width.%]="realtimeMetrics().deliveryEfficiency">
                    </div>
                  </div>
                </div>

                <div class="metric-item mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="small">Customer Satisfaction</span>
                    <span class="small fw-bold">{{ realtimeMetrics().customerSatisfaction }}%</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-warning" 
                         [style.width.%]="realtimeMetrics().customerSatisfaction">
                    </div>
                  </div>
                </div>

                <div class="metric-item">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="small">Active Users</span>
                    <span class="small fw-bold">{{ realtimeMetrics().activeUsers }}</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-primary" 
                         [style.width.%]="(realtimeMetrics().activeUsers / dashboardStats().totalUsers) * 100">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Operations -->
      <div class="row g-3 mb-4">
        <div class="col-lg-7">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Active Orders</h5>
              <a href="/admin/orders" class="btn btn-sm btn-outline-primary">View All</a>
            </div>
            <div class="card-body">
              <div class="orders-list">
                @for (order of activeOrders(); track order.id) {
                  <div class="order-item d-flex justify-content-between align-items-center mb-2 p-3 rounded border">
                    <div class="order-info flex-grow-1">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <strong>{{ order.customerName }}</strong>
                        <select class="form-select form-select-sm w-auto status-select" 
                                [value]="order.status"
                                (change)="updateOrderStatus(order.id, $event)">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        @if (order.priority === 'high') {
                          <span class="badge bg-danger">High Priority</span>
                        }
                      </div>
                      <div class="small text-muted mb-1">
                        {{ order.items.slice(0, 2).join(', ') }}
                        @if (order.items.length > 2) {
                          <span> +{{ order.items.length - 2 }} more</span>
                        }
                      </div>
                      <div class="small text-muted">{{ order.deliveryAddress }}</div>
                    </div>
                    <div class="order-actions text-end d-flex flex-column align-items-end gap-1">
                      <div class="small fw-bold">ETA: {{ order.estimatedTime }}</div>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" (click)="viewOrderDetails(order.id)" title="View Details">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" (click)="trackOrder(order.id)" title="Track Order">
                          <i class="bi bi-geo-alt"></i>
                        </button>
                        <button class="btn btn-outline-info" (click)="printOrderReceipt(order.id)" title="Print Receipt">
                          <i class="bi bi-printer"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                }
                @if (activeOrders().length === 0) {
                  <div class="text-center text-muted py-4">
                    <i class="bi bi-check-circle display-4"></i>
                    <p class="mt-2">No active orders at the moment</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">System Alerts</h5>
              @if (systemAlerts().length > 0) {
                <span class="badge bg-danger">{{ systemAlerts().length }}</span>
              }
            </div>
            <div class="card-body">
              <div class="alerts-list">
                @for (alert of systemAlerts(); track alert.id) {
                  <div class="alert alert-{{ alert.type }} alert-dismissible fade show" role="alert">
                    <i [class]="getAlertIcon(alert.type)"></i>
                    <strong>{{ alert.title }}</strong>
                    <div class="small">{{ alert.message }}</div>
                    <button type="button" class="btn-close" (click)="dismissAlert(alert.id)"></button>
                  </div>
                }
                
                @if (systemAlerts().length === 0) {
                  <div class="text-center text-muted py-4">
                    <i class="bi bi-shield-check display-4 text-success"></i>
                    <p class="mt-2">All systems running smoothly!</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Panel -->
      @if (showQuickActions) {
        <div class="card quick-actions-card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Quick Actions</h5>
            <button class="btn btn-sm btn-outline-secondary" (click)="toggleQuickActions()">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="card-body">
            <div class="row g-2">
              <div class="col-md-2 col-4">
                <button class="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" 
                        (click)="navigateTo('/admin/images')">
                  <i class="bi bi-image display-6"></i>
                  <small class="mt-1">Images</small>
                </button>
              </div>
              <div class="col-md-2 col-4">
                <button class="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" 
                        (click)="navigateTo('/admin/menu/scheduling')">
                  <i class="bi bi-calendar-plus display-6"></i>
                  <small class="mt-1">Schedule Menu</small>
                </button>
              </div>
              <div class="col-md-2 col-4">
                <button class="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" 
                        (click)="navigateTo('/admin/delivery/routes')">
                  <i class="bi bi-map display-6"></i>
                  <small class="mt-1">Plan Routes</small>
                </button>
              </div>
              <div class="col-md-2 col-4">
                <button class="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" 
                        (click)="navigateTo('/admin/marketing/notifications')">
                  <i class="bi bi-megaphone display-6"></i>
                  <small class="mt-1">Send Alert</small>
                </button>
              </div>
              <div class="col-md-2 col-4">
                <button class="btn btn-outline-dark w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" 
                        (click)="navigateTo('/admin/analytics/reports')">
                  <i class="bi bi-graph-up display-6"></i>
                  <small class="mt-1">Reports</small>
                </button>
              </div>
              <div class="col-md-2 col-4">
                <button class="btn btn-outline-danger w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" 
                        (click)="navigateTo('/admin/inventory/stock-alerts')">
                  <i class="bi bi-exclamation-triangle display-6"></i>
                  <small class="mt-1">Stock Alerts</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 1rem;
    }
    
    .metric-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .clickable-card {
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    
    .clickable-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    
    .clickable-card .card-body {
      position: relative;
    }
    
    .card-hover-indicator {
      position: absolute;
      top: 10px;
      right: 10px;
      opacity: 0;
      transition: opacity 0.2s;
      color: #666;
    }
    
    .clickable-card:hover .card-hover-indicator {
      opacity: 1;
    }
    
    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .chart-placeholder {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    
    .chart-bars {
      height: 150px;
      width: 100%;
      gap: 4px;
    }
    
    .chart-bar {
      flex: 1;
      border-radius: 2px;
      transition: height 0.3s ease;
    }
    
    .order-item {
      transition: background-color 0.2s, border-color 0.2s;
      border: 1px solid #e9ecef !important;
    }
    
    .order-item:hover {
      background-color: rgba(0,0,0,0.02);
      border-color: #dee2e6 !important;
    }
    
    .status-select {
      min-width: 120px;
      border: 1px solid #dee2e6;
    }
    
    .status-select:focus {
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
    
    .performance-metrics .progress {
      background-color: rgba(0,0,0,0.1);
    }
    
    .quick-actions-card {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 600px;
      z-index: 1050;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }
    
    @media (max-width: 768px) {
      .quick-actions-card {
        position: relative;
        bottom: auto;
        right: auto;
        width: 100%;
        margin-top: 20px;
      }
    }
    
    .live-status .badge {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private adminService = inject(AdminService);

  // Reactive state
  dashboardStats = signal<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    deliveriesInProgress: 0,
    feedbackAlerts: 0,
    lowStockItems: 0,
    systemHealth: 'healthy'
  });

  realtimeMetrics = signal<RealtimeMetrics>({
    activeUsers: 0,
    ordersPerHour: 0,
    averageDeliveryTime: 0,
    customerSatisfaction: 0,
    kitchenUtilization: 0,
    deliveryEfficiency: 0,
    orderAccuracy: 0,
    revenueToday: 0,
    popularDishes: []
  });

  activeOrders = signal<OrderStatus[]>([
    {
      id: 'ORD-001',
      customerName: 'Priya Sharma',
      items: ['Dal Tadka', 'Jeera Rice', 'Roti'],
      status: 'preparing',
      estimatedTime: '15 min',
      priority: 'high',
      deliveryAddress: 'Koramangala, Bangalore'
    },
    {
      id: 'ORD-002',
      customerName: 'Raj Kumar',
      items: ['Paneer Butter Masala', 'Naan'],
      status: 'ready',
      estimatedTime: '5 min',
      priority: 'medium',
      deliveryAddress: 'Indiranagar, Bangalore'
    },
    {
      id: 'ORD-003',
      customerName: 'Anita Desai',
      items: ['Chole Bhature', 'Lassi'],
      status: 'dispatched',
      estimatedTime: '20 min',
      priority: 'low',
      deliveryAddress: 'Whitefield, Bangalore'
    }
  ]);

  systemAlerts = signal<any[]>([
    {
      id: 'alert-1',
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Rice inventory is running low (2kg remaining)',
      timestamp: new Date()
    },
    {
      id: 'alert-2',
      type: 'info',
      title: 'High Demand',
      message: 'Koramangala hub experiencing high order volume',
      timestamp: new Date()
    }
  ]);

  lastUpdated = signal<Date>(new Date());
  
  // UI state
  selectedTimeRange = '6h';
  showQuickActions = false;
  
  // Simulated chart data
  simulatedChartData = [
    { value: 65 }, { value: 80 }, { value: 45 }, 
    { value: 90 }, { value: 70 }, { value: 85 }
  ];

  ngOnInit() {
    this.loadDashboardData();
    this.startRealtimeUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData() {
    // Load dashboard stats from API
    this.adminService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.dashboardStats.set(stats);
      });

    // Load realtime metrics from API
    this.adminService.getRealtimeMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => {
        this.realtimeMetrics.set(metrics);
      });

    // Load active orders from API
    this.adminService.getActiveOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        const orderStatuses = orders.map(order => ({
          id: order.id,
          customerName: order.customerName,
          items: order.items.map(item => item.dishName),
          status: order.status,
          estimatedTime: this.calculateEstimatedTime(order.estimatedDeliveryTime),
          priority: order.priority,
          deliveryAddress: `${order.deliveryAddress.line1}, ${order.deliveryAddress.city}`
        }));
        this.activeOrders.set(orderStatuses);
      });
  }

  private startRealtimeUpdates() {
    // Real-time updates every 30 seconds
    interval(30000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.adminService.getRealtimeMetrics())
      )
      .subscribe(metrics => {
        this.realtimeMetrics.set(metrics);
        this.lastUpdated.set(new Date());
      });

    // Refresh stats every 2 minutes
    interval(120000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.adminService.refreshStats())
      )
      .subscribe(stats => {
        this.dashboardStats.set(stats);
      });
  }

  private calculateEstimatedTime(estimatedDeliveryTime: Date): string {
    const now = new Date();
    const diffMs = estimatedDeliveryTime.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Overdue';
    if (diffMins < 60) return `${diffMins} min`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  }

  refreshData() {
    this.lastUpdated.set(new Date());
    console.log('Refreshing dashboard data...');
    
    // Refresh all data from APIs
    this.adminService.refreshStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.dashboardStats.set(stats);
      });

    this.loadDashboardData();
  }

  toggleQuickActions() {
    this.showQuickActions = !this.showQuickActions;
  }

  navigateTo(route: string) {
    console.log('Navigating to:', route);
    this.showQuickActions = false;
    this.router.navigate([route]);
  }

  // Metric card navigation methods
  navigateToRevenue() {
    console.log('Navigating to revenue analytics');
    this.router.navigate(['/admin/analytics/revenue']);
  }

  navigateToOrders() {
    console.log('Navigating to orders management');
    this.router.navigate(['/admin/orders']);
  }

  navigateToUsers() {
    console.log('Navigating to user management');
    this.router.navigate(['/admin/users']);
  }

  navigateToDeliveries() {
    console.log('Navigating to delivery tracking');
    this.router.navigate(['/admin/delivery']);
  }

  viewOrderDetails(orderId: string) {
    console.log('Viewing order details for:', orderId);
    this.router.navigate(['/admin/orders', orderId]);
  }

  updateOrderStatus(orderId: string, event: any) {
    const newStatus = (event.target as HTMLSelectElement).value as any;
    console.log('Updating order status:', orderId, newStatus);
    
    // Update order status via API
    this.adminService.updateOrderStatus(orderId, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          console.log('Order status updated successfully');
          // Refresh the active orders list
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          // Could show a toast notification here
        }
      });
  }

  trackOrder(orderId: string) {
    console.log('Tracking order:', orderId);
    this.router.navigate(['/admin/delivery/tracking'], { queryParams: { orderId } });
  }

  printOrderReceipt(orderId: string) {
    console.log('Printing receipt for order:', orderId);
    // Implementation for printing order receipt
    // Could open a new window with printable receipt
    window.open(`/admin/orders/${orderId}/receipt`, '_blank');
  }

  dismissAlert(alertId: string) {
    const currentAlerts = this.systemAlerts();
    const updatedAlerts = currentAlerts.filter(alert => alert.id !== alertId);
    this.systemAlerts.set(updatedAlerts);
  }

  getStatusColor(status?: string): string {
    if (!status) {
      const health = this.dashboardStats().systemHealth;
      return health === 'healthy' ? 'success' : health === 'warning' ? 'warning' : 'danger';
    }
    
    const statusColors: { [key: string]: string } = {
      preparing: 'warning',
      ready: 'info',
      dispatched: 'primary',
      delivered: 'success'
    };
    return statusColors[status] || 'secondary';
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      error: 'bi bi-exclamation-circle',
      warning: 'bi bi-exclamation-triangle',
      info: 'bi bi-info-circle',
      success: 'bi bi-check-circle'
    };
    return icons[type] || 'bi bi-info-circle';
  }
}
