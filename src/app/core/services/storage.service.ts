import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Safe localStorage wrapper that works with SSR
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Get item from localStorage
   */
  getItem(key: string): string | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  setItem(key: string, value: string): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set item in localStorage: ${key}`, error);
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove item from localStorage: ${key}`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage', error);
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    return this.isBrowser;
  }
}
