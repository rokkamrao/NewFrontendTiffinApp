import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class FaviconService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private imageService: ImageService
  ) {}

  /**
   * Update the favicon dynamically
   */
  updateFavicon(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[FaviconService] Not in browser, skipping');
      return;
    }

    const faviconUrl = this.imageService.getFavicon();
    console.log('[FaviconService] Updating favicon to:', faviconUrl.substring(0, 100));
    
    // Get or create the favicon link element
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    
    if (!link) {
      console.log('[FaviconService] Creating new favicon link element');
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    // Update the href with cache busting
    if (faviconUrl.startsWith('data:')) {
      // Base64 data URL - use directly
      link.href = faviconUrl;
      console.log('[FaviconService] Set base64 favicon');
    } else {
      // Regular URL - add timestamp to force refresh
      link.href = `${faviconUrl}?t=${Date.now()}`;
      console.log('[FaviconService] Set URL favicon with cache bust');
    }
    
    // Also update the type attribute based on the image
    if (faviconUrl.includes('.png') || faviconUrl.startsWith('data:image/png')) {
      link.type = 'image/png';
    } else if (faviconUrl.includes('.svg') || faviconUrl.startsWith('data:image/svg')) {
      link.type = 'image/svg+xml';
    } else {
      link.type = 'image/x-icon';
    }

    console.log('[FaviconService] Favicon updated successfully');
  }

  /**
   * Initialize favicon on app load
   */
  initFavicon(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[FaviconService] SSR detected, skipping favicon initialization');
      return;
    }

    console.log('[FaviconService] Initializing favicon service');
    this.updateFavicon();
    
    // Subscribe to image updates
    this.imageService.onImageUpdate$.subscribe(() => {
      console.log('[FaviconService] Image update detected, refreshing favicon');
      this.updateFavicon();
    });
  }
}
