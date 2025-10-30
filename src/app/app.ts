import { Component, signal, PLATFORM_ID, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ImageService } from './core/services/image.service';
import { FaviconService } from './core/services/favicon.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('tiffin-app');
  hideShell = false;
  private platformId = inject(PLATFORM_ID);
  logoUrl = '';

  constructor(
    private router: Router,
    public imageService: ImageService,
    private faviconService: FaviconService
  ) {
    console.log('[App] Constructed');
    
    // Initialize logo URL
    this.logoUrl = this.imageService.getLogo();
    
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
    
    // Initialize favicon in browser only
    if (isPlatformBrowser(this.platformId)) {
      console.log('[App] Platform is browser, initializing favicon');
      this.faviconService.initFavicon();
      
      // Images will only load on page refresh, not automatically
      // No subscription to image updates needed
    } else {
      console.log('[App] Platform is server, skipping favicon');
    }
  }

  ngOnDestroy() {
    // No subscriptions to clean up
  }

  // Explicit navigation helpers so clicks are definitely handled
  goToAccount(event?: Event) {
    if (event) event.preventDefault();
    const loggedIn = isPlatformBrowser(this.platformId) && localStorage.getItem('isLoggedIn') === 'true';
    this.router.navigate([ loggedIn ? '/account' : '/auth/signup' ]);
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
