import { Component, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RoutesRecognized } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { ImageService } from './core/services/image.service';
import { FaviconService } from './core/services/favicon.service';
import { AuthUtilsService } from './core/services/auth-utils.service';
import { AuthService } from './core/services/auth.service';
import { UserProfile } from './core/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  protected readonly title = signal('tiffin-app');
  hideShell = false;
  private platformId = inject(PLATFORM_ID);
  private imageUpdateSubscription?: Subscription;
  private authSubscription?: Subscription;
  logoUrl = '';
  
  // Auth-related properties
  isLoggedIn = false;
  currentUser: UserProfile | null = null;

  constructor(
    public router: Router,
    public imageService: ImageService,
    private faviconService: FaviconService,
    public authUtils: AuthUtilsService,
    private authService: AuthService
  ) {
    console.log('[AppComponent] 🚀 Constructor called - Build timestamp:', new Date().toISOString());
    
    // Initialize logo URL
    this.logoUrl = this.imageService.getLogo();
    
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('[Router] NavigationStart to', event.url);
      } else if (event instanceof RoutesRecognized) {
        console.log('[Router] RoutesRecognized', event.urlAfterRedirects);
      } else if (event instanceof NavigationEnd) {
        console.log('[Router] NavigationEnd at', event.urlAfterRedirects);
        // Hide header/nav on splash, onboarding, and landing pages
        this.hideShell = ['/splash', '/onboarding', '/landing'].includes(event.urlAfterRedirects);
      } else if (event instanceof NavigationCancel) {
        console.warn('[Router] NavigationCancel:', event.reason);
      } else if (event instanceof NavigationError) {
        console.error('[Router] NavigationError:', event.error);
      }
    });
  }

  ngOnInit() {
    console.log('[AppComponent] ngOnInit called');
    
    // Make auth service globally accessible for debugging
    if (isPlatformBrowser(this.platformId)) {
      (window as any).authService = this.authService;
      console.log('[AppComponent] AuthService attached to window for debugging');
    }
    
    // Subscribe to auth state changes
    this.authSubscription = this.authService.user$.subscribe((user) => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      console.log('[AppComponent] Auth state updated:', { 
        isLoggedIn: this.isLoggedIn, 
        user: user?.name || user?.phone || 'null',
        hasUser: !!user
      });
    });
    
    // Immediate browser check (client-side only)
    if (isPlatformBrowser(this.platformId)) {
      console.log('[AppComponent] Browser platform detected, performing immediate auth check');
      
      // Check localStorage directly for debugging
      const token = localStorage.getItem('authToken');
      const userProfile = localStorage.getItem('userProfile');
      console.log('[AppComponent] localStorage check:', {
        hasToken: !!token,
        hasUser: !!userProfile,
        tokenValue: token ? 'Present' : 'Missing'
      });
      
      // If we have stored auth data, update state immediately
      if (token && userProfile) {
        try {
          const user = JSON.parse(userProfile);
          console.log('[AppComponent] Found stored auth data, updating state immediately');
          this.currentUser = user;
          this.isLoggedIn = true;
        } catch (error) {
          console.error('[AppComponent] Error parsing stored user profile:', error);
        }
      }
      
      // Initialize favicon in browser only
      setTimeout(() => {
        console.log('[AppComponent] Platform is browser, initializing favicon');
        this.faviconService.initialize();
      }, 100);
    } else {
      console.log('[AppComponent] Platform is server, skipping favicon');
    }
    
    // Validate session on app start (delayed for proper initialization)
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        console.log('[AppComponent] Performing delayed session validation');
        this.authService.validateSession();
      }
    }, 200);
  }
      console.log('[AppComponent] Platform is browser, initializing favicon');
      this.faviconService.initFavicon();
    } else {
      console.log('[AppComponent] Platform is server, skipping favicon');
    }
    
    // Subscribe to image updates
    this.imageUpdateSubscription = this.imageService.onImageUpdate$.subscribe(() => {
      console.log('[AppComponent] Image updated, reloading logo');
      this.logoUrl = this.imageService.getLogo();
      // Force re-render by updating the img src
      this.reloadLogo();
    });
  }

  ngOnDestroy() {
    this.imageUpdateSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  reloadLogo() {
    const customLogo = document.getElementById('custom-logo') as HTMLImageElement;
    const defaultLogo = document.getElementById('default-logo');
    
    if (customLogo) {
      // Reset to loading state
      customLogo.style.display = 'none';
      if (defaultLogo) {
        defaultLogo.style.display = 'flex';
      }
      
      // Update src to trigger reload
      const newUrl = this.imageService.getLogo();
      // Add timestamp to force reload
      customLogo.src = newUrl.includes('data:') ? newUrl : `${newUrl}?t=${Date.now()}`;
    }
  }

  // Navigate to account with authentication check
  goToAccount(event?: Event) {
    if (event) event.preventDefault();
    
    // Use the same auth state as UI display for consistency
    if (this.isLoggedIn) {
      console.log('[AppComponent] User authenticated, navigating to account');
      this.router.navigate(['/account']);
    } else {
      console.log('[AppComponent] User not authenticated, redirecting to login');
      // Redirect to login page for authentication
      this.router.navigate(['/auth/login']);
    }
  }

  goToHome(event?: Event) {
    if (event) event.preventDefault();
    
    // Use the same auth state as UI display for consistency
    if (this.isLoggedIn) {
      console.log('[AppComponent] User authenticated, navigating to dashboard');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('[AppComponent] User not authenticated, redirecting to home');
      this.router.navigate(['/home']);
    }
  }

  logout() {
    console.log('[AppComponent] Logout initiated');
    this.authService.logout();
    
    // Navigate to home page after logout
    this.router.navigate(['/home']).then(() => {
      console.log('[AppComponent] Successfully navigated to home after logout');
    });
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';
    return this.currentUser.name || this.currentUser.phone || 'User';
  }

  goToOrders(event?: Event) {
    if (event) event.preventDefault();
    if (this.isLoggedIn) {
      this.router.navigate(['/orders']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  goToLogin(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/auth/login']);
  }

  goToAuth(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/auth/signup']);
  }

  onLogoLoad(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    const defaultLogo = document.getElementById('default-logo');
    if (imgElement && defaultLogo) {
      imgElement.style.display = 'block';
      defaultLogo.style.display = 'none';
    }
  }

  onLogoError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    const defaultLogo = document.getElementById('default-logo');
    if (imgElement && defaultLogo) {
      imgElement.style.display = 'none';
      defaultLogo.style.display = 'flex';
    }
  }
}
