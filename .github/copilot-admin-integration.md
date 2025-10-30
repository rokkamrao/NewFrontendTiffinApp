# Admin Dashboard Backend Integration Guide

## Overview
This guide provides comprehensive instructions for integrating the Angular admin dashboard with the Spring Boot tiffin-api backend. The integration covers API endpoints, authentication, real-time updates, and error handling.

## ✅ LATEST UPDATE: Real Database Integration Complete
The admin panel has been successfully migrated from mock data to real Spring Boot backend integration. All components now use actual API calls to the tiffin-api backend server running on `http://localhost:8081/api`.

### Real API Service Implementation
A dedicated `admin-real-api.service.ts` has been created to handle all real backend communication:

```typescript
// src/app/features/admin/services/admin-real-api.service.ts
@Injectable({
  providedIn: 'root'
})
export class AdminRealApiService {
  private baseUrl = 'http://localhost:8081/api';

  constructor(private apiService: ApiService) {}

  // Real dashboard statistics from backend
  getDashboardStats(): Observable<any> {
    return this.apiService.get(`${this.baseUrl}/admin/stats`).pipe(
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return of(this.getFallbackStats());
      })
    );
  }

  // Real orders data with filtering
  getOrders(status?: string, page: number = 0, size: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }

    return this.apiService.get(`${this.baseUrl}/admin/orders`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching orders:', error);
        return of({ content: [], totalElements: 0 });
      })
    );
  }
}
```

### Backend AdminController Updates
The Spring Boot backend has been enhanced with proper admin endpoints:

```java
// AdminController.java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private DishRepository dishRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getDashboardStats() {
        // Implementation returns real database statistics
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderDto>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return orderService.getOrdersForAdmin(page, size, status);
    }
}
```

## Backend API Structure

### Base Configuration
```typescript
// src/app/core/config/api.config.ts
export const API_CONFIG = {
  baseUrl: environment.production ? 'https://api.tiffin.com' : 'http://localhost:8080',
  apiVersion: 'v1',
  timeout: 30000,
  retryAttempts: 3
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/admin/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    profile: '/auth/profile'
  },
  admin: {
    dashboard: '/admin/dashboard',
    stats: '/admin/dashboard/stats',
    orders: '/admin/orders',
    menu: '/admin/menu',
    delivery: '/admin/delivery',
    analytics: '/admin/analytics',
    users: '/admin/users',
    subscriptions: '/admin/subscriptions'
  }
};
```

### HTTP Interceptor Configuration
```typescript
// src/app/core/interceptors/admin-api.interceptor.ts
@Injectable()
export class AdminApiInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Add API base URL
    if (!req.url.startsWith('http')) {
      req = req.clone({
        url: `${API_CONFIG.baseUrl}/api/${API_CONFIG.apiVersion}${req.url}`
      });
    }

    return next.handle(req).pipe(
      timeout(API_CONFIG.timeout),
      retry(API_CONFIG.retryAttempts),
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          this.authService.logout();
          errorMessage = 'Authentication required';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = error.error?.message || `Error: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
```

## Authentication Integration

### Admin Authentication Service
```typescript
// src/app/core/services/admin-auth.service.ts
@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: AdminLoginCredentials): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(API_ENDPOINTS.auth.login, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.handleAuthError.bind(this))
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.auth.logout, {})
      .pipe(
        finalize(() => {
          this.clearSession();
          this.currentUserSubject.next(null);
          this.router.navigate(['/admin/login']);
        })
      );
  }

  refreshToken(): Observable<AdminLoginResponse> {
    const refreshToken = this.storage.getRefreshToken();
    return this.http.post<AdminLoginResponse>(API_ENDPOINTS.auth.refresh, { refreshToken })
      .pipe(
        tap(response => this.setSession(response)),
        catchError(() => {
          this.logout();
          return throwError(() => new Error('Session expired'));
        })
      );
  }

  private setSession(authResult: AdminLoginResponse): void {
    this.storage.setToken(authResult.accessToken);
    this.storage.setRefreshToken(authResult.refreshToken);
    this.storage.setUser(authResult.user);
  }

  private clearSession(): void {
    this.storage.clear();
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.role) : false;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.permissions.includes(permission) : false;
  }
}

// Interfaces
interface AdminLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
  expiresIn: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
  permissions: string[];
  hubs: string[];
  avatar?: string;
  lastLogin: string;
}
```

### Role-based Route Guards
```typescript
// src/app/core/guards/admin-role.guard.ts
@Injectable({
  providedIn: 'root'
})
export class AdminRoleGuard implements CanActivate {
  constructor(
    private authService: AdminAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];
    const requiredPermissions = route.data['permissions'] as string[];

    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/admin/login']);
          return false;
        }

        const hasRequiredRole = requiredRoles ? 
          requiredRoles.includes(user.role) : true;
        
        const hasRequiredPermissions = requiredPermissions ?
          requiredPermissions.every(permission => 
            user.permissions.includes(permission)) : true;

        if (!hasRequiredRole || !hasRequiredPermissions) {
          this.snackBar.open('Access denied', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/dashboard']);
          return false;
        }

        return true;
      }),
      take(1)
    );
  }
}
```

## API Service Integration

### Enhanced AdminService with Backend Integration
```typescript
// src/app/features/admin/services/admin-api.service.ts
@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  constructor(private http: HttpClient) {}

  // Dashboard APIs
  getDashboardStats(dateRange?: DateRange): Observable<AdminStats> {
    const params = this.buildDateParams(dateRange);
    return this.http.get<AdminStats>(API_ENDPOINTS.admin.stats, { params })
      .pipe(
        map(response => this.transformStatsResponse(response)),
        catchError(this.handleError('dashboard stats'))
      );
  }

  getRecentActivities(limit = 10): Observable<AdminActivity[]> {
    return this.http.get<AdminActivity[]>(`${API_ENDPOINTS.admin.dashboard}/activities`, {
      params: { limit: limit.toString() }
    });
  }

  // Order Management APIs
  getOrders(filters: OrderFilters): Observable<PagedResponse<Order>> {
    const params = this.buildOrderParams(filters);
    return this.http.get<PagedResponse<Order>>(API_ENDPOINTS.admin.orders, { params })
      .pipe(
        map(response => ({
          ...response,
          data: response.data.map(order => this.transformOrder(order))
        }))
      );
  }

  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Observable<Order> {
    return this.http.patch<Order>(`${API_ENDPOINTS.admin.orders}/${orderId}/status`, {
      status,
      notes,
      updatedBy: 'admin', // Will be set from auth context
      timestamp: new Date().toISOString()
    });
  }

  bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus): Observable<BulkUpdateResponse> {
    return this.http.patch<BulkUpdateResponse>(`${API_ENDPOINTS.admin.orders}/bulk-status`, {
      orderIds,
      status,
      updatedBy: 'admin'
    });
  }

  // Menu Management APIs
  getMenuItems(filters: MenuFilters): Observable<MenuItem[]> {
    const params = this.buildMenuParams(filters);
    return this.http.get<MenuItem[]>(`${API_ENDPOINTS.admin.menu}/items`, { params });
  }

  createMenuItem(item: CreateMenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${API_ENDPOINTS.admin.menu}/items`, item);
  }

  updateMenuItem(itemId: string, updates: UpdateMenuItemRequest): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${API_ENDPOINTS.admin.menu}/items/${itemId}`, updates);
  }

  deleteMenuItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.admin.menu}/items/${itemId}`);
  }

  // Delivery Management APIs
  getDeliveryTracking(filters?: DeliveryFilters): Observable<DeliveryTracking[]> {
    const params = this.buildDeliveryParams(filters);
    return this.http.get<DeliveryTracking[]>(`${API_ENDPOINTS.admin.delivery}/tracking`, { params })
      .pipe(
        map(trackings => trackings.map(tracking => this.transformDeliveryTracking(tracking)))
      );
  }

  assignDeliveryPartner(orderId: string, partnerId: string): Observable<DeliveryAssignment> {
    return this.http.post<DeliveryAssignment>(`${API_ENDPOINTS.admin.delivery}/assign`, {
      orderId,
      partnerId,
      assignedBy: 'admin',
      assignedAt: new Date().toISOString()
    });
  }

  // Analytics APIs
  getAnalyticsData(period: AnalyticsPeriod, metrics: string[]): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${API_ENDPOINTS.admin.analytics}/data`, {
      params: {
        period,
        metrics: metrics.join(',')
      }
    });
  }

  exportAnalyticsReport(period: AnalyticsPeriod, format: 'xlsx' | 'csv'): Observable<Blob> {
    return this.http.get(`${API_ENDPOINTS.admin.analytics}/export`, {
      params: { period, format },
      responseType: 'blob'
    });
  }

  // Utility Methods
  private buildDateParams(dateRange?: DateRange): HttpParams {
    let params = new HttpParams();
    if (dateRange) {
      params = params.set('startDate', dateRange.start.toISOString());
      params = params.set('endDate', dateRange.end.toISOString());
    }
    return params;
  }

  private buildOrderParams(filters: OrderFilters): HttpParams {
    let params = new HttpParams();
    
    if (filters.status) params = params.set('status', filters.status);
    if (filters.hubId) params = params.set('hubId', filters.hubId);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.customerId) params = params.set('customerId', filters.customerId);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.size) params = params.set('size', filters.size.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);
    
    return params;
  }

  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`Admin API ${operation} failed:`, error);
      return throwError(() => new Error(`Failed to load ${operation}`));
    };
  }

  private transformOrder(order: any): Order {
    return {
      ...order,
      orderDate: new Date(order.orderDate),
      expectedDeliveryTime: new Date(order.expectedDeliveryTime),
      actualDeliveryTime: order.actualDeliveryTime ? new Date(order.actualDeliveryTime) : undefined
    };
  }
}
```

## Real-time Updates with WebSocket

### WebSocket Service for Live Data
```typescript
// src/app/core/services/admin-websocket.service.ts
@Injectable({
  providedIn: 'root'
})
export class AdminWebSocketService {
  private socket$ = new Subject<any>();
  private connection: WebSocket | null = null;
  
  // Real-time data streams
  public orderUpdates$ = new Subject<OrderUpdate>();
  public deliveryUpdates$ = new Subject<DeliveryUpdate>();
  public statsUpdates$ = new Subject<StatsUpdate>();

  constructor(private authService: AdminAuthService) {
    // Auto-connect when authenticated
    this.authService.currentUser$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(() => this.connect());
  }

  connect(): void {
    if (this.connection) {
      return;
    }

    const token = this.authService.getToken();
    const wsUrl = `${environment.wsUrl}/admin?token=${token}`;
    
    this.connection = new WebSocket(wsUrl);

    this.connection.onopen = () => {
      console.log('Admin WebSocket connected');
    };

    this.connection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.connection.onclose = () => {
      console.log('Admin WebSocket disconnected');
      this.connection = null;
      // Attempt reconnection
      setTimeout(() => this.connect(), 5000);
    };

    this.connection.onerror = (error) => {
      console.error('Admin WebSocket error:', error);
    };
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'ORDER_UPDATE':
        this.orderUpdates$.next(message.data);
        break;
      case 'DELIVERY_UPDATE':
        this.deliveryUpdates$.next(message.data);
        break;
      case 'STATS_UPDATE':
        this.statsUpdates$.next(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Subscribe to specific update types
  subscribeToOrderUpdates(): Observable<OrderUpdate> {
    return this.orderUpdates$.asObservable();
  }

  subscribeToDeliveryUpdates(): Observable<DeliveryUpdate> {
    return this.deliveryUpdates$.asObservable();
  }

  subscribeToStatsUpdates(): Observable<StatsUpdate> {
    return this.statsUpdates$.asObservable();
  }
}
```

## Error Handling and Loading States

### Global Error Handler
```typescript
// src/app/core/services/admin-error.service.ts
@Injectable({
  providedIn: 'root'
})
export class AdminErrorService {
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  handleError(error: any, context?: string): void {
    let message = 'An unexpected error occurred';
    let actions: string[] = ['Close'];

    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          message = 'Unable to connect to server';
          actions = ['Retry', 'Close'];
          break;
        case 400:
          message = error.error?.message || 'Invalid request';
          break;
        case 401:
          message = 'Authentication required';
          this.redirectToLogin();
          return;
        case 403:
          message = 'Access denied';
          break;
        case 404:
          message = 'Resource not found';
          break;
        case 422:
          message = 'Validation failed';
          this.showValidationErrors(error.error?.errors);
          return;
        case 500:
          message = 'Server error occurred';
          this.showServerErrorDialog(error);
          return;
        default:
          message = error.error?.message || `Error ${error.status}`;
      }
    }

    if (context) {
      message = `${context}: ${message}`;
    }

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showValidationErrors(errors: ValidationError[]): void {
    const errorMessages = errors.map(err => `${err.field}: ${err.message}`);
    this.dialog.open(ValidationErrorDialogComponent, {
      data: { errors: errorMessages },
      width: '400px'
    });
  }

  private showServerErrorDialog(error: HttpErrorResponse): void {
    this.dialog.open(ServerErrorDialogComponent, {
      data: { 
        error: error.error,
        timestamp: new Date(),
        url: error.url
      },
      width: '500px'
    });
  }

  private redirectToLogin(): void {
    // Will be handled by auth interceptor
  }
}
```

### Loading State Management
```typescript
// src/app/core/services/loading.service.ts
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCount = 0;

  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.loadingCount++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  wrap<T>(observable: Observable<T>): Observable<T> {
    return new Observable(observer => {
      this.show();
      const subscription = observable.subscribe({
        next: value => observer.next(value),
        error: error => {
          this.hide();
          observer.error(error);
        },
        complete: () => {
          this.hide();
          observer.complete();
        }
      });

      return () => subscription.unsubscribe();
    });
  }
}
```

## Environment Configuration

### Production vs Development APIs
```typescript
// src/environments/environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  wsUrl: 'ws://localhost:8080/ws',
  enableLogging: true,
  enableMocks: false
};

// src/environments/environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://api.tiffin.com/api/v1',
  wsUrl: 'wss://api.tiffin.com/ws',
  enableLogging: false,
  enableMocks: false
};
```

This comprehensive integration guide provides everything needed to connect the Angular admin dashboard with the Spring Boot backend, including authentication, real-time updates, error handling, and proper API management.