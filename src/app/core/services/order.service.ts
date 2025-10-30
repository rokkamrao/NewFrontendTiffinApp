import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface OrderItem {
  dishId: number;
  dishName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order { 
  id?: number;
  items: OrderItem[];
  totalAmount?: number;
  status?: string;
  orderTime?: string;
  deliveryTime?: string;
  deliveryAddressId?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentId?: string;
  specialInstructions?: string;
  isPaid?: boolean;
  eta?: string;
  createdAt?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  deliveryAddressId?: number;
  paymentMethod: string;
  deliveryTime?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = inject(ApiService);

  /**
   * Create a new order
   */
  create(orderRequest: CreateOrderRequest): Observable<Order>{
    console.log('[OrderService] create() - Creating order:', orderRequest);
    return this.api.post<Order>('/orders', orderRequest).pipe(
      tap({
        next: (order) => console.log('[OrderService] create() - Success:', order),
        error: (error) => console.error('[OrderService] create() - Error:', error)
      })
    );
  }

  /**
   * Update order status
   */
  updateStatus(id: number, status: string): Observable<Order>{
    console.log('[OrderService] updateStatus() - Updating order:', id, 'to', status);
    return this.api.patch<Order>(`/orders/${id}/status?status=${status}`, {}).pipe(
      tap({
        next: (order) => console.log('[OrderService] updateStatus() - Success:', order),
        error: (error) => console.error('[OrderService] updateStatus() - Error:', error)
      })
    );
  }

  /**
   * List all orders for the current user
   */
  list(): Observable<Order[]>{ 
    console.log('[OrderService] list() - Fetching orders');
    // For now, return all orders. Backend returns paginated response
    // TODO: Handle pagination properly
    return this.api.get<any>('/orders').pipe(
      tap({
        next: (orders) => console.log('[OrderService] list() - Success:', orders),
        error: (error) => console.error('[OrderService] list() - Error:', error)
      })
      // Transform Page<Order> response to Order[]
      // Backend returns { content: [...], totalElements, etc }
    );
  }

  /**
   * Get a specific order by ID
   */
  get(id: number): Observable<Order>{ 
    console.log('[OrderService] get() - Fetching order:', id);
    return this.api.get<Order>(`/orders/${id}`).pipe(
      tap({
        next: (order) => console.log('[OrderService] get() - Success:', order),
        error: (error) => console.error('[OrderService] get() - Error:', error)
      })
    );
  }
}
