import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, map } from 'rxjs/operators';

interface NavigationItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
  children?: NavigationItem[];
  roles?: string[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FormsModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="brand">
            <i class="bi bi-box-seam text-primary"></i>
            @if (!sidebarCollapsed()) {
              <span class="brand-text">TiffinAdmin</span>
            }
          </div>
          <button class="sidebar-toggle" (click)="toggleSidebar()">
            <i class="bi" [class]="sidebarCollapsed() ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            @for (item of navigationItems; track item.route) {
              @if (!item.children) {
                <a class="nav-link" 
                   [routerLink]="item.route" 
                   routerLinkActive="active"
                   [title]="sidebarCollapsed() ? item.label : ''">
                  <i [class]="'bi ' + item.icon"></i>
                  @if (!sidebarCollapsed()) {
                    <span class="nav-text">{{ item.label }}</span>
                    @if (item.badge) {
                      <span class="badge bg-danger">{{ item.badge }}</span>
                    }
                  }
                </a>
              } @else {
                <div class="nav-group">
                  <div class="nav-group-header" 
                       (click)="toggleNavGroup(item.route)"
                       [class.expanded]="expandedGroups().includes(item.route)">
                    <i [class]="'bi ' + item.icon"></i>
                    @if (!sidebarCollapsed()) {
                      <span class="nav-text">{{ item.label }}</span>
                      <i class="bi bi-chevron-down group-chevron"></i>
                    }
                  </div>
                  @if (!sidebarCollapsed() && expandedGroups().includes(item.route)) {
                    <div class="nav-group-children">
                      @for (child of item.children; track child.route) {
                        <a class="nav-link child" 
                           [routerLink]="child.route"
                           routerLinkActive="active">
                          <i [class]="'bi ' + child.icon"></i>
                          <span class="nav-text">{{ child.label }}</span>
                          @if (child.badge) {
                            <span class="badge bg-warning">{{ child.badge }}</span>
                          }
                        </a>
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="!sidebarCollapsed()">
            <div class="user-avatar">
              <i class="bi bi-person-circle"></i>
            </div>
            <div class="user-details">
              <div class="user-name">Admin User</div>
              <div class="user-role">Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content" [class.sidebar-collapsed]="sidebarCollapsed()">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <button class="mobile-menu-toggle d-lg-none" (click)="toggleSidebar()">
              <i class="bi bi-list"></i>
            </button>
            <nav class="breadcrumb-nav">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item">
                  <a routerLink="/admin">Admin</a>
                </li>
                @for (crumb of breadcrumbs(); track crumb.label) {
                  <li class="breadcrumb-item" [class.active]="crumb.active">
                    @if (!crumb.active && crumb.route) {
                      <a [routerLink]="crumb.route">{{ crumb.label }}</a>
                    } @else {
                      {{ crumb.label }}
                    }
                  </li>
                }
              </ol>
            </nav>
          </div>

          <div class="header-right">
            <!-- Global Search -->
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input type="text" 
                     class="form-control" 
                     placeholder="Search orders, users, dishes..."
                     [(ngModel)]="globalSearch">
            </div>

            <!-- Notifications -->
            <div class="notification-dropdown dropdown">
              <button class="btn btn-ghost" 
                      data-bs-toggle="dropdown" 
                      [class.has-notifications]="notifications().length > 0">
                <i class="bi bi-bell"></i>
                @if (notifications().length > 0) {
                  <span class="notification-badge">{{ notifications().length }}</span>
                }
              </button>
              <div class="dropdown-menu dropdown-menu-end">
                <h6 class="dropdown-header">Notifications</h6>
                @for (notification of notifications(); track notification.id) {
                  <div class="dropdown-item notification-item">
                    <div class="notification-content">
                      <div class="notification-title">{{ notification.title }}</div>
                      <div class="notification-text">{{ notification.message }}</div>
                      <div class="notification-time">{{ notification.timestamp | date:'short' }}</div>
                    </div>
                  </div>
                } @empty {
                  <div class="dropdown-item text-center text-muted">
                    No new notifications
                  </div>
                }
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions dropdown">
              <button class="btn btn-primary btn-sm" data-bs-toggle="dropdown">
                <i class="bi bi-plus-lg"></i>
                <span class="d-none d-md-inline ms-1">Quick Action</span>
              </button>
              <div class="dropdown-menu dropdown-menu-end">
                <a class="dropdown-item" (click)="quickAction('new-order')">
                  <i class="bi bi-plus-circle"></i> New Order
                </a>
                <a class="dropdown-item" (click)="quickAction('add-dish')">
                  <i class="bi bi-plus-circle"></i> Add Dish
                </a>
                <a class="dropdown-item" (click)="quickAction('add-user')">
                  <i class="bi bi-person-plus"></i> Add User
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" (click)="quickAction('send-notification')">
                  <i class="bi bi-megaphone"></i> Send Notification
                </a>
              </div>
            </div>

            <!-- User Menu -->
            <div class="user-menu dropdown">
              <button class="btn btn-ghost" data-bs-toggle="dropdown">
                <div class="user-avatar-small">
                  <i class="bi bi-person-circle"></i>
                </div>
                <span class="d-none d-md-inline ms-2">Admin</span>
                <i class="bi bi-chevron-down ms-1"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-end">
                <a class="dropdown-item" routerLink="/admin/profile">
                  <i class="bi bi-person"></i> Profile
                </a>
                <a class="dropdown-item" routerLink="/admin/system/settings">
                  <i class="bi bi-gear"></i> Settings
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-danger" (click)="logout()">
                  <i class="bi bi-box-arrow-right"></i> Logout
                </a>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
      background-color: #f8f9fa;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 280px;
      background: white;
      border-right: 1px solid #e9ecef;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      height: 100vh;
      z-index: 1000;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .brand i {
      font-size: 1.5rem;
    }

    .sidebar-toggle {
      border: none;
      background: transparent;
      padding: 0.25rem;
      border-radius: 4px;
      color: #6c757d;
    }

    .sidebar-toggle:hover {
      background-color: #f8f9fa;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: #495057;
      text-decoration: none;
      transition: all 0.2s;
      margin: 0 0.5rem;
      border-radius: 8px;
      gap: 0.75rem;
    }

    .nav-link:hover {
      background-color: #f8f9fa;
      color: #0d6efd;
    }

    .nav-link.active {
      background-color: #e7f1ff;
      color: #0d6efd;
      font-weight: 500;
    }

    .nav-link i {
      width: 20px;
      text-align: center;
    }

    .nav-group-header {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: #495057;
      cursor: pointer;
      transition: all 0.2s;
      margin: 0 0.5rem;
      border-radius: 8px;
      gap: 0.75rem;
    }

    .nav-group-header:hover {
      background-color: #f8f9fa;
    }

    .nav-group-header.expanded {
      color: #0d6efd;
    }

    .group-chevron {
      margin-left: auto;
      transition: transform 0.2s;
    }

    .nav-group-header.expanded .group-chevron {
      transform: rotate(180deg);
    }

    .nav-group-children {
      margin-left: 1rem;
    }

    .nav-link.child {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .sidebar-footer {
      border-top: 1px solid #e9ecef;
      padding: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      font-size: 2rem;
      color: #6c757d;
    }

    .user-name {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .user-role {
      font-size: 0.8rem;
      color: #6c757d;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
      min-height: 100vh;
      width: calc(100% - 280px);
    }

    .main-content.sidebar-collapsed {
      margin-left: 70px;
      width: calc(100% - 70px);
    }

    .top-header {
      background: white;
      border-bottom: 1px solid #e9ecef;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .search-box {
      position: relative;
      width: 300px;
    }

    .search-box i {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }

    .search-box input {
      padding-left: 2.5rem;
      border: 1px solid #dee2e6;
      border-radius: 20px;
    }

    .btn-ghost {
      background: transparent;
      border: none;
      padding: 0.5rem;
      border-radius: 8px;
      position: relative;
    }

    .btn-ghost:hover {
      background-color: #f8f9fa;
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #dc3545;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-avatar-small {
      font-size: 1.5rem;
      color: #6c757d;
    }

    .page-content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
      background-color: #f8f9fa;
      min-height: calc(100vh - 73px); /* Adjust for header height */
    }
    
    /* Ensure proper spacing for admin pages */
    .page-content > * {
      max-width: 100%;
    }
    
    /* Fix container alignment */
    .container-fluid {
      padding-left: 0;
      padding-right: 0;
    }

    .breadcrumb {
      background: transparent;
      padding: 0;
    }

    .breadcrumb-item a {
      color: #6c757d;
      text-decoration: none;
    }

    .breadcrumb-item a:hover {
      color: #0d6efd;
    }

    .notification-item {
      max-width: 300px;
      white-space: normal;
    }

    .notification-title {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .notification-text {
      font-size: 0.8rem;
      color: #6c757d;
      margin-top: 0.25rem;
    }

    .notification-time {
      font-size: 0.7rem;
      color: #adb5bd;
      margin-top: 0.25rem;
    }

    /* Mobile Styles */
    @media (max-width: 991px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.show {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
      }

      .search-box {
        width: 200px;
      }
    }

    @media (max-width: 576px) {
      .search-box {
        display: none;
      }
      
      .page-content {
        padding: 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  private router = inject(Router);
  
  sidebarCollapsed = signal(false);
  expandedGroups = signal<string[]>(['orders', 'menu']);
  currentRoute = signal('');
  breadcrumbs = signal<any[]>([]);
  globalSearch = '';
  
  notifications = signal([
    {
      id: 1,
      title: 'Low Stock Alert',
      message: 'Rice inventory running low',
      timestamp: new Date(),
      type: 'warning'
    },
    {
      id: 2,
      title: 'New Order',
      message: 'Order #1234 received',
      timestamp: new Date(),
      type: 'info'
    }
  ]);

  navigationItems: NavigationItem[] = [
    {
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      route: '/admin/dashboard'
    },
    {
      icon: 'bi-box-seam',
      label: 'Orders',
      route: 'orders',
      badge: '28',
      children: [
        { icon: 'bi-list-ul', label: 'All Orders', route: '/admin/orders' },
        { icon: 'bi-arrow-repeat', label: 'Bulk Operations', route: '/admin/orders/bulk-operations' }
      ]
    },
    {
      icon: 'bi-calendar-week',
      label: 'Subscriptions',
      route: 'subscriptions',
      children: [
        { icon: 'bi-list', label: 'All Subscriptions', route: '/admin/subscriptions' },
        { icon: 'bi-calendar-plus', label: 'Meal Plans', route: '/admin/subscriptions/plans' }
      ]
    },
    {
      icon: 'bi-menu-app',
      label: 'Menu',
      route: 'menu',
      children: [
        { icon: 'bi-grid-3x3', label: 'Menu Overview', route: '/admin/menu' },
        { icon: 'bi-plus-square', label: 'Manage Dishes', route: '/admin/menu/dishes' }
      ]
    },
    {
      icon: 'bi-truck',
      label: 'Delivery',
      route: '/admin/delivery'
    },
    {
      icon: 'bi-credit-card',
      label: 'Payments',
      route: '/admin/payments'
    },
    {
      icon: 'bi-graph-up',
      label: 'Analytics',
      route: '/admin/analytics'
    },
    {
      icon: 'bi-people',
      label: 'Users',
      route: '/admin/users'
    },
    {
      icon: 'bi-megaphone',
      label: 'Marketing',
      route: '/admin/marketing'
    },
    {
      icon: 'bi-boxes',
      label: 'Inventory',
      route: '/admin/inventory',
      badge: '5'
    },
    {
      icon: 'bi-gear',
      label: 'System',
      route: '/admin/system',
      roles: ['ADMIN']
    }
  ];

  ngOnInit() {
    // Subscribe to route changes for breadcrumbs
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => event as NavigationEnd)
      )
      .subscribe(event => {
        this.currentRoute.set(event.url);
        this.updateBreadcrumbs(event.url);
      });
  }

  toggleSidebar() {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleNavGroup(groupRoute: string) {
    const expanded = this.expandedGroups();
    const index = expanded.indexOf(groupRoute);
    
    if (index > -1) {
      this.expandedGroups.set(expanded.filter(g => g !== groupRoute));
    } else {
      this.expandedGroups.set([...expanded, groupRoute]);
    }
  }

  private updateBreadcrumbs(url: string) {
    const segments = url.split('/').filter(segment => segment);
    const breadcrumbs = [];
    
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      const route = '/' + segments.slice(0, i + 1).join('/');
      const isLast = i === segments.length - 1;
      
      breadcrumbs.push({
        label: this.formatBreadcrumbLabel(segment),
        route: isLast ? null : route,
        active: isLast
      });
    }
    
    this.breadcrumbs.set(breadcrumbs);
  }

  private formatBreadcrumbLabel(segment: string): string {
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  }

  quickAction(action: string) {
    console.log('Quick action:', action);
    // Implement quick actions
  }

  logout() {
    console.log('Logging out...');
    this.router.navigate(['/auth/login']);
  }
}
