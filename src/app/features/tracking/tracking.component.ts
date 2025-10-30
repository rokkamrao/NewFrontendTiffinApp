import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LocationService, LocationData } from '../../core/services/location.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracking.component.html'
})
export class TrackingComponent implements OnInit, OnDestroy {
  orderId = '';
  locationHistory: LocationData[] = [];
  latestLocation: LocationData | null = null;
  private refreshSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private locationService: LocationService
  ) {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    this.loadLocationHistory();
    
    // Auto-refresh every 10 seconds
    this.refreshSubscription = interval(10000).subscribe(() => {
      this.loadLocationHistory();
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadLocationHistory() {
    this.locationHistory = this.locationService.getLocationsByOrder(this.orderId);
    if (this.locationHistory.length > 0) {
      this.latestLocation = this.locationHistory[0];
    }
  }

  getActionLabel(action: string): string {
    const labels: any = {
      'pickup': 'Order picked up from restaurant',
      'start_delivery': 'Delivery started',
      'delivered': 'Order delivered',
      'checkpoint': 'Delivery checkpoint',
      'manual': 'Location update'
    };
    return labels[action] || action;
  }

  viewOnMap(lat: number, lng: number) {
    this.locationService.viewLocationOnMap(lat, lng);
  }
}

