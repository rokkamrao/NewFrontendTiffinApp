import { Injectable, afterNextRender, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

interface ImageMetadata {
  id: number;
  filename: string;
  category: string;
  imageId: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  updatedAt: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private imageCache: Map<string, string> = new Map();
  private imageUpdated$ = new Subject<void>();
  private apiUrl = '/api';
  private imagesLoaded = false;
  private loadingInProgress = false;

  constructor(
    private http: HttpClient,
    private injector: Injector
  ) {
    console.log('[ImageService] Constructed');
    // Defer image loading until after hydration completes
    afterNextRender(() => {
      console.log('[ImageService] afterNextRender triggered, loading images');
      this.loadAllImages();
    }, { injector: this.injector });
  }

  /**
   * Observable that emits when images are updated
   */
  get onImageUpdate$() {
    return this.imageUpdated$.asObservable();
  }

  /**
   * Load all images from API and cache them
   */
  private loadAllImages() {
    if (this.imagesLoaded || this.loadingInProgress) {
      console.log('[ImageService] loadAllImages skipped - already loaded or in progress');
      return;
    }
    
    this.loadingInProgress = true;
    console.log('[ImageService] Loading all images from API...');
    
    this.http.get<ImageMetadata[]>(`${this.apiUrl}/images/all`)
      .pipe(
        catchError(error => {
          console.warn('[ImageService] Failed to load images from API:', error);
          this.loadingInProgress = false;
          return of([]);
        })
      )
      .subscribe(images => {
        console.log(`[ImageService] Loaded ${images.length} images from API`);
        this.imagesLoaded = true;
        this.loadingInProgress = false;
        
        // Pre-cache image URLs
        images.forEach(img => {
          const key = `${img.category}/${img.imageId}`;
          this.imageCache.set(key, img.url);
        });
      });
  }

  /**
   * Upload image to API
   */
  uploadImage(file: File, category: string, imageId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('imageId', imageId);

    return this.http.post(`${this.apiUrl}/admin/upload-image`, formData)
      .pipe(
        tap(() => {
          console.log('[ImageService] Image uploaded successfully');
          // Update cache
          const key = `${category}/${imageId}`;
          this.imageCache.set(key, `${this.apiUrl}/images/${category}/${imageId}`);
          // Notify subscribers
          this.imageUpdated$.next();
        })
      );
  }

  /**
   * Get image URL - checks cache first, then constructs API URL
   */
  getImageUrl(category: string, id: string, extension: string = 'jpg'): string {
    const key = `${category}/${id}`;
    
    // Check cache first
    if (this.imageCache.has(key)) {
      return this.imageCache.get(key)!;
    }

    // Return API URL (will 404 if not exists, can handle with onerror in template)
    return `${this.apiUrl}/images/${category}/${id}`;
  }

  /**
   * Get logo URL
   */
  getLogo(): string {
    return this.getImageUrl('branding', 'logo', 'png');
  }

  /**
   * Get logo white URL
   */
  getLogoWhite(): string {
    return this.getImageUrl('branding', 'logo-white', 'png');
  }

  /**
   * Get favicon URL
   */
  getFavicon(): string {
    const key = 'branding/favicon';
    
    if (this.imageCache.has(key)) {
      return this.imageCache.get(key)!;
    }

    console.log('[ImageService] Favicon not in cache, using API URL');
    return `${this.apiUrl}/images/branding/favicon`;
  }

  /**
   * Get dish image URL
   */
  getDishImage(dishId: string): string {
    return this.getImageUrl('dishes', dishId, 'jpg');
  }

  /**
   * Get banner image URL
   */
  getBannerImage(bannerId: string): string {
    return this.getImageUrl('banners', bannerId, 'jpg');
  }

  /**
   * Get placeholder image URL - uses data URI to avoid API calls
   */
  getPlaceholderImage(type: 'dish' | 'user'): string {
    // Return a simple gray placeholder as data URI to avoid server requests
    if (type === 'dish') {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3EUser%3C/text%3E%3C/svg%3E';
  }

  /**
   * Check if image exists in cache
   */
  hasImage(category: string, id: string): boolean {
    const key = `${category}/${id}`;
    return this.imageCache.has(key);
  }

  /**
   * Get all uploaded images metadata
   */
  getAllImages(): Observable<ImageMetadata[]> {
    return this.http.get<ImageMetadata[]>(`${this.apiUrl}/images/all`);
  }

  /**
   * Delete image by id
   */
  deleteImage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/images/${id}`)
      .pipe(
        tap(() => {
          console.log('[ImageService] Image deleted');
          this.refresh();
        })
      );
  }

  /**
   * Refresh images from API
   */
  refresh() {
    console.log('[ImageService] Refreshing images from API');
    this.imageCache.clear();
    this.imagesLoaded = false;
    this.loadingInProgress = false;
    this.loadAllImages();
    this.imageUpdated$.next();
  }
}
