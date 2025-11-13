import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 50vh;">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Redirecting to your dashboard...</p>
      </div>
    </div>
  `
})
export class DashboardRedirectComponent implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.redirectToDashboard();
  }

  private redirectToDashboard(): void {
    // Skip localStorage check during SSR
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[DashboardRedirect] SSR detected, redirecting to home');
      this.router.navigate(['/home']);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('[DashboardRedirect] No token found, redirecting to login');
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/dashboard' } });
        return;
      }

      // Decode JWT token to get user role
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload?.role;
      
      console.log('[DashboardRedirect] User role:', userRole);

      switch (userRole) {
        case 'ADMIN':
          console.log('[DashboardRedirect] Redirecting to admin dashboard');
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'DELIVERY_USER':
          console.log('[DashboardRedirect] Redirecting to delivery dashboard');
          this.router.navigate(['/delivery/dashboard']);
          break;
        default:
          // Regular customer - redirect to home
          console.log('[DashboardRedirect] Regular user, redirecting to home');
          this.router.navigate(['/home']);
          break;
      }
    } catch (error) {
      console.error('[DashboardRedirect] Error decoding token:', error);
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/dashboard' } });
    }
  }
}