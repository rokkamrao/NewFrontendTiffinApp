import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
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
          }
        ]
      },

      // Catch-all redirect
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];