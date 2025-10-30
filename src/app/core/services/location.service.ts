import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { StorageService } from './storage.service';

export interface LocationData {
  orderId: string;
  action: 'pickup' | 'start_delivery' | 'delivered' | 'manual' | 'checkpoint';
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  deliveryPersonId?: string;
  notes?: string;
}

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly STORAGE_KEY = 'deliveryLocations';

  constructor(private storage: StorageService) {}

  /**
   * Get current position using Geolocation API
   */
  getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
          observer.next(locationData);
          observer.complete();
        },
        (error) => {
          observer.error(this.getErrorMessage(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Watch position changes (real-time tracking)
   */
  watchPosition(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by this browser.');
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationData: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
          observer.next(locationData);
        },
        (error) => {
          observer.error(this.getErrorMessage(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );

      // Cleanup function
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    });
  }

  /**
   * Save location to localStorage (for demo) and return it
   * In production, this would send to backend API
   */
  saveLocation(locationData: LocationData): Observable<LocationData> {
    return new Observable(observer => {
      try {
        const savedLocations = this.getAllLocations();
        savedLocations.push(locationData);
        this.storage.setItem(this.STORAGE_KEY, JSON.stringify(savedLocations));
        
        // In production, send to backend:
        // return this.http.post<LocationData>('/api/delivery/location', locationData);
        
        observer.next(locationData);
        observer.complete();
      } catch (error) {
        observer.error('Failed to save location data');
      }
    });
  }

  /**
   * Capture and save current location for an order
   */
  captureLocationForOrder(
    orderId: string, 
    action: LocationData['action'],
    deliveryPersonId?: string,
    notes?: string
  ): Observable<LocationData> {
    return new Observable(observer => {
      this.getCurrentPosition().subscribe({
        next: (position) => {
          const locationData: LocationData = {
            orderId,
            action,
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
            timestamp: new Date().toISOString(),
            deliveryPersonId,
            notes
          };

          this.saveLocation(locationData).subscribe({
            next: (saved) => {
              observer.next(saved);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /**
   * Get all saved locations from localStorage
   */
  getAllLocations(): LocationData[] {
    const savedData = this.storage.getItem(this.STORAGE_KEY);
    if (!savedData) {
      return [];
    }

    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.warn('Failed to parse locations:', error);
      return [];
    }
  }

  /**
   * Get locations for a specific order
   */
  getLocationsByOrder(orderId: string): LocationData[] {
    return this.getAllLocations()
      .filter(loc => loc.orderId === orderId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get locations by delivery person
   */
  getLocationsByDeliveryPerson(deliveryPersonId: string): LocationData[] {
    return this.getAllLocations()
      .filter(loc => loc.deliveryPersonId === deliveryPersonId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance; // Returns distance in kilometers
  }

  /**
   * Open Google Maps with navigation to specific coordinates
   */
  openGoogleMaps(lat: number, lng: number): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }

  /**
   * Open Google Maps showing a specific location
   */
  viewLocationOnMap(lat: number, lng: number): void {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }

  /**
   * Clear all saved locations (for testing)
   */
  clearAllLocations(): void {
    this.storage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get human-readable error message
   */
  private getErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please enable location permissions.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.';
      case error.TIMEOUT:
        return 'Location request timed out. Please try again.';
      default:
        return 'An unknown error occurred while getting location.';
    }
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
