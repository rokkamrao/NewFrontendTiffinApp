import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthUtilsService } from '../../core/services/auth-utils.service';

@Component({
  selector: 'app-auth-redirect',
  standalone: true,
  template: `
    <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Redirecting...</p>
      </div>
    </div>
  `
})
export class AuthRedirectComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authUtils = inject(AuthUtilsService);

  ngOnInit() {
    // Check authentication and redirect accordingly
    const isAuthenticated = this.authUtils.isAuthenticated();
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    
    if (isAuthenticated) {
      // User is authenticated, redirect to return URL or home
      const targetUrl = returnUrl ? decodeURIComponent(returnUrl) : '/home';
      console.log('[AuthRedirect] User authenticated, redirecting to:', targetUrl);
      this.router.navigate([targetUrl]);
    } else {
      // User is not authenticated, redirect to landing
      console.log('[AuthRedirect] User not authenticated, redirecting to landing');
      this.router.navigate(['/landing']);
    }
  }
}