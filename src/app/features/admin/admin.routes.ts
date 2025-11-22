import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard], // Ensure all admin routes require authentication
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      
      // Main Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
        data: { title: 'Dashboard Overview', breadcrumb: 'Dashboard' }
      },

      // Order Management
      {
        path: 'orders',
        children: [
          {
            path: '',
            loadComponent: () => import('./orders/order-list.component').then(m => m.OrderListComponent),
            data: { title: 'Order Management', breadcrumb: 'Orders' }
          },
          {
            path: ':id',
            loadComponent: () => import('./orders/order-list.component').then(m => m.OrderListComponent),
            data: { title: 'Order Details', breadcrumb: 'Order Details' }
          }
        ]
      },

      // Menu Management
      {
        path: 'menu',
        children: [
          {
            path: '',
            loadComponent: () => import('./menu/menu-management.component').then(m => m.MenuManagementComponent),
            data: { title: 'Menu Management', breadcrumb: 'Menu' }
          }
        ]
      },

      // Image Upload Management
      {
        path: 'images',
        loadComponent: () => import('./image-upload/image-upload.component').then(m => m.ImageUploadComponent),
        data: { title: 'Image Management', breadcrumb: 'Images' }
      },

      // Dish Management
      {
        path: 'dishes',
        loadComponent: () => import('./dish-management/dish-management.component').then(m => m.DishManagementComponent),
        data: { title: 'Dish Management', breadcrumb: 'Dishes' }
      },

      // Delivery Management
      {
        path: 'delivery',
        children: [
          {
            path: '',
            redirectTo: 'tracking',
            pathMatch: 'full'
          },
          {
            path: 'tracking',
            loadComponent: () => import('./delivery/delivery-tracking.component').then(m => m.DeliveryTrackingComponent),
            data: { title: 'Delivery Tracking', breadcrumb: 'Delivery Tracking' }
          }
        ]
      },

      // Analytics
      {
        path: 'analytics',
        children: [
          {
            path: '',
            loadComponent: () => import('./analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
            data: { title: 'Analytics Dashboard', breadcrumb: 'Analytics' }
          },
          {
            path: 'revenue',
            loadComponent: () => import('./analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
            data: { title: 'Revenue Analytics', breadcrumb: 'Revenue' }
          }
        ]
      },

      // User Management
      {
        path: 'users',
        loadComponent: () => import('./analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
        data: { title: 'User Management', breadcrumb: 'Users' }
      },

      // Test Route
      {
        path: 'test',
        loadComponent: () => import('./test/admin-test.component').then(m => m.AdminTestComponent),
        data: { title: 'Admin Test', breadcrumb: 'Test' }
      },

      // Catch-all redirect
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];