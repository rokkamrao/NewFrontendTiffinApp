import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  showContent = false;
  private hasNavigated = false;
  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('[Splash] ngOnInit start');
    
    // Check if user has already seen onboarding (only in browser)
    let hasSeenOnboarding = false;
    if (isPlatformBrowser(this.platformId)) {
      hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
    }
    
    // Show content with animation
    setTimeout(() => {
      this.showContent = true;
      console.log('[Splash] Content shown animation flag set');
    }, 100);

    // Auto-navigate after 2 seconds
    setTimeout(() => {
      if (!this.hasNavigated) {
        this.hasNavigated = true;
        console.log('[Splash] Auto navigating');
        
        if (hasSeenOnboarding) {
          // Skip to dashboard if already onboarded
          this.router.navigate(['/dashboard']);
        } else {
          // First time - go to onboarding
          this.router.navigate(['/onboarding']);
        }
      }
    }, 2000);
  }

  navigateToOnboarding() {
    if (!this.hasNavigated) {
      this.hasNavigated = true;
      console.log('[Splash] navigateToOnboarding invoked');
      this.router.navigate(['/onboarding']).then((ok) => {
        console.log('[Splash] Navigation promise resolved:', ok);
      }).catch((err) => {
        console.error('[Splash] Navigation promise rejected:', err);
      });
    }
  }
}
