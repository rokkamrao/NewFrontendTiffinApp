import { Routes } from '@angular/router';

export const DELIVERY_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/delivery-login.component').then(m => m.DeliveryLoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/delivery-dashboard.component').then(m => m.DeliveryDashboardComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/delivery-orders.component').then(m => m.DeliveryOrdersComponent)
  },
  {
    path: 'order/:id',
    loadComponent: () => import('./orders/delivery-order-detail.component').then(m => m.DeliveryOrderDetailComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
