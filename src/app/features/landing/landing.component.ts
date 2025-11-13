import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthUtilsService } from '../../core/services/auth-utils.service';
import { MenuService } from '../../core/services/menu.service';
import { ApiService } from '../../core/services/api.service';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  rating: number;
  tags: string[];
}

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  comment: string;
  image: string;
  location: string;
}

interface Language {
  code: string;
  name: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private authUtils = inject(AuthUtilsService);
  private menuService = inject(MenuService);
  private apiService = inject(ApiService);

  currentLocation = 'Hyderabad';
  selectedLanguage = 'en';
  
  languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'te', name: 'తెలుగు' }
  ];

  // Newsletter signup
  emailAddress = '';
  isNewsletterLoading = false;
  newsletterMessage = '';

  // Featured menu items from real API
  featuredMenuItems: MenuItem[] = [];

  // Customer testimonials from real API
  testimonials: Testimonial[] = [];

  currentTestimonialIndex = 0;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Auto-rotate testimonials
      setInterval(() => {
        this.nextTestimonial();
      }, 5000);
      
      // Load featured menu items from real API
      this.loadFeaturedMenuItems();
      
      // Load testimonials from real API  
      this.loadTestimonials();
    }
  }

  loadFeaturedMenuItems() {
    console.log('[LandingComponent] Loading featured menu items from API');
    this.menuService.list().subscribe(dishes => {
      console.log('[LandingComponent] Received dishes:', dishes.length);
      // Convert dishes to MenuItem format and take first 4 as featured
      this.featuredMenuItems = dishes.slice(0, 4).map(dish => ({
        id: typeof dish.id === 'string' ? parseInt(dish.id) : dish.id,
        name: dish.name,
        description: dish.description || '',
        price: dish.price,
        image: dish.imageUrl || '🍽️', // Default emoji if no image
        isVeg: dish.isVegetarian || false,
        rating: dish.rating || 4.5,
        tags: dish.tags || []
      }));
      console.log('[LandingComponent] Featured menu items loaded:', this.featuredMenuItems.length);
    });
  }

  loadTestimonials() {
    console.log('[LandingComponent] Loading testimonials from API');
    this.apiService.get<Testimonial[]>('/testimonials').subscribe({
      next: (testimonials) => {
        console.log('[LandingComponent] Received testimonials:', testimonials);
        this.testimonials = testimonials;
        console.log('[LandingComponent] Testimonials loaded:', this.testimonials.length);
      },
      error: (error) => {
        console.error('[LandingComponent] Error loading testimonials:', error);
        // Fallback to empty array if API fails
        this.testimonials = [];
      }
    });
  }

  // Navigation methods with authentication checks
  goToMenu(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/menu']);
  }

  goToSubscription(event?: Event) {
    if (event) event.preventDefault();
    
    // Allow everyone to view subscription plans - authentication only required for purchasing
    console.log('[LandingComponent] Navigating to subscription plans page');
    this.router.navigate(['/subscription']);
  }

  goToAuth(event?: Event) {
    if (event) event.preventDefault();
    
    // Check if user is already authenticated
    if (this.authUtils.isAuthenticated()) {
      console.log('[LandingComponent] User already authenticated, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('[LandingComponent] Redirecting to signup');
      this.router.navigate(['/auth/signup']);
    }
  }

  goToLogin(event?: Event) {
    if (event) event.preventDefault();
    
    // Check if user is already authenticated
    if (this.authUtils.isAuthenticated()) {
      console.log('[LandingComponent] User already authenticated, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('[LandingComponent] Redirecting to login');
      this.router.navigate(['/auth/login']);
    }
  }

  // Check if user should be redirected to protected areas
  goToAccount(event?: Event) {
    if (event) event.preventDefault();
    
    if (this.authUtils.isAuthenticated()) {
      console.log('[LandingComponent] User authenticated, navigating to account');
      this.router.navigate(['/account']);
    } else {
      console.log('[LandingComponent] User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: encodeURIComponent('/account') } 
      });
    }
  }

  // Language selection
  changeLanguage(langCode: string) {
    this.selectedLanguage = langCode;
    // In a real app, you'd integrate with Angular i18n
    console.log('Language changed to:', langCode);
  }

  // Testimonial carousel
  nextTestimonial() {
    this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }

  previousTestimonial() {
    this.currentTestimonialIndex = this.currentTestimonialIndex === 0 
      ? this.testimonials.length - 1 
      : this.currentTestimonialIndex - 1;
  }

  goToTestimonial(index: number) {
    this.currentTestimonialIndex = index;
  }

  // Newsletter signup
  async subscribeNewsletter() {
    if (!this.emailAddress || this.isNewsletterLoading) return;

    this.isNewsletterLoading = true;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.newsletterMessage = 'Thank you for subscribing! Check your email for a welcome message.';
      this.emailAddress = '';
    } catch (error) {
      this.newsletterMessage = 'Something went wrong. Please try again.';
    } finally {
      this.isNewsletterLoading = false;
      setTimeout(() => {
        this.newsletterMessage = '';
      }, 5000);
    }
  }

  // Utility methods
  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  scrollToSection(sectionId: string, event?: Event) {
    if (event) event.preventDefault();
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}