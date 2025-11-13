import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject, interval, forkJoin } from 'rxjs';
import { map, delay, tap, catchError, switchMap, startWith } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { HttpParams } from '@angular/common/http';

// Types and Interfaces
export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  todayRevenue: number;
  pendingOrders: number;
  deliveriesInProgress: number;
  feedbackAlerts: number;
  lowStockItems: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: Address;
  scheduledTime: Date;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  deliveryPartner?: DeliveryPartner;
  paymentStatus: PaymentStatus;
  specialInstructions?: string;
  priority: 'high' | 'medium' | 'low';
  hub: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType?: string; // Made optional since it can be derived from vehicle.type
  currentLocation?: { lat: number; lng: number };
  status: 'available' | 'busy' | 'offline';
  avatar?: string;
  rating?: number;
  vehicle?: { type: string; number: string };
  available?: boolean;
  zone?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  type: 'veg' | 'non-veg' | 'vegan' | 'jain';
  dietType: 'veg' | 'non-veg' | 'vegan' | 'jain'; // Alias for type
  tags: string[];
  ingredients: string[];
  nutritionInfo: NutritionInfo;
  images: string[];
  imageUrl?: string; // Primary image URL
  available: boolean;
  preparationTime: number;
  spiceLevel: 'mild' | 'medium' | 'hot';
  isSpicy?: boolean; // Helper property
  rating: number;
  reviewCount: number;
  orderCount?: number; // For analytics
  allergens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  active: boolean;
  status: 'active' | 'inactive'; // Alias for active
  image?: string; // Category image
  imageUrl?: string;
  itemCount?: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface RealtimeMetrics {
  activeUsers: number;
  ordersPerHour: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
  kitchenUtilization: number;
  deliveryEfficiency: number;
  orderAccuracy: number;
  revenueToday: number;
  popularDishes: { name: string; orders: number }[];
}

export interface DeliveryTracking {
  orderId: string;
  customerName: string;
  deliveryPartner: DeliveryPartner;
  currentLocation: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  estimatedArrival: Date;
  status: 'assigned' | 'picked-up' | 'in-transit' | 'delivered';
  route: { lat: number; lng: number }[];
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  actionRequired: boolean;
  relatedEntity?: {
    type: 'order' | 'inventory' | 'delivery' | 'payment';
    id: string;
  };
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  planType: 'daily' | 'weekly' | 'monthly';
  mealPreferences: string[];
  deliveryTime: string;
  status: 'active' | 'paused' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  totalMeals: number;
  remainingMeals: number;
  pricePerMeal: number;
  totalAmount: number;
}

export interface AnalyticsData {
  revenue: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    labels: string[];
  };
  orderTrends: {
    dates: string[];
    orders: number[];
    revenue: number[];
  };
  customerAnalytics: {
    newCustomers: number;
    returningCustomers: number;
    churnRate: number;
    averageOrderValue: number;
  };
  dishPerformance: {
    topDishes: { name: string; orders: number; revenue: number }[];
    categoryBreakdown: { category: string; percentage: number }[];
  };
  deliveryMetrics: {
    onTimeDelivery: number;
    averageDeliveryTime: number;
    deliveryRatings: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiService = inject(ApiService);
  
  // Real-time data streams
  private statsSubject = new BehaviorSubject<AdminStats | null>(null);
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private alertsSubject = new BehaviorSubject<SystemAlert[]>([]);

  constructor() {
    this.initializeRealtimeUpdates();
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Load dashboard stats on service initialization
    this.refreshDashboardStats().subscribe();
    // Load recent orders
    this.loadOrders().subscribe();
  }

  private refreshDashboardStats(): Observable<AdminStats> {
    // Get stats from dedicated admin endpoint
    return this.apiService.get<AdminStats>('/admin/stats').pipe(
      tap(stats => this.statsSubject.next(stats)),
      catchError(error => {
        console.error('Error loading dashboard stats:', error);
        // Fallback to calculating from other endpoints if admin endpoint fails
        return this.calculateStatsFromOrders();
      })
    );
  }

  private calculateStatsFromOrders(): Observable<AdminStats> {
    // Fallback method to calculate stats from orders if admin endpoint fails
    return forkJoin({
      orders: this.apiService.get<any>('/orders').pipe(catchError(() => of({ content: [] }))),
      dishes: this.apiService.get<any[]>('/dishes').pipe(catchError(() => of([])))
    }).pipe(
      map(({ orders, dishes }) => {
        // Handle paginated response for orders
        const ordersList = orders.content || orders || [];
        
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        
        // Calculate stats from real data
        const todayOrders = ordersList.filter((order: any) => 
          new Date(order.orderTime || order.createdAt) >= todayStart
        );
        
        const pendingOrders = ordersList.filter((order: any) => 
          ['PENDING', 'PREPARING', 'READY'].includes(order.status)
        ).length;
        
        const deliveriesInProgress = ordersList.filter((order: any) => 
          order.status === 'DISPATCHED'
        ).length;
        
        const todayRevenue = todayOrders.reduce((sum: number, order: any) => 
          sum + (order.totalAmount || 0), 0
        );

        const stats: AdminStats = {
          totalUsers: 2450, // This would come from user endpoint
          activeSubscriptions: 1230, // This would come from subscription endpoint
          todayRevenue,
          pendingOrders,
          deliveriesInProgress,
          feedbackAlerts: 3, // This would come from feedback endpoint
          lowStockItems: 5, // This would come from inventory endpoint
          systemHealth: pendingOrders > 50 ? 'warning' : 'healthy'
        };

        this.statsSubject.next(stats);
        return stats;
      }),
      catchError(error => {
        console.error('Error calculating stats from orders:', error);
        // Return default stats if all fails
        const defaultStats: AdminStats = {
          totalUsers: 0,
          activeSubscriptions: 0,
          todayRevenue: 0,
          pendingOrders: 0,
          deliveriesInProgress: 0,
          feedbackAlerts: 0,
          lowStockItems: 0,
          systemHealth: 'critical'
        };
        this.statsSubject.next(defaultStats);
        return of(defaultStats);
      })
    );
  }

  // Dashboard Data
  getDashboardStats(): Observable<AdminStats> {
    return this.statsSubject.asObservable().pipe(
      switchMap(stats => {
        if (stats) {
          return of(stats);
        }
        // If no cached stats, fetch them
        return this.refreshDashboardStats();
      })
    );
  }

  refreshStats(): Observable<AdminStats> {
    return this.refreshDashboardStats();
  }

  getRealtimeMetrics(): Observable<RealtimeMetrics> {
    return this.apiService.get<any>('/orders').pipe(
      map(response => {
        // Handle paginated response from backend
        const orders = response.content || response || [];
        
        const now = new Date();
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        
        const recentOrders = orders.filter((order: any) => 
          new Date(order.orderTime || order.createdAt) >= hourAgo
        );
        
        const deliveredOrders = orders.filter((order: any) => 
          order.status === 'DELIVERED' && order.actualDeliveryTime
        );
        
        const avgDeliveryTime = deliveredOrders.length > 0 
          ? deliveredOrders.reduce((sum: number, order: any) => {
              const scheduled = new Date(order.scheduledTime || order.orderTime);
              const delivered = new Date(order.actualDeliveryTime);
              return sum + (delivered.getTime() - scheduled.getTime()) / (1000 * 60);
            }, 0) / deliveredOrders.length
          : 30;

        return {
          activeUsers: 156, // This would come from real-time user tracking
          ordersPerHour: recentOrders.length,
          averageDeliveryTime: Math.round(avgDeliveryTime),
          customerSatisfaction: 92, // This would come from reviews endpoint
          kitchenUtilization: 78, // This would come from kitchen management system
          deliveryEfficiency: 85, // This would come from delivery tracking
          orderAccuracy: 96, // This would come from order fulfillment tracking
          revenueToday: orders
            .filter((order: any) => {
              const today = new Date();
              const orderDate = new Date(order.orderTime || order.createdAt);
              return orderDate.toDateString() === today.toDateString();
            })
            .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0),
          popularDishes: [] // This would come from analytics endpoint
        };
      }),
      catchError(error => {
        console.error('Error loading realtime metrics:', error);
        return of({
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
      })
    );
  }

  // Order Management
  getOrders(filters?: any): Observable<Order[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });
    }
    
    return this.apiService.get<any>('/orders', { params }).pipe(
      map(response => {
        // Handle paginated response from backend
        const orders = response.content || response || [];
        return this.transformOrders(orders);
      }),
      tap(orders => this.ordersSubject.next(orders)),
      catchError(error => {
        console.error('Error loading orders:', error);
        return of([]);
      })
    );
  }

  private loadOrders(): Observable<Order[]> {
    return this.getOrders();
  }

  getActiveOrders(): Observable<Order[]> {
    return this.getOrders({
      status: 'preparing,ready,dispatched'
    });
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.apiService.get<Order>(`/orders/${orderId}`).pipe(
      map(order => this.transformOrder(order))
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.apiService.patch<Order>(`/orders/${orderId}/status`, { status }).pipe(
      map(order => this.transformOrder(order)),
      tap(() => {
        // Refresh stats after status update
        this.refreshDashboardStats().subscribe();
      })
    );
  }

  // Menu Management
  getMenuItems(filters?: any): Observable<MenuItem[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.query) params = params.set('query', filters.query);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.category) params = params.set('category', filters.category);
    }
    
    return this.apiService.get<MenuItem[]>('/dishes', { params }).pipe(
      map(dishes => this.transformMenuItems(dishes)),
      catchError(error => {
        console.error('Error loading menu items:', error);
        return of([]);
      })
    );
  }

  createMenuItem(item: Partial<MenuItem>): Observable<MenuItem> {
    return this.apiService.post<MenuItem>('/dishes', item).pipe(
      map(dish => this.transformMenuItem(dish))
    );
  }

  updateMenuItem(itemId: string, updates: Partial<MenuItem>): Observable<MenuItem> {
    return this.apiService.put<MenuItem>(`/dishes/${itemId}`, updates).pipe(
      map(dish => this.transformMenuItem(dish))
    );
  }

  deleteMenuItem(itemId: string): Observable<void> {
    return this.apiService.delete<void>(`/dishes/${itemId}`);
  }

  // Menu Categories - Using real API
  getMenuCategories(): Observable<MenuCategory[]> {
    console.log('[AdminRealApiService] getMenuCategories() - Fetching from API');
    return this.apiService.get<MenuCategory[]>('/admin/menu/categories').pipe(
      tap({
        next: (categories) => console.log('[AdminRealApiService] Menu categories loaded:', categories.length),
        error: (error) => console.error('[AdminRealApiService] Error loading categories:', error)
      }),
      catchError((error) => {
        console.error('[AdminRealApiService] getMenuCategories() failed, returning empty array:', error);
        return of([]);
      })
    );
  }

  deleteMenuCategory(categoryId: string): Observable<void> {
    // Mock implementation - in a real app this would call the API
    console.log('Deleting category:', categoryId);
    return of(void 0);
  }

  // Analytics
  getAnalyticsData(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Observable<AnalyticsData> {
    return this.apiService.get<any[]>('/orders').pipe(
      map(orders => this.calculateAnalytics(orders, period)),
      catchError(error => {
        console.error('Error loading analytics data:', error);
        return of(this.getDefaultAnalytics());
      })
    );
  }

  // Delivery Tracking
  getDeliveryTracking(): Observable<DeliveryTracking[]> {
    return this.getOrders({ status: 'dispatched' }).pipe(
      map(orders => orders.map(order => ({
        orderId: order.id,
        customerName: order.customerName,
        deliveryPartner: order.deliveryPartner || {
          id: 'DP001',
          name: 'Unknown Partner',
          phone: '',
          vehicleType: 'bike',
          status: 'busy' as const
        },
        currentLocation: { lat: 12.9716, lng: 77.5946 }, // Mock current location
        destination: { lat: 12.9716, lng: 77.5946 }, // Mock destination
        estimatedArrival: order.estimatedDeliveryTime,
        status: 'in-transit' as const,
        route: [] // Mock route
      })))
    );
  }

  // Real-time updates
  private initializeRealtimeUpdates(): void {
    // Refresh stats every 30 seconds
    interval(30000).subscribe(() => {
      this.refreshDashboardStats().subscribe();
    });
  }

  // Data transformation helpers
  private transformOrders(orders: any[]): Order[] {
    return orders.map(order => this.transformOrder(order));
  }

  private transformOrder(order: any): Order {
    return {
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
      scheduledTime: new Date(order.scheduledTime),
      estimatedDeliveryTime: new Date(order.estimatedDeliveryTime),
      actualDeliveryTime: order.actualDeliveryTime ? new Date(order.actualDeliveryTime) : undefined
    };
  }

  private transformMenuItems(dishes: any[]): MenuItem[] {
    return dishes.map(dish => this.transformMenuItem(dish));
  }

  private transformMenuItem(dish: any): MenuItem {
    return {
      ...dish,
      dietType: dish.type || dish.dietType, // Set dietType as alias for type
      imageUrl: dish.images?.[0] || dish.imageUrl, // Set primary image
      isSpicy: dish.spiceLevel === 'hot' || dish.spiceLevel === 'medium',
      orderCount: dish.orderCount || 0,
      createdAt: new Date(dish.createdAt || Date.now()),
      updatedAt: new Date(dish.updatedAt || Date.now()),
      nutritionInfo: dish.nutritionInfo || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0
      }
    };
  }

  private calculateAnalytics(orders: any[], period: string): AnalyticsData {
    // This is a simplified analytics calculation
    // In a real application, this would be more sophisticated
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= last7Days
    );

    const totalRevenue = recentOrders.reduce((sum, order) => 
      sum + (order.totalAmount || 0), 0
    );

    return {
      revenue: {
        daily: [1200, 1500, 1800, 1300, 2100, 1900, 1600],
        weekly: [8500, 9200, 8800, 9600],
        monthly: [35000, 38000, 42000],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      orderTrends: {
        dates: ['2025-10-20', '2025-10-21', '2025-10-22', '2025-10-23', '2025-10-24', '2025-10-25', '2025-10-26'],
        orders: [45, 52, 48, 61, 58, 67, 59],
        revenue: [4500, 5200, 4800, 6100, 5800, 6700, 5900]
      },
      customerAnalytics: {
        newCustomers: 45,
        returningCustomers: 156,
        churnRate: 12,
        averageOrderValue: 285
      },
      dishPerformance: {
        topDishes: [
          { name: 'Dal Tadka', orders: 89, revenue: 8900 },
          { name: 'Paneer Butter Masala', orders: 67, revenue: 10050 },
          { name: 'Chicken Biryani', orders: 45, revenue: 9000 }
        ],
        categoryBreakdown: [
          { category: 'North Indian', percentage: 45 },
          { category: 'South Indian', percentage: 30 },
          { category: 'Chinese', percentage: 15 },
          { category: 'Desserts', percentage: 10 }
        ]
      },
      deliveryMetrics: {
        onTimeDelivery: 89,
        averageDeliveryTime: 28,
        deliveryRatings: 4.3
      }
    };
  }

  private getDefaultAnalytics(): AnalyticsData {
    return {
      revenue: {
        daily: [],
        weekly: [],
        monthly: [],
        labels: []
      },
      orderTrends: {
        dates: [],
        orders: [],
        revenue: []
      },
      customerAnalytics: {
        newCustomers: 0,
        returningCustomers: 0,
        churnRate: 0,
        averageOrderValue: 0
      },
      dishPerformance: {
        topDishes: [],
        categoryBreakdown: []
      },
      deliveryMetrics: {
        onTimeDelivery: 0,
        averageDeliveryTime: 0,
        deliveryRatings: 0
      }
    };
  }
}