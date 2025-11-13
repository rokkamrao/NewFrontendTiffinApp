import { Component, signal, PLATFORM_ID, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { ImageService } from './core/services/image.service';
import { FaviconService } from './core/services/favicon.service';
import { AuthService } from './core/services/auth.service';
import { UserProfile } from './core/models/index';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, OnDestroy {
  protected readonly title = signal('tiffin-app');
  hideShell = false;
  private platformId = inject(PLATFORM_ID);
  logoUrl = '';

  // 🎯 CENTRALIZED AUTH STATE
  public currentUser: UserProfile | null = null;
  public isLoggedIn = false;
  private authSubscription?: Subscription;

  constructor(
    public router: Router,
    public imageService: ImageService,
    private faviconService: FaviconService,
    private authService: AuthService
  ) {
    console.log('[App] 🚀 Constructed with centralized auth');
    
    // Initialize logo URL
    this.logoUrl = this.imageService.getLogo();
    console.log('[App] Logo URL initialized:', this.logoUrl);
    
    // Only run navigation logic in browser (not during SSR) and only on initial load
    if (isPlatformBrowser(this.platformId)) {
      const currentUrl = window.location.pathname;
      // Only redirect to home if we're at the root path (not on other pages)
      if (currentUrl === '/' || currentUrl === '') {
        console.log('[App] Root path detected, navigating to /home');
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    }
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEvent = event as NavigationEnd;
      console.log('[Router] NavigationEnd at', navEvent.urlAfterRedirects);
        // Hide header/nav on splash, onboarding, and auth screens
        this.hideShell = ['/splash', '/onboarding', '/auth/login', '/auth/verify-otp', '/auth/signup'].includes(navEvent.urlAfterRedirects);
    });
  }

  ngOnInit() {
    console.log('[App] ngOnInit called');
    
    // 🎯 SUBSCRIBE TO AUTH STATE CHANGES
    this.authSubscription = this.authService.user$.subscribe(user => {
      console.log('[App] 🔄 Auth state updated:', user ? `Logged in as ${user.name}` : 'Not logged in');
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
    
    // Initialize favicon in browser only
    if (isPlatformBrowser(this.platformId)) {
      console.log('[App] Platform is browser, initializing favicon');
      this.faviconService.initFavicon();
    } else {
      console.log('[App] Platform is server, skipping favicon');
    }
  }

  ngOnDestroy() {
    // 🎯 CLEANUP AUTH SUBSCRIPTION
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // 🎯 NAVIGATION HELPERS
  goToAccount(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate([ this.isLoggedIn ? '/account' : '/auth/login' ]);
  }
  
  goToHome(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/home']);
  }
  
  goToMenu(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/menu']);
  }
  
  goToOrders(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/orders']);
  }

  goToLogin(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/auth/login']);
  }

  goToAuth(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/auth/signup']);
  }

  // 🎯 CENTRALIZED LOGOUT
  logout() {
    console.log('[App] 🚪 Logout triggered');
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // 🎯 USER DISPLAY HELPERS
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Guest';
    return this.currentUser.fullName || this.currentUser.name || 'User';
  }

  onLogoLoad(event: Event) {
    console.log('[App] Logo loaded successfully');
    const imgElement = event.target as HTMLImageElement;
    const defaultLogo = document.getElementById('default-logo');
    if (imgElement && defaultLogo) {
      console.log('[App] Showing custom logo, hiding default T');
      // Smooth transition: fade in custom logo, fade out default
      imgElement.style.opacity = '1';
      defaultLogo.style.opacity = '0';
    }
  }

  onLogoError(event: Event) {
    console.log('[App] Logo failed to load, showing default T');
    const imgElement = event.target as HTMLImageElement;
    const defaultLogo = document.getElementById('default-logo');
    if (imgElement && defaultLogo) {
      console.log('[App] Hiding custom logo, showing default T');
      // Smooth transition: fade out custom logo, fade in default
      imgElement.style.opacity = '0';
      defaultLogo.style.opacity = '1';
    }
  }
}
