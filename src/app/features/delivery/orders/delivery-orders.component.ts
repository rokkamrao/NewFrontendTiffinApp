import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: string[];
  itemCount: number;
  totalAmount: number;
  status: 'pending_pickup' | 'picked_up' | 'in_transit' | 'delivered';
  address: {
    line1: string;
    line2: string;
    city: string;
    landmark: string;
    lat: number;
    lng: number;
  };
  pickupTime: string;
  deliveryTime: string;
  distance: string;
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-delivery-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="delivery-orders">
      <!-- Header -->
      <div class="bg-primary text-white p-3 shadow-sm">
        <div class="container">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-light btn-sm" routerLink="/delivery/dashboard">
              <i class="bi bi-arrow-left"></i>
            </button>
            <div>
              <h5 class="mb-0">My Deliveries</h5>
              <small>{{ orders.length }} orders today</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white border-bottom">
        <div class="container">
          <div class="btn-group w-100" role="group">
            <button 
              class="btn btn-sm py-3"
              [class.btn-primary]="activeTab === 'pending'"
              [class.btn-outline-primary]="activeTab !== 'pending'"
              (click)="activeTab = 'pending'">
              Pending ({{ getPendingCount() }})
            </button>
            <button 
              class="btn btn-sm py-3"
              [class.btn-primary]="activeTab === 'active'"
              [class.btn-outline-primary]="activeTab !== 'active'"
              (click)="activeTab = 'active'">
              Active ({{ getActiveCount() }})
            </button>
            <button 
              class="btn btn-sm py-3"
              [class.btn-primary]="activeTab === 'completed'"
              [class.btn-outline-primary]="activeTab !== 'completed'"
              (click)="activeTab = 'completed'">
              Completed ({{ getCompletedCount() }})
            </button>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div class="container py-3">
        <div *ngFor="let order of getFilteredOrders()" class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <!-- Order Header -->
            <div class="d-flex align-items-start justify-content-between mb-3">
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <h6 class="mb-0">{{ order.orderNumber }}</h6>
                  <span class="badge" [class]="'bg-' + getStatusColor(order.status)">
                    {{ getStatusText(order.status) }}
                  </span>
                  <span *ngIf="order.priority === 'high'" class="badge bg-danger">
                    <i class="bi bi-lightning-fill"></i> Urgent
                  </span>
                </div>
                <small class="text-muted">
                  <i class="bi bi-clock me-1"></i>
                  Delivery by {{ order.deliveryTime }}
                </small>
              </div>
              <div class="text-end">
                <div class="fw-bold text-primary">₹{{ order.totalAmount }}</div>
                <small class="text-muted">{{ order.distance }}</small>
              </div>
            </div>

            <!-- Customer Info -->
            <div class="mb-3 pb-3 border-bottom">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-person-circle text-muted"></i>
                <strong>{{ order.customerName }}</strong>
              </div>
              <div class="d-flex align-items-start gap-2 mb-2">
                <i class="bi bi-geo-alt-fill text-danger"></i>
                <small>
                  {{ order.address.line1 }}, {{ order.address.line2 }}<br>
                  {{ order.address.landmark }}, {{ order.address.city }}
                </small>
              </div>
              <a href="tel:{{ order.customerPhone }}" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-telephone-fill me-1"></i>
                Call Customer
              </a>
            </div>

            <!-- Items -->
            <div class="mb-3">
              <small class="text-muted fw-semibold">Items ({{ order.itemCount }})</small>
              <div class="mt-1">
                <small>{{ order.items.join(', ') }}</small>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex gap-2">
              <button 
                class="btn btn-sm btn-outline-primary flex-grow-1"
                (click)="openMaps(order)">
                <i class="bi bi-map me-1"></i>
                Navigate
              </button>
              <button 
                class="btn btn-sm flex-grow-1"
                [class.btn-success]="order.status === 'pending_pickup'"
                [class.btn-warning]="order.status === 'picked_up'"
                [class.btn-primary]="order.status === 'in_transit'"
                [disabled]="order.status === 'delivered'"
                (click)="updateStatus(order)">
                <i [class]="getActionIcon(order.status)"></i>
                {{ getActionText(order.status) }}
              </button>
              <button 
                class="btn btn-sm btn-outline-secondary"
                [routerLink]="['/delivery/order', order.id]">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="getFilteredOrders().length === 0" class="text-center py-5">
          <i class="bi bi-inbox text-muted" style="font-size: 4rem;"></i>
          <p class="text-muted mt-3">No {{ activeTab }} orders</p>
        </div>
      </div>
    </div>
  `
})
export class DeliveryOrdersComponent implements OnInit {
  activeTab: 'pending' | 'active' | 'completed' = 'pending';
  orders: DeliveryOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-101',
      customerName: 'Priya Sharma',
      customerPhone: '+919876543210',
      items: ['Paneer Butter Masala', 'Dal Tadka', 'Roti (4)', 'Jeera Rice'],
      itemCount: 4,
      totalAmount: 350,
      status: 'pending_pickup',
      address: {
        line1: 'Flat 302, Green Valley Apartments',
        line2: '5th Main Road, Koramangala',
        city: 'Bangalore - 560034',
        landmark: 'Near Forum Mall',
        lat: 12.9352,
        lng: 77.6245
      },
      pickupTime: '12:30 PM',
      deliveryTime: '1:00 PM',
      distance: '3.5 km',
      priority: 'high'
    },
    {
      id: '2',
      orderNumber: 'ORD-102',
      customerName: 'Raj Kumar',
      customerPhone: '+919876543211',
      items: ['Biryani', 'Raita', 'Salad'],
      itemCount: 3,
      totalAmount: 280,
      status: 'picked_up',
      address: {
        line1: 'House No. 45, 2nd Floor',
        line2: 'Indiranagar 1st Stage',
        city: 'Bangalore - 560038',
        landmark: 'Opposite 100 Feet Road',
        lat: 12.9716,
        lng: 77.6412
      },
      pickupTime: '12:45 PM',
      deliveryTime: '1:15 PM',
      distance: '2.8 km',
      priority: 'medium'
    },
    {
      id: '3',
      orderNumber: 'ORD-103',
      customerName: 'Anita Desai',
      customerPhone: '+919876543212',
      items: ['Chole Bhature', 'Lassi'],
      itemCount: 2,
      totalAmount: 180,
      status: 'in_transit',
      address: {
        line1: 'Plot 12, Prestige Apartments',
        line2: 'Whitefield Main Road',
        city: 'Bangalore - 560066',
        landmark: 'Near ITPL',
        lat: 12.9698,
        lng: 77.7500
      },
      pickupTime: '1:00 PM',
      deliveryTime: '1:30 PM',
      distance: '8.2 km',
      priority: 'low'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    const isLoggedIn = localStorage.getItem('deliveryLoggedIn');
    if (isLoggedIn !== 'true') {
      this.router.navigate(['/delivery/login']);
    }
  }

  getFilteredOrders(): DeliveryOrder[] {
    if (this.activeTab === 'pending') {
      return this.orders.filter(o => o.status === 'pending_pickup');
    } else if (this.activeTab === 'active') {
      return this.orders.filter(o => o.status === 'picked_up' || o.status === 'in_transit');
    } else {
      return this.orders.filter(o => o.status === 'delivered');
    }
  }

  getPendingCount(): number {
    return this.orders.filter(o => o.status === 'pending_pickup').length;
  }

  getActiveCount(): number {
    return this.orders.filter(o => o.status === 'picked_up' || o.status === 'in_transit').length;
  }

  getCompletedCount(): number {
    return this.orders.filter(o => o.status === 'delivered').length;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'pending_pickup': 'warning',
      'picked_up': 'info',
      'in_transit': 'primary',
      'delivered': 'success'
    };
    return colors[status] || 'secondary';
  }

  getStatusText(status: string): string {
    const texts: any = {
      'pending_pickup': 'Pending Pickup',
      'picked_up': 'Picked Up',
      'in_transit': 'In Transit',
      'delivered': 'Delivered'
    };
    return texts[status] || status;
  }

  getActionText(status: string): string {
    const texts: any = {
      'pending_pickup': 'Mark Picked Up',
      'picked_up': 'Start Delivery',
      'in_transit': 'Mark Delivered',
      'delivered': 'Delivered'
    };
    return texts[status] || 'Update';
  }

  getActionIcon(status: string): string {
    const icons: any = {
      'pending_pickup': 'bi bi-box-seam me-1',
      'picked_up': 'bi bi-truck me-1',
      'in_transit': 'bi bi-check-circle me-1',
      'delivered': 'bi bi-check-circle-fill me-1'
    };
    return icons[status] || 'bi bi-arrow-right me-1';
  }

  updateStatus(order: DeliveryOrder) {
    if (order.status === 'pending_pickup') {
      order.status = 'picked_up';
      this.captureLocation('pickup', order.id);
    } else if (order.status === 'picked_up') {
      order.status = 'in_transit';
      this.captureLocation('start_delivery', order.id);
    } else if (order.status === 'in_transit') {
      order.status = 'delivered';
      this.captureLocation('delivered', order.id);
    }
  }

  captureLocation(action: string, orderId: string) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            orderId: orderId,
            action: action,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
          console.log('Location captured:', locationData);
          
          // Save to localStorage for demo
          const savedLocations = localStorage.getItem('deliveryLocations');
          const locations = savedLocations ? JSON.parse(savedLocations) : [];
          locations.push(locationData);
          localStorage.setItem('deliveryLocations', JSON.stringify(locations));
          
          // In production, send to backend:
          // this.http.post('/api/delivery/location', locationData).subscribe();
          
          alert(`Location captured for ${action}!\nLat: ${position.coords.latitude}\nLng: ${position.coords.longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to capture location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  openMaps(order: DeliveryOrder) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${order.address.lat},${order.address.lng}`;
    window.open(url, '_blank');
  }
}
