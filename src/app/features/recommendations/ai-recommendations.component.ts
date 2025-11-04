import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecommendationService, DishRecommendation, RecommendationRequest } from './recommendation.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-recommendations bg-white rounded-lg shadow-lg p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800 flex items-center">
          <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          AI-Powered Recommendations
        </h2>
        
        <div class="flex space-x-2">
          <select [(ngModel)]="selectedRecommendationType" 
                  (ngModelChange)="loadRecommendations()"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="personalized">Personalized</option>
            <option value="trending">Trending</option>
            <option value="similar-users">Similar Users</option>
            <option value="price-optimized">Price Optimized</option>
            <option value="healthy">Healthy Options</option>
            <option value="weather-based">Weather Based</option>
          </select>
          
          <button (click)="refreshRecommendations()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Generating AI recommendations...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-red-700">{{ error }}</span>
        </div>
      </div>

      <!-- Filters -->
      <div *ngIf="!isLoading && selectedRecommendationType === 'personalized'" 
           class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold mb-3">Customize Your Experience</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
            <select [(ngModel)]="filters.budgetRange" 
                    (ngModelChange)="loadRecommendations()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Any Budget</option>
              <option value="budget">Budget (₹0-200)</option>
              <option value="mid">Mid-range (₹200-500)</option>
              <option value="premium">Premium (₹500+)</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
            <select [(ngModel)]="filters.dietaryPreference" 
                    (ngModelChange)="loadRecommendations()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten Free</option>
              <option value="keto">Keto</option>
              <option value="low-carb">Low Carb</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Order Time</label>
            <select [(ngModel)]="filters.orderTime" 
                    (ngModelChange)="loadRecommendations()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Any Time</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Recommendations Grid -->
      <div *ngIf="!isLoading && recommendations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let dish of recommendations; trackBy: trackByDishId" 
             class="recommendation-card bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          
          <!-- Image -->
          <div class="relative h-48 bg-gray-200">
            <img *ngIf="dish.imageUrl" 
                 [src]="dish.imageUrl" 
                 [alt]="dish.dishName"
                 class="w-full h-full object-cover">
            <div *ngIf="!dish.imageUrl" 
                 class="w-full h-full flex items-center justify-center text-gray-400">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            
            <!-- AI Score Badge -->
            <div class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              AI: {{ (dish.score * 100).toFixed(0) }}%
            </div>
            
            <!-- Availability Badge -->
            <div *ngIf="!dish.isAvailable" 
                 class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Unavailable
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-lg font-semibold text-gray-800 line-clamp-2">{{ dish.dishName }}</h3>
              <div class="flex items-center ml-2">
                <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="text-sm text-gray-600">{{ dish.rating?.toFixed(1) || 'New' }}</span>
              </div>
            </div>

            <p *ngIf="dish.description" class="text-gray-600 text-sm mb-3 line-clamp-2">
              {{ dish.description }}
            </p>

            <!-- Price and Delivery Info -->
            <div class="flex items-center justify-between mb-3">
              <div class="text-lg font-bold text-gray-800">₹{{ dish.price }}</div>
              <div *ngIf="dish.estimatedDeliveryTime" class="text-sm text-gray-500">
                {{ dish.estimatedDeliveryTime }} mins
              </div>
            </div>

            <!-- AI Reasons -->
            <div *ngIf="dish.reasons && dish.reasons.length > 0" class="mb-3">
              <div class="text-xs font-medium text-blue-600 mb-1">Why we recommend this:</div>
              <div class="flex flex-wrap gap-1">
                <span *ngFor="let reason of dish.reasons.slice(0, 2)" 
                      class="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {{ reason }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2">
              <button (click)="addToCart(dish)" 
                      [disabled]="!dish.isAvailable"
                      class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                Add to Cart
              </button>
              
              <button (click)="toggleLike(dish)" 
                      class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      [class.text-red-500]="false"
                      [class.border-red-300]="false">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && recommendations.length === 0" 
           class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9.172 16.172a4 4 0 015.656 0M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
        <p class="text-gray-500">Try adjusting your filters or check back later for new recommendations.</p>
      </div>

      <!-- Load More Button -->
      <div *ngIf="!isLoading && recommendations.length > 0 && hasMore" 
           class="text-center mt-6">
        <button (click)="loadMoreRecommendations()"
                class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Load More Recommendations
        </button>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .recommendation-card {
      animation: fadeInUp 0.3s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AiRecommendationsComponent implements OnInit {
  @Input() userId?: number;
  @Input() showFilters = true;
  @Input() maxRecommendations = 12;
  @Output() dishSelected = new EventEmitter<DishRecommendation>();
  @Output() dishAddedToCart = new EventEmitter<DishRecommendation>();

  recommendations: DishRecommendation[] = [];
  isLoading = false;
  error: string | null = null;
  hasMore = false;
  
  selectedRecommendationType = 'personalized';
  filters = {
    budgetRange: '',
    dietaryPreference: '',
    orderTime: '',
    location: '',
    weatherCondition: ''
  };

  constructor(
    private recommendationService: RecommendationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRecommendations();
  }

  loadRecommendations() {
    this.isLoading = true;
    this.error = null;
    
    const request: RecommendationRequest = {
      userId: this.userId || this.authService.getCurrentUserId(),
      limit: this.maxRecommendations,
      ...this.filters,
      dietaryPreferences: this.filters.dietaryPreference ? [this.filters.dietaryPreference] : undefined
    };

    let observable;
    
    switch (this.selectedRecommendationType) {
      case 'trending':
        observable = this.recommendationService.getTrendingRecommendations(request.limit);
        break;
      case 'similar-users':
        observable = this.recommendationService.getSimilarUserRecommendations(request);
        break;
      case 'price-optimized':
        observable = this.recommendationService.getPriceOptimizedRecommendations(request);
        break;
      case 'healthy':
        observable = this.recommendationService.getHealthyRecommendations(request);
        break;
      case 'weather-based':
        observable = this.recommendationService.getWeatherBasedRecommendations(request);
        break;
      default:
        observable = this.recommendationService.getPersonalizedRecommendations(request);
    }

    observable.subscribe({
      next: (data) => {
        this.recommendations = data;
        this.hasMore = data.length === this.maxRecommendations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
        this.error = 'Failed to load recommendations. Please try again.';
        this.isLoading = false;
      }
    });
  }

  refreshRecommendations() {
    this.loadRecommendations();
  }

  loadMoreRecommendations() {
    // Implementation for pagination
    this.hasMore = false; // Simplified for now
  }

  addToCart(dish: DishRecommendation) {
    if (!dish.isAvailable) return;
    
    // Record interaction
    this.recommendationService.recordInteraction(dish.dishId, 'add_to_cart').subscribe();
    
    // Emit event
    this.dishAddedToCart.emit(dish);
    
    // Show success message (you can integrate with a toast service)
    console.log(`Added ${dish.dishName} to cart`);
  }

  toggleLike(dish: DishRecommendation) {
    const action = (dish as any).isLiked ? 'dislike' : 'like';
    (dish as any).isLiked = !(dish as any).isLiked;
    
    this.recommendationService.recordInteraction(dish.dishId, action).subscribe();
  }

  trackByDishId(index: number, dish: DishRecommendation): number {
    return dish.dishId;
  }
}