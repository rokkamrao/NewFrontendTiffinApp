import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminService, AnalyticsData as ApiAnalyticsData } from '../services/admin-real-api.service';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    dailyData: { date: string; amount: number }[];
  };
  orders: {
    total: number;
    growth: number;
    hourlyData: { hour: number; count: number }[];
  };
  customers: {
    total: number;
    new: number;
    retention: number;
  };
  popular: {
    dishes: { name: string; orders: number; revenue: number }[];
    categories: { name: string; percentage: number }[];
  };
  delivery: {
    averageTime: number;
    onTimeRate: number;
    customerSatisfaction: number;
  };
  subscriptions: {
    active: number;
    churnRate: number;
    monthlyRevenue: number;
  };
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analytics-dashboard">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Analytics Dashboard</h1>
          <p class="page-subtitle">Business insights and performance metrics</p>
        </div>
        <div class="header-actions">
          <select class="form-select" [(ngModel)]="selectedPeriod" (change)="loadAnalytics()">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button class="btn btn-outline-primary" (click)="exportReport()">
            <i class="bi bi-download"></i>
            Export Report
          </button>
          <button class="btn btn-primary" (click)="refreshData()">
            <i class="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="key-metrics">
        <div class="row g-4">
          <div class="col-lg-3 col-md-6">
            <div class="metric-card revenue">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="bi bi-currency-rupee"></i>
                </div>
                <div class="metric-trend" [class]="getTrendClass(analytics().revenue.growth)">
                  <i [class]="getTrendIcon(analytics().revenue.growth)"></i>
                  {{ Math.abs(analytics().revenue.growth) }}%
                </div>
              </div>
              <div class="metric-content">
                <h3>₹{{ formatNumber(analytics().revenue.total) }}</h3>
                <p>Total Revenue</p>
              </div>
              <div class="metric-chart">
                <div class="mini-chart">
                  @for (point of analytics().revenue.dailyData.slice(-7); track $index) {
                    <div class="chart-bar" 
                         [style.height]="(point.amount / getMaxRevenue()) * 100 + '%'">
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <div class="metric-card orders">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="bi bi-bag-check"></i>
                </div>
                <div class="metric-trend" [class]="getTrendClass(analytics().orders.growth)">
                  <i [class]="getTrendIcon(analytics().orders.growth)"></i>
                  {{ Math.abs(analytics().orders.growth) }}%
                </div>
              </div>
              <div class="metric-content">
                <h3>{{ formatNumber(analytics().orders.total) }}</h3>
                <p>Total Orders</p>
              </div>
              <div class="metric-chart">
                <div class="mini-chart">
                  @for (point of analytics().orders.hourlyData.slice(-7); track $index) {
                    <div class="chart-bar" 
                         [style.height]="(point.count / getMaxOrders()) * 100 + '%'">
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <div class="metric-card customers">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="bi bi-people"></i>
                </div>
                <div class="metric-value">
                  +{{ analytics().customers.new }}
                </div>
              </div>
              <div class="metric-content">
                <h3>{{ formatNumber(analytics().customers.total) }}</h3>
                <p>Total Customers</p>
              </div>
              <div class="metric-additional">
                <span class="retention-rate">
                  <i class="bi bi-arrow-repeat"></i>
                  {{ analytics().customers.retention }}% retention
                </span>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <div class="metric-card satisfaction">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="bi bi-star-fill"></i>
                </div>
                <div class="metric-value">
                  {{ analytics().delivery.onTimeRate }}%
                </div>
              </div>
              <div class="metric-content">
                <h3>{{ analytics().delivery.customerSatisfaction }}/5</h3>
                <p>Customer Satisfaction</p>
              </div>
              <div class="metric-additional">
                <span class="delivery-time">
                  <i class="bi bi-clock"></i>
                  {{ analytics().delivery.averageTime }}min avg delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="row g-4">
          <!-- Revenue Chart -->
          <div class="col-lg-8">
            <div class="chart-card">
              <div class="chart-header">
                <h5>Revenue Trend</h5>
                <div class="chart-controls">
                  <div class="btn-group" role="group">
                    <button class="btn btn-sm" 
                            [class]="revenueChartType === 'line' ? 'btn-primary' : 'btn-outline-primary'"
                            (click)="revenueChartType = 'line'">
                      Line
                    </button>
                    <button class="btn btn-sm" 
                            [class]="revenueChartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'"
                            (click)="revenueChartType = 'bar'">
                      Bar
                    </button>
                  </div>
                </div>
              </div>
              <div class="chart-body">
                <div class="chart-container">
                  <!-- Mock Chart Display -->
                  <div class="chart-placeholder">
                    <div class="chart-data">
                      @for (point of analytics().revenue.dailyData; track point.date) {
                        <div class="data-point">
                          <div class="point-bar" 
                               [style.height]="(point.amount / getMaxRevenue()) * 200 + 'px'">
                          </div>
                          <div class="point-label">{{ formatDate(point.date) }}</div>
                          <div class="point-value">₹{{ formatNumber(point.amount) }}</div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Distribution -->
          <div class="col-lg-4">
            <div class="chart-card">
              <div class="chart-header">
                <h5>Order Distribution</h5>
              </div>
              <div class="chart-body">
                <div class="donut-chart">
                  <div class="chart-center">
                    <div class="center-value">{{ analytics().orders.total }}</div>
                    <div class="center-label">Total Orders</div>
                  </div>
                  <div class="chart-segments">
                    @for (category of analytics().popular.categories; track category.name) {
                      <div class="segment" 
                           [style.background]="getCategoryColor(category.name)"
                           [style.width]="category.percentage + '%'">
                      </div>
                    }
                  </div>
                </div>
                <div class="chart-legend">
                  @for (category of analytics().popular.categories; track category.name) {
                    <div class="legend-item">
                      <div class="legend-color" [style.background]="getCategoryColor(category.name)"></div>
                      <span class="legend-label">{{ category.name }}</span>
                      <span class="legend-value">{{ category.percentage }}%</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Tables -->
      <div class="performance-section">
        <div class="row g-4">
          <!-- Popular Dishes -->
          <div class="col-lg-6">
            <div class="performance-card">
              <div class="card-header">
                <h5>Top Performing Dishes</h5>
                <button class="btn btn-sm btn-outline-primary" (click)="viewAllDishes()">
                  View All
                </button>
              </div>
              <div class="card-body">
                <div class="dishes-list">
                  @for (dish of analytics().popular.dishes.slice(0, 10); track dish.name) {
                    <div class="dish-item">
                      <div class="dish-rank">{{ $index + 1 }}</div>
                      <div class="dish-info">
                        <div class="dish-name">{{ dish.name }}</div>
                        <div class="dish-stats">
                          <span class="orders">{{ dish.orders }} orders</span>
                          <span class="revenue">₹{{ formatNumber(dish.revenue) }}</span>
                        </div>
                      </div>
                      <div class="dish-progress">
                        <div class="progress-bar">
                          <div class="progress-fill" 
                               [style.width]="(dish.orders / getMaxDishOrders()) * 100 + '%'">
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Business Insights -->
          <div class="col-lg-6">
            <div class="performance-card">
              <div class="card-header">
                <h5>Business Insights</h5>
                <button class="btn btn-sm btn-outline-primary" (click)="generateInsights()">
                  Generate AI Insights
                </button>
              </div>
              <div class="card-body">
                <div class="insights-list">
                  <div class="insight-item success">
                    <div class="insight-icon">
                      <i class="bi bi-trending-up"></i>
                    </div>
                    <div class="insight-content">
                      <div class="insight-title">Revenue Growth</div>
                      <div class="insight-description">
                        Revenue increased by {{ analytics().revenue.growth }}% compared to last period
                      </div>
                    </div>
                  </div>

                  <div class="insight-item info">
                    <div class="insight-icon">
                      <i class="bi bi-clock"></i>
                    </div>
                    <div class="insight-content">
                      <div class="insight-title">Peak Hours</div>
                      <div class="insight-description">
                        Highest order volume between 12 PM - 2 PM and 7 PM - 9 PM
                      </div>
                    </div>
                  </div>

                  <div class="insight-item warning">
                    <div class="insight-icon">
                      <i class="bi bi-exclamation-triangle"></i>
                    </div>
                    <div class="insight-content">
                      <div class="insight-title">Delivery Time Alert</div>
                      <div class="insight-description">
                        Average delivery time increased by 5 minutes during peak hours
                      </div>
                    </div>
                  </div>

                  <div class="insight-item info">
                    <div class="insight-icon">
                      <i class="bi bi-people"></i>
                    </div>
                    <div class="insight-content">
                      <div class="insight-title">Customer Retention</div>
                      <div class="insight-description">
                        {{ analytics().customers.retention }}% of customers ordered multiple times this month
                      </div>
                    </div>
                  </div>

                  <div class="insight-item success">
                    <div class="insight-icon">
                      <i class="bi bi-star"></i>
                    </div>
                    <div class="insight-content">
                      <div class="insight-title">Top Category</div>
                      <div class="insight-description">
                        {{ analytics().popular.categories[0]?.name }} is the most popular category
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription Analytics -->
      <div class="subscription-section">
        <div class="section-header">
          <h5>Subscription Analytics</h5>
        </div>
        <div class="row g-3">
          <div class="col-lg-3 col-md-6">
            <div class="subscription-metric">
              <div class="metric-icon">
                <i class="bi bi-arrow-repeat"></i>
              </div>
              <div class="metric-value">{{ analytics().subscriptions.active }}</div>
              <div class="metric-label">Active Subscriptions</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="subscription-metric">
              <div class="metric-icon">
                <i class="bi bi-graph-down"></i>
              </div>
              <div class="metric-value">{{ analytics().subscriptions.churnRate }}%</div>
              <div class="metric-label">Churn Rate</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="subscription-metric">
              <div class="metric-icon">
                <i class="bi bi-calendar-month"></i>
              </div>
              <div class="metric-value">₹{{ formatNumber(analytics().subscriptions.monthlyRevenue) }}</div>
              <div class="metric-label">Monthly Recurring Revenue</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="subscription-metric">
              <div class="metric-icon">
                <i class="bi bi-calculator"></i>
              </div>
              <div class="metric-value">₹{{ calculateLTV() }}</div>
              <div class="metric-label">Customer LTV</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private adminService = inject(AdminService);

  // Data signals
  analytics = signal<AnalyticsData>({
    revenue: { total: 0, growth: 0, dailyData: [] },
    orders: { total: 0, growth: 0, hourlyData: [] },
    customers: { total: 0, new: 0, retention: 0 },
    popular: { dishes: [], categories: [] },
    delivery: { averageTime: 0, onTimeRate: 0, customerSatisfaction: 0 },
    subscriptions: { active: 0, churnRate: 0, monthlyRevenue: 0 }
  });

  // UI state
  selectedPeriod = 'month';
  revenueChartType: 'line' | 'bar' = 'line';

  ngOnInit() {
    this.loadAnalytics();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalytics() {
    // Mock analytics data
    const mockData: AnalyticsData = {
      revenue: {
        total: 245000,
        growth: 12.5,
        dailyData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 15000) + 5000
        }))
      },
      orders: {
        total: 1250,
        growth: 8.3,
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 50) + 10
        }))
      },
      customers: {
        total: 850,
        new: 45,
        retention: 78
      },
      popular: {
        dishes: [
          { name: 'Butter Chicken Thali', orders: 156, revenue: 31200 },
          { name: 'Paneer Tikka Masala', orders: 142, revenue: 28400 },
          { name: 'Biryani Special', orders: 138, revenue: 34500 },
          { name: 'Dal Tadka Combo', orders: 125, revenue: 18750 },
          { name: 'Chole Bhature', orders: 118, revenue: 23600 },
          { name: 'Masala Dosa', orders: 112, revenue: 16800 },
          { name: 'Rajma Rice', orders: 105, revenue: 15750 },
          { name: 'Aloo Gobi', orders: 98, revenue: 14700 },
          { name: 'Sambar Rice', orders: 92, revenue: 13800 },
          { name: 'Kadai Paneer', orders: 87, revenue: 17400 }
        ],
        categories: [
          { name: 'North Indian', percentage: 45 },
          { name: 'South Indian', percentage: 25 },
          { name: 'Chinese', percentage: 15 },
          { name: 'Continental', percentage: 10 },
          { name: 'Desserts', percentage: 5 }
        ]
      },
      delivery: {
        averageTime: 28,
        onTimeRate: 92,
        customerSatisfaction: 4.3
      },
      subscriptions: {
        active: 425,
        churnRate: 3.2,
        monthlyRevenue: 127500
      }
    };

    this.analytics.set(mockData);
  }

  refreshData() {
    this.loadAnalytics();
  }

  exportReport() {
    // Implement report export functionality
    console.log('Exporting analytics report for period:', this.selectedPeriod);
  }

  generateInsights() {
    // Implement AI insights generation
    console.log('Generating AI insights...');
  }

  viewAllDishes() {
    // Navigate to detailed dish analytics
    console.log('Viewing all dish analytics');
  }

  // Helper methods
  getTrendClass(growth: number): string {
    return growth >= 0 ? 'trend-up' : 'trend-down';
  }

  getTrendIcon(growth: number): string {
    return growth >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }

  getMaxRevenue(): number {
    const data = this.analytics().revenue.dailyData;
    return Math.max(...data.map(d => d.amount));
  }

  getMaxOrders(): number {
    const data = this.analytics().orders.hourlyData;
    return Math.max(...data.map(d => d.count));
  }

  getMaxDishOrders(): number {
    const dishes = this.analytics().popular.dishes;
    return Math.max(...dishes.map(d => d.orders));
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'North Indian': '#FF6B6B',
      'South Indian': '#4ECDC4',
      'Chinese': '#45B7D1',
      'Continental': '#96CEB4',
      'Desserts': '#FFEAA7'
    };
    return colors[category] || '#95A5A6';
  }

  formatNumber(num: number): string {
    if (num >= 100000) {
      return (num / 100000).toFixed(1) + 'L';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.getDate().toString();
  }

  calculateLTV(): string {
    const monthlyRevenue = this.analytics().subscriptions.monthlyRevenue;
    const activeSubscriptions = this.analytics().subscriptions.active;
    const avgLTV = (monthlyRevenue / activeSubscriptions) * 12; // Assume 12 months average lifetime
    return this.formatNumber(avgLTV);
  }

  // Expose Math for template
  Math = Math;
}