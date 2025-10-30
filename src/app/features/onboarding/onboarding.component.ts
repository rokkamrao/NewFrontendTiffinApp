import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OnboardingSlide {
  title: string;
  description: string;
  image: string;
  icon: string;
}

interface City {
  name: string;
  available: boolean;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  currentStep: 'carousel' | 'location' | 'city' = 'carousel';
  currentSlide = 0;
  locationGranted = false;
  selectedCity: string = '';
  private platformId = inject(PLATFORM_ID);
  
  slides: OnboardingSlide[] = [
    {
      title: 'Healthy Food, Daily',
      description: 'Fresh, nutritious meals delivered to your doorstep every day. Choose from vegetarian, non-veg, vegan, and special diet options.',
      image: '🥗',
      icon: '🍱'
    },
    {
      title: 'Eco-Friendly Packaging',
      description: 'Reusable smart tiffins with QR tracking. Help the environment while enjoying your meals.',
      image: '♻️',
      icon: '🌱'
    }
  ];

  cities: City[] = [
    { name: 'Hyderabad', available: true },
    { name: 'Bangalore', available: true },
    { name: 'Mumbai', available: true },
    { name: 'Pune', available: true },
    { name: 'Delhi', available: false },
    { name: 'Chennai', available: false }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('[Onboarding] ngOnInit start');
    // Mark that user has seen onboarding (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    
    // Auto-advance slides
    setInterval(() => {
      if (this.currentStep === 'carousel') {
        console.log('[Onboarding] Auto-advance slide');
        this.nextSlide();
      }
    }, 4000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  proceedToLocation() {
    console.log('[Onboarding] Proceed to location');
    this.currentStep = 'location';
  }

  skipOnboarding() {
    console.log('[Onboarding] Skip onboarding -> login');
    this.router.navigate(['/auth/login']);
  }

  requestLocation() {
    console.log('[Onboarding] Requesting geolocation');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationGranted = true;
          this.currentStep = 'city';
          console.log('Location:', position.coords);
        },
        (error) => {
          console.error('Location error:', error);
          alert('Location permission denied. Please select your city manually.');
          this.currentStep = 'city';
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      this.currentStep = 'city';
    }
  }

  selectCity(city: City) {
    console.log('[Onboarding] Select city:', city.name, 'available:', city.available);
    if (!city.available) {
      alert(`Sorry, we're not available in ${city.name} yet. We'll notify you when we launch!`);
      return;
    }
    this.selectedCity = city.name;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selectedCity', city.name);
    }
    this.router.navigate(['/auth/login']);
  }

  notifyMe(cityName: string) {
    alert(`We'll notify you when we launch in ${cityName}!`);
  }
}
