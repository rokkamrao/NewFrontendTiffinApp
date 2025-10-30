import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminService, Order, OrderStatus } from '../services/admin-real-api.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="order-management">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Order Management</h1>
          <p class="page-subtitle">Manage and track all customer orders</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-primary" (click)="refreshOrders()">
            <i class="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
          <button class="btn btn-primary" (click)="navigateToNewOrder()">
            <i class="bi bi-plus-lg"></i>
            New Order
          </button>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input type="text" 
                     class="form-control" 
                     placeholder="Search orders, customers..."
                     [(ngModel)]="searchTerm"
                     (input)="onSearchChange()">
            </div>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="hubFilter" (change)="applyFilters()">
              <option value="">All Hubs</option>
              <option value="Koramangala">Koramangala</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="Whitefield">Whitefield</option>
              <option value="HSR Layout">HSR Layout</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="priorityFilter" (change)="applyFilters()">
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" (click)="clearFilters()">
              <i class="bi bi-x-circle"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="row g-3">
          <div class="col-lg-3 col-md-6">
            <div class="summary-card pending">
              <div class="card-icon">
                <i class="bi bi-clock"></i>
              </div>
              <div class="card-content">
                <h3>{{ orderSummary().pending }}</h3>
                <p>Pending Orders</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="summary-card preparing">
              <div class="card-icon">
                <i class="bi bi-fire"></i>
              </div>
              <div class="card-content">
                <h3>{{ orderSummary().preparing }}</h3>
                <p>In Kitchen</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="summary-card dispatched">
              <div class="card-icon">
                <i class="bi bi-truck"></i>
              </div>
              <div class="card-content">
                <h3>{{ orderSummary().dispatched }}</h3>
                <p>Out for Delivery</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="summary-card delivered">
              <div class="card-icon">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="card-content">
                <h3>{{ orderSummary().delivered }}</h3>
                <p>Delivered Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="orders-table-container">
        <div class="table-header">
          <h5>Orders ({{ filteredOrders().length }})</h5>
          <div class="table-actions">
            <button class="btn btn-sm btn-outline-primary" (click)="exportOrders()">
              <i class="bi bi-download"></i>
              Export
            </button>
            <button class="btn btn-sm btn-primary" (click)="bulkActions()">
              <i class="bi bi-list-check"></i>
              Bulk Actions
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" 
                         [checked]="allSelected()" 
                         [indeterminate]="someSelected()"
                         (change)="toggleSelectAll($event)">
                </th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Hub</th>
                <th>Priority</th>
                <th>Delivery Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of paginatedOrders(); track order.id) {
                <tr [class]="'priority-' + order.priority">
                  <td>
                    <input type="checkbox" 
                           [checked]="selectedOrders().includes(order.id)"
                           (change)="toggleOrderSelection(order.id, $event)">
                  </td>
                  <td>
                    <div class="order-id">
                      <strong>{{ order.id }}</strong>
                      <small class="text-muted d-block">{{ order.createdAt | date:'short' }}</small>
                    </div>
                  </td>
                  <td>
                    <div class="customer-info">
                      <div class="customer-name">{{ order.customerName }}</div>
                      <div class="customer-phone">{{ order.customerPhone }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="order-items">
                      <div class="item-count">{{ order.items.length }} items</div>
                      <div class="item-preview">
                        {{ getItemPreview(order.items) }}
                        @if (order.items.length > 2) {
                          <span class="more-items">+{{ order.items.length - 2 }} more</span>
                        }
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="order-amount">
                      <strong>₹{{ order.totalAmount }}</strong>
                      <div class="payment-status">
                        <span class="badge" [class]="'bg-' + getPaymentStatusColor(order.paymentStatus)">
                          {{ order.paymentStatus | titlecase }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select class="form-select form-select-sm status-select" 
                            [value]="order.status"
                            (change)="updateOrderStatus(order.id, $event)"
                            [class]="'status-' + order.status">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <span class="hub-badge">{{ order.hub }}</span>
                  </td>
                  <td>
                    <span class="priority-badge" [class]="'priority-' + order.priority">
                      {{ order.priority | titlecase }}
                    </span>
                  </td>
                  <td>
                    <div class="delivery-time">
                      <div class="scheduled-time">
                        {{ order.scheduledTime | date:'short' }}
                      </div>
                      @if (order.estimatedDeliveryTime) {
                        <div class="estimated-time text-muted">
                          ETA: {{ order.estimatedDeliveryTime | date:'short' }}
                        </div>
                      }
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-outline-primary" 
                              (click)="viewOrderDetails(order.id)"
                              title="View Details">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-info" 
                              (click)="trackOrder(order.id)"
                              title="Track Order"
                              [disabled]="!canTrackOrder(order.status)">
                        <i class="bi bi-geo-alt"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-success" 
                              (click)="printOrder(order.id)"
                              title="Print">
                        <i class="bi bi-printer"></i>
                      </button>
                      <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary" 
                                data-bs-toggle="dropdown"
                                title="More Actions">
                          <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu">
                          <li><a class="dropdown-item" (click)="editOrder(order.id)">Edit Order</a></li>
                          <li><a class="dropdown-item" (click)="duplicateOrder(order.id)">Duplicate</a></li>
                          <li><a class="dropdown-item" (click)="refundOrder(order.id)">Refund</a></li>
                          <li><hr class="dropdown-divider"></li>
                          <li><a class="dropdown-item text-danger" (click)="cancelOrder(order.id)">Cancel Order</a></li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="text-center py-5">
                    <div class="empty-state">
                      <i class="bi bi-inbox display-1 text-muted"></i>
                      <h5 class="mt-3">No orders found</h5>
                      <p class="text-muted">Try adjusting your search or filter criteria</p>
                      <button class="btn btn-primary" (click)="clearFilters()">Clear Filters</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" *ngIf="filteredOrders().length > pageSize">
          <div class="pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to 
            {{ Math.min(currentPage * pageSize, filteredOrders().length) }} of 
            {{ filteredOrders().length }} orders
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" [class.disabled]="currentPage === 1">
                <button class="page-link" (click)="goToPage(currentPage - 1)">Previous</button>
              </li>
              @for (page of getVisiblePages(); track page) {
                <li class="page-item" [class.active]="page === currentPage">
                  <button class="page-link" (click)="goToPage(page)">{{ page }}</button>
                </li>
              }
              <li class="page-item" [class.disabled]="currentPage === totalPages()">
                <button class="page-link" (click)="goToPage(currentPage + 1)">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private adminService = inject(AdminService);
  private router = inject(Router);

  // Data signals
  orders = signal<Order[]>([]);
  selectedOrders = signal<string[]>([]);
  
  // Filter signals
  searchTerm = '';
  statusFilter = '';
  hubFilter = '';
  priorityFilter = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 20;
  
  // Computed properties
  filteredOrders = computed(() => {
    let filtered = this.orders();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.includes(term) ||
        order.items.some(item => item.dishName.toLowerCase().includes(term))
      );
    }
    
    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }
    
    if (this.hubFilter) {
      filtered = filtered.filter(order => order.hub === this.hubFilter);
    }
    
    if (this.priorityFilter) {
      filtered = filtered.filter(order => order.priority === this.priorityFilter);
    }
    
    return filtered;
  });
  
  totalPages = computed(() => Math.ceil(this.filteredOrders().length / this.pageSize));
  
  paginatedOrders = computed(() => {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredOrders().slice(start, end);
  });
  
  orderSummary = computed(() => {
    const orders = this.orders();
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length,
      dispatched: orders.filter(o => o.status === 'dispatched').length,
      delivered: orders.filter(o => o.status === 'delivered').length
    };
  });
  
  allSelected = computed(() => {
    const displayed = this.paginatedOrders();
    const selected = this.selectedOrders();
    return displayed.length > 0 && displayed.every(order => selected.includes(order.id));
  });
  
  someSelected = computed(() => {
    const displayed = this.paginatedOrders();
    const selected = this.selectedOrders();
    return selected.length > 0 && !this.allSelected() && 
           displayed.some(order => selected.includes(order.id));
  });

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrders() {
    this.adminService.getActiveOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        this.orders.set(orders);
      });
  }

  onSearchChange() {
    // Debounce search
    setTimeout(() => {
      this.currentPage = 1;
      // Trigger filter update
    }, 300);
  }

  applyFilters() {
    this.currentPage = 1;
    // Filters are applied automatically via computed properties
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.hubFilter = '';
    this.priorityFilter = '';
    this.currentPage = 1;
  }

  refreshOrders() {
    this.loadOrders();
  }

  navigateToNewOrder() {
    this.router.navigate(['/admin/orders/new']);
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    if (checked) {
      const displayedIds = this.paginatedOrders().map(order => order.id);
      this.selectedOrders.set([...this.selectedOrders(), ...displayedIds]);
    } else {
      const displayedIds = this.paginatedOrders().map(order => order.id);
      const filtered = this.selectedOrders().filter(id => !displayedIds.includes(id));
      this.selectedOrders.set(filtered);
    }
  }

  toggleOrderSelection(orderId: string, event: any) {
    const checked = event.target.checked;
    const selected = this.selectedOrders();
    
    if (checked) {
      this.selectedOrders.set([...selected, orderId]);
    } else {
      this.selectedOrders.set(selected.filter(id => id !== orderId));
    }
  }

  updateOrderStatus(orderId: string, event: any) {
    const newStatus = event.target.value as OrderStatus;
    this.adminService.updateOrderStatus(orderId, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Update local state
        const orders = this.orders();
        const updatedOrders = orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        this.orders.set(updatedOrders);
      });
  }

  viewOrderDetails(orderId: string) {
    this.router.navigate(['/admin/orders', orderId]);
  }

  trackOrder(orderId: string) {
    this.router.navigate(['/admin/delivery/tracking'], { queryParams: { orderId } });
  }

  printOrder(orderId: string) {
    // Implement print functionality
    console.log('Printing order:', orderId);
  }

  editOrder(orderId: string) {
    this.router.navigate(['/admin/orders', orderId, 'edit']);
  }

  duplicateOrder(orderId: string) {
    // Implement order duplication
    console.log('Duplicating order:', orderId);
  }

  refundOrder(orderId: string) {
    // Implement refund process
    console.log('Processing refund for order:', orderId);
  }

  cancelOrder(orderId: string) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.updateOrderStatus(orderId, { target: { value: 'cancelled' } } as any);
    }
  }

  exportOrders() {
    // Implement export functionality
    console.log('Exporting orders...');
  }

  bulkActions() {
    // Implement bulk actions
    console.log('Bulk actions for:', this.selectedOrders());
  }

  canTrackOrder(status: OrderStatus): boolean {
    return ['dispatched', 'ready'].includes(status);
  }

  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      paid: 'success',
      pending: 'warning',
      failed: 'danger',
      refunded: 'info'
    };
    return colors[status] || 'secondary';
  }

  getItemPreview(items: any[]): string {
    return items.slice(0, 2).map(item => item.dishName).join(', ');
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage;
    const visible = [];
    
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    
    for (let i = start; i <= end; i++) {
      visible.push(i);
    }
    
    return visible;
  }

  // Expose Math for template
  Math = Math;
}