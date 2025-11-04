import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  DeliveryPartner, 
  DeliveryPartnerLoginRequest, 
  DeliveryPartnerResponse,
  PartnerStatus,
  VehicleType
} from '../models/delivery-partner.model';
import { 
  Delivery, 
  DeliveryStats, 
  UpdateDeliveryStatusRequest 
} from '../models/delivery.model';
// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly baseUrl = 'http://localhost:8080/api/delivery';
  private readonly useMockData = true; // Enable mock data for testing
  
  private currentPartnerSubject = new BehaviorSubject<DeliveryPartner | null>(null);
  public currentPartner$ = this.currentPartnerSubject.asObservable();
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if partner is already logged in
    this.checkStoredAuth();
  }

  // Helper methods for safe localStorage access
  private setStoredItem(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private getStoredItem(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  private removeStoredItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  private checkStoredAuth(): void {
    const storedPartner = this.getStoredItem('deliveryPartner');
    const isLoggedIn = this.getStoredItem('deliveryLoggedIn') === 'true';
    
    if (storedPartner && isLoggedIn) {
      try {
        const partner = JSON.parse(storedPartner);
        this.currentPartnerSubject.next(partner);
        this.isLoggedInSubject.next(true);
      } catch (error) {
        console.error('Error parsing stored partner data:', error);
        this.clearStoredAuth();
      }
    }
  }

  private clearStoredAuth(): void {
    this.removeStoredItem('deliveryPartner');
    this.removeStoredItem('deliveryLoggedIn');
    this.currentPartnerSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  login(request: DeliveryPartnerLoginRequest): Observable<{success: boolean, partner?: DeliveryPartner, message?: string}> {
    // Use mock data for testing
    if (this.useMockData) {
      return new Observable(observer => {
        setTimeout(() => {
          if (request.phone === '9876543210' && request.password === 'password123') {
            const mockPartner: DeliveryPartner = {
              id: 1,
              name: 'John Doe',
              phone: '9876543210',
              email: 'john@example.com',
              status: PartnerStatus.APPROVED,
              rating: 4.5,
              totalDeliveries: 25,
              totalEarnings: 2500,
              vehicleType: VehicleType.MOTORCYCLE,
              vehicleNumber: 'DL01AB1234',
              isOnline: true,
              documentsVerified: true
            };
            
            // Store authentication state
            this.setStoredItem('deliveryPartner', JSON.stringify(mockPartner));
            this.setStoredItem('deliveryLoggedIn', 'true');
            
            // Update subjects
            this.currentPartnerSubject.next(mockPartner);
            this.isLoggedInSubject.next(true);
            
            observer.next({ success: true, partner: mockPartner, message: 'Login successful' });
            observer.complete();
          } else {
            observer.next({ success: false, message: 'Invalid phone number or password' });
            observer.complete();
          }
        }, 1000); // Simulate network delay
      });
    }

    // Real API call (fallback)
    return this.http.post<ApiResponse<DeliveryPartnerResponse>>(`${this.baseUrl}/auth/login`, request)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            const partner: DeliveryPartner = response.data;
            
            // Store authentication state
            this.setStoredItem('deliveryPartner', JSON.stringify(partner));
            this.setStoredItem('deliveryLoggedIn', 'true');
            
            // Update subjects
            this.currentPartnerSubject.next(partner);
            this.isLoggedInSubject.next(true);
            
            return { success: true, partner, message: response.message };
          } else {
            return { success: false, message: response.message || 'Login failed' };
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          let message = 'Login failed';
          
          if (error.status === 401) {
            message = 'Invalid phone number or password';
          } else if (error.status === 0) {
            message = 'Cannot connect to server. Please check your connection.';
          } else if (error.error?.message) {
            message = error.error.message;
          }
          
          return throwError(() => ({ success: false, message }));
        })
      );
  }

  logout(): void {
    this.clearStoredAuth();
  }

  getCurrentPartner(): DeliveryPartner | null {
    return this.currentPartnerSubject.value;
  }

  getPartnerDeliveries(partnerId: number): Observable<Delivery[]> {
    return this.http.get<ApiResponse<Delivery[]>>(`${this.baseUrl}/partner/${partnerId}/deliveries`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching deliveries:', error);
          return throwError(() => error);
        })
      );
  }

  getActiveDeliveries(partnerId: number): Observable<Delivery[]> {
    return this.http.get<ApiResponse<Delivery[]>>(`${this.baseUrl}/partner/${partnerId}/deliveries/active`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching active deliveries:', error);
          return throwError(() => error);
        })
      );
  }

  getPartnerStats(partnerId: number): Observable<DeliveryStats> {
    // Use mock data for testing
    if (this.useMockData) {
      return new Observable(observer => {
        setTimeout(() => {
          const mockStats: DeliveryStats = {
            todayDeliveries: 3,
            pendingPickups: 1,
            inTransit: 0,
            completed: 25,
            todayEarnings: 300,
            weeklyEarnings: 1500,
            monthlyEarnings: 6000,
            averageRating: 4.5,
            totalDeliveries: 25
          };
          observer.next(mockStats);
          observer.complete();
        }, 500); // Simulate network delay
      });
    }

    // Real API call (fallback)
    return this.http.get<ApiResponse<DeliveryStats>>(`${this.baseUrl}/partner/${partnerId}/stats`)
      .pipe(
        map(response => response.data!),
        catchError(error => {
          console.error('Error fetching partner stats:', error);
          return throwError(() => error);
        })
      );
  }

  updateDeliveryStatus(deliveryId: number, request: UpdateDeliveryStatusRequest, partnerId: number): Observable<Delivery> {
    return this.http.put<ApiResponse<Delivery>>(`${this.baseUrl}/deliveries/${deliveryId}/status?partnerId=${partnerId}`, request)
      .pipe(
        map(response => response.data!),
        catchError(error => {
          console.error('Error updating delivery status:', error);
          return throwError(() => error);
        })
      );
  }

  updateOnlineStatus(partnerId: number, isOnline: boolean): Observable<DeliveryPartner> {
    // Use mock data for testing
    if (this.useMockData) {
      return new Observable(observer => {
        setTimeout(() => {
          const currentPartner = this.currentPartnerSubject.value;
          if (currentPartner) {
            const updatedPartner = { ...currentPartner, isOnline };
            
            // Update stored partner data
            this.setStoredItem('deliveryPartner', JSON.stringify(updatedPartner));
            this.currentPartnerSubject.next(updatedPartner);
            
            observer.next(updatedPartner);
            observer.complete();
          } else {
            observer.error(new Error('No partner logged in'));
          }
        }, 300); // Simulate network delay
      });
    }

    // Real API call (fallback)
    return this.http.put<ApiResponse<DeliveryPartnerResponse>>(`${this.baseUrl}/partner/${partnerId}/online-status?isOnline=${isOnline}`, {})
      .pipe(
        map(response => {
          const partner = response.data!;
          // Update stored partner data
          this.setStoredItem('deliveryPartner', JSON.stringify(partner));
          this.currentPartnerSubject.next(partner);
          return partner;
        }),
        catchError(error => {
          console.error('Error updating online status:', error);
          return throwError(() => error);
        })
      );
  }

  // Location tracking methods
  updateLocation(partnerId: number, latitude: number, longitude: number): Observable<void> {
    // This would be called periodically to update partner location
    const request = {
      status: 'IN_TRANSIT', // or current status
      currentLatitude: latitude,
      currentLongitude: longitude
    };
    
    // For now, we'll use the delivery status update endpoint
    // In a real app, you'd have a dedicated location update endpoint
    return this.http.put<void>(`${this.baseUrl}/partner/${partnerId}/location`, {
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    }).pipe(
      catchError(error => {
        console.error('Error updating location:', error);
        return throwError(() => error);
      })
    );
  }

  // Utility methods
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getPartnerId(): number | null {
    const partner = this.getCurrentPartner();
    return partner ? partner.id : null;
  }
}