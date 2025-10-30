import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-delivery-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="delivery-order-detail">
      <!-- Header -->
      <div class="bg-primary text-white p-3 shadow-sm">
        <div class="container">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-light btn-sm" routerLink="/delivery/orders">
              <i class="bi bi-arrow-left"></i>
            </button>
            <div>
              <h5 class="mb-0">Order Details</h5>
              <small>{{ orderId }}</small>
            </div>
          </div>
        </div>
      </div>

      <div class="container py-4">
        <!-- Location Timeline -->
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-white">
            <h6 class="mb-0">Location History</h6>
          </div>
          <div class="card-body">
            <div *ngIf="locationHistory.length === 0" class="text-center text-muted py-3">
              <i class="bi bi-geo-alt"></i>
              <p class="mb-0 mt-2">No location data captured yet</p>
            </div>
            
            <div *ngFor="let loc of locationHistory" class="mb-3 pb-3 border-bottom">
              <div class="d-flex align-items-start gap-3">
                <div class="bg-primary text-white rounded-circle p-2" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-geo-alt-fill"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold">{{ getActionLabel(loc.action) }}</div>
                  <small class="text-muted d-block">
                    {{ loc.timestamp | date:'medium' }}
                  </small>
                  <small class="text-muted d-block">
                    <i class="bi bi-map me-1"></i>
                    Lat: {{ loc.latitude.toFixed(6) }}, Lng: {{ loc.longitude.toFixed(6) }}
                  </small>
                  <small class="text-muted d-block">
                    Accuracy: ±{{ loc.accuracy.toFixed(0) }}m
                  </small>
                  <button 
                    class="btn btn-sm btn-outline-primary mt-2"
                    (click)="viewOnMap(loc.latitude, loc.longitude)">
                    <i class="bi bi-map me-1"></i>
                    View on Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Capture Current Location -->
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center p-4">
            <i class="bi bi-geo-alt-fill text-primary" style="font-size: 3rem;"></i>
            <h6 class="mt-3 mb-2">Capture Current Location</h6>
            <p class="text-muted small mb-3">Record your current position for this order</p>
            <button 
              class="btn btn-primary"
              (click)="captureCurrentLocation()">
              <i class="bi bi-crosshair me-2"></i>
              Capture Location
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DeliveryOrderDetailComponent implements OnInit {
  orderId: string = '';
  locationHistory: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const isLoggedIn = localStorage.getItem('deliveryLoggedIn');
    if (isLoggedIn !== 'true') {
      this.router.navigate(['/delivery/login']);
      return;
    }

    this.orderId = this.route.snapshot.params['id'];
    this.loadLocationHistory();
  }

  loadLocationHistory() {
    const savedLocations = localStorage.getItem('deliveryLocations');
    if (savedLocations) {
      const allLocations = JSON.parse(savedLocations);
      this.locationHistory = allLocations
        .filter((loc: any) => loc.orderId === this.orderId)
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }

  getActionLabel(action: string): string {
    const labels: any = {
      'pickup': 'Picked up from restaurant',
      'start_delivery': 'Started delivery',
      'delivered': 'Delivered to customer',
      'manual': 'Manual location capture'
    };
    return labels[action] || action;
  }

  captureCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            orderId: this.orderId,
            action: 'manual',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
          console.log('Location captured:', locationData);
          
          // Save to localStorage
          const savedLocations = localStorage.getItem('deliveryLocations');
          const locations = savedLocations ? JSON.parse(savedLocations) : [];
          locations.push(locationData);
          localStorage.setItem('deliveryLocations', JSON.stringify(locations));
          
          // Reload history
          this.loadLocationHistory();
          
          alert('Location captured successfully!');
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

  viewOnMap(lat: number, lng: number) {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }
}
