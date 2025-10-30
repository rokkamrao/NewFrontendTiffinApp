import { Component, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RoutesRecognized } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { ImageService } from './core/services/image.service';
import { FaviconService } from './core/services/favicon.service';

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
  logoUrl = '';

  constructor(
    private router: Router,
    public imageService: ImageService,
    private faviconService: FaviconService
  ) {
    console.log('[AppComponent] Constructed');
    
    // Initialize logo URL
    this.logoUrl = this.imageService.getLogo();
    
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('[Router] NavigationStart to', event.url);
      } else if (event instanceof RoutesRecognized) {
        console.log('[Router] RoutesRecognized', event.urlAfterRedirects);
      } else if (event instanceof NavigationEnd) {
        console.log('[Router] NavigationEnd at', event.urlAfterRedirects);
        // Hide header/nav on splash and onboarding
        this.hideShell = ['/splash', '/onboarding'].includes(event.urlAfterRedirects);
      } else if (event instanceof NavigationCancel) {
        console.warn('[Router] NavigationCancel:', event.reason);
      } else if (event instanceof NavigationError) {
        console.error('[Router] NavigationError:', event.error);
      }
    });
  }

  ngOnInit() {
    console.log('[AppComponent] ngOnInit called');
    
    // Initialize favicon in browser only
    if (isPlatformBrowser(this.platformId)) {
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

  // Keep parity with App (standalone root) so template references resolve in tooling
  goToAccount(event?: Event) {
    if (event) event.preventDefault();
    const loggedIn = typeof window !== 'undefined' && !!window.localStorage && window.localStorage.getItem('isLoggedIn') === 'true';
    this.router.navigate([ loggedIn ? '/account' : '/auth/signup' ]);
  }

  goToHome(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/home']);
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
