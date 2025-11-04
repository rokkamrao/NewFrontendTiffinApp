import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DishRecommendation {
  dishId: number;
  dishName: string;
  score: number;
  reasons: string[];
  cuisineType: string;
  price: number;
  rating: number;
  imageUrl?: string;
  description?: string;
  estimatedDeliveryTime?: number;
  isAvailable: boolean;
  confidence?: number;
  modelType?: string;
}

export interface RecommendationRequest {
  userId?: number;
  location?: string;
  orderTime?: string;
  weatherCondition?: string;
  budgetRange?: string;
  dietaryPreferences?: string[];
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly baseUrl = `${environment.apiUrl}/api/recommendations`;

  constructor(private http: HttpClient) {}

  /**
   * Get personalized dish recommendations for a user
   */
  getPersonalizedRecommendations(request: RecommendationRequest): Observable<DishRecommendation[]> {
    return this.http.post<DishRecommendation[]>(`${this.baseUrl}/personalized`, request);
  }

  /**
   * Get trending dishes recommendations
   */
  getTrendingRecommendations(limit: number = 10): Observable<DishRecommendation[]> {
    return this.http.get<DishRecommendation[]>(`${this.baseUrl}/trending?limit=${limit}`);
  }

  /**
   * Get recommendations based on similar users
   */
  getSimilarUserRecommendations(request: RecommendationRequest): Observable<DishRecommendation[]> {
    return this.http.post<DishRecommendation[]>(`${this.baseUrl}/similar-users`, request);
  }

  /**
   * Get price-optimized recommendations
   */
  getPriceOptimizedRecommendations(request: RecommendationRequest): Observable<DishRecommendation[]> {
    return this.http.post<DishRecommendation[]>(`${this.baseUrl}/price-optimized`, request);
  }

  /**
   * Get healthy food recommendations
   */
  getHealthyRecommendations(request: RecommendationRequest): Observable<DishRecommendation[]> {
    return this.http.post<DishRecommendation[]>(`${this.baseUrl}/healthy`, request);
  }

  /**
   * Get weather-based recommendations
   */
  getWeatherBasedRecommendations(request: RecommendationRequest): Observable<DishRecommendation[]> {
    return this.http.post<DishRecommendation[]>(`${this.baseUrl}/weather-based`, request);
  }

  /**
   * Get recommendations for similar dishes
   */
  getSimilarDishes(dishId: number, limit: number = 5): Observable<DishRecommendation[]> {
    return this.http.get<DishRecommendation[]>(`${this.baseUrl}/similar-dishes/${dishId}?limit=${limit}`);
  }

  /**
   * Record user interaction with recommendation
   */
  recordInteraction(dishId: number, action: 'view' | 'add_to_cart' | 'order' | 'like' | 'dislike'): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/interaction`, {
      dishId,
      action,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get user's recommendation preferences
   */
  getUserPreferences(): Observable<any> {
    return this.http.get(`${this.baseUrl}/preferences`);
  }

  /**
   * Update user's recommendation preferences
   */
  updateUserPreferences(preferences: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/preferences`, preferences);
  }

  /**
   * Get recommendation analytics for admin
   */
  getRecommendationAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics`);
  }
}