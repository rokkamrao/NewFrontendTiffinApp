import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminService, MenuItem, MenuCategory } from '../services/admin-real-api.service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="menu-management">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Menu Management</h1>
          <p class="page-subtitle">Manage dishes, categories, and pricing</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-primary" (click)="refreshMenu()">
            <i class="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
          <button class="btn btn-success" (click)="openCategoryModal()">
            <i class="bi bi-plus-lg"></i>
            Add Category
          </button>
          <button class="btn btn-primary" (click)="openDishModal()">
            <i class="bi bi-plus-lg"></i>
            Add Dish
          </button>
        </div>
      </div>

      <!-- Menu Statistics -->
      <div class="menu-stats">
        <div class="row g-3">
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="stat-icon dishes">
                <i class="bi bi-bowl"></i>
              </div>
              <div class="stat-content">
                <h3>{{ menuItems().length }}</h3>
                <p>Total Dishes</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="stat-icon active">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="stat-content">
                <h3>{{ activeItems() }}</h3>
                <p>Active Items</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="stat-icon categories">
                <i class="bi bi-grid"></i>
              </div>
              <div class="stat-content">
                <h3>{{ categories().length }}</h3>
                <p>Categories</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="stat-icon revenue">
                <i class="bi bi-currency-rupee"></i>
              </div>
              <div class="stat-content">
                <h3>{{ averagePrice() }}</h3>
                <p>Avg Price</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input type="text" 
                     class="form-control" 
                     placeholder="Search dishes..."
                     [(ngModel)]="searchTerm"
                     (input)="applyFilters()">
            </div>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="categoryFilter" (change)="applyFilters()">
              <option value="">All Categories</option>
              @for (category of categories(); track category.id) {
                <option [value]="category.name">{{ category.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="dietaryFilter" (change)="applyFilters()">
              <option value="">All Types</option>
              <option value="veg">Vegetarian</option>
              <option value="non_veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="jain">Jain</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" (click)="clearFilters()">
              <i class="bi bi-x-circle"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Category Management -->
      <div class="categories-section">
        <div class="section-header">
          <h5>Categories</h5>
          <button class="btn btn-sm btn-outline-primary" (click)="toggleCategoryEdit()">
            <i class="bi bi-pencil"></i>
            {{ editingCategories ? 'Done' : 'Edit' }}
          </button>
        </div>
        <div class="categories-grid">
          @for (category of categories(); track category.id) {
            <div class="category-card" [class.editing]="editingCategories">
              <div class="category-image">
                <img [src]="category.image || '/assets/images/default-category.jpg'" 
                     [alt]="category.name"
                     (error)="onImageError($event)">
              </div>
              <div class="category-content">
                <h6>{{ category.name }}</h6>
                <p>{{ category.description }}</p>
                <div class="category-stats">
                  <span class="item-count">{{ getItemCountByCategory(category.name) }} items</span>
                  <span class="category-status" [class]="'status-' + category.status">
                    {{ category.status | titlecase }}
                  </span>
                </div>
              </div>
              @if (editingCategories) {
                <div class="category-actions">
                  <button class="btn btn-sm btn-outline-primary" (click)="editCategory(category)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteCategory(category.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Menu Items -->
      <div class="menu-items-section">
        <div class="section-header">
          <h5>Menu Items ({{ filteredItems().length }})</h5>
          <div class="view-controls">
            <div class="btn-group" role="group">
              <button class="btn btn-sm" 
                      [class]="viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'"
                      (click)="viewMode = 'grid'">
                <i class="bi bi-grid"></i>
              </button>
              <button class="btn btn-sm" 
                      [class]="viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'"
                      (click)="viewMode = 'list'">
                <i class="bi bi-list"></i>
              </button>
            </div>
          </div>
        </div>

        @if (viewMode === 'grid') {
          <div class="menu-grid">
            @for (item of filteredItems(); track item.id) {
              <div class="menu-item-card">
                <div class="item-image">
                  <img [src]="item.imageUrl || '/assets/images/default-dish.jpg'" 
                       [alt]="item.name"
                       (error)="onImageError($event)">
                  <div class="image-overlay">
                    <button class="btn btn-sm btn-light" (click)="editItem(item)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-light" (click)="duplicateItem(item)">
                      <i class="bi bi-copy"></i>
                    </button>
                  </div>
                  <div class="item-badges">
                    <span class="dietary-badge" [class]="'dietary-' + item.dietType">
                      {{ getDietaryIcon(item.dietType) }}
                    </span>
                    @if (item.isSpicy) {
                      <span class="spicy-badge">🌶️</span>
                    }
                  </div>
                </div>
                <div class="item-content">
                  <div class="item-header">
                    <h6>{{ item.name }}</h6>
                    <div class="item-status">
                      <label class="switch">
                        <input type="checkbox" 
                               [checked]="item.available"
                               (change)="toggleItemStatus(item.id, $event)">
                        <span class="slider"></span>
                      </label>
                    </div>
                  </div>
                  <p class="item-description">{{ item.description }}</p>
                  <div class="item-details">
                    <div class="price-section">
                      <span class="current-price">₹{{ item.price }}</span>
                      @if (item.originalPrice && item.originalPrice > item.price) {
                        <span class="original-price">₹{{ item.originalPrice }}</span>
                        <span class="discount">{{ getDiscountPercentage(item) }}% off</span>
                      }
                    </div>
                    <div class="item-meta">
                      <span class="prep-time">
                        <i class="bi bi-clock"></i>
                        {{ item.preparationTime }}min
                      </span>
                      <span class="category-name">{{ getCategoryName(item.category) }}</span>
                    </div>
                  </div>
                  @if (!item.available) {
                    <div class="stock-alert">
                      <i class="bi bi-exclamation-triangle"></i>
                      Unavailable
                    </div>
                  }
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <i class="bi bi-inbox display-1 text-muted"></i>
                <h5 class="mt-3">No menu items found</h5>
                <p class="text-muted">Try adjusting your search or filter criteria</p>
                <button class="btn btn-primary" (click)="openDishModal()">Add First Dish</button>
              </div>
            }
          </div>
        } @else {
          <div class="menu-table-container">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Prep Time</th>
                    <th>Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of filteredItems(); track item.id) {
                    <tr>
                      <td>
                        <div class="item-info">
                          <img [src]="item.imageUrl || '/assets/images/default-dish.jpg'" 
                               [alt]="item.name"
                               class="item-thumbnail"
                               (error)="onImageError($event)">
                          <div class="item-details">
                            <div class="item-name">
                              {{ item.name }}
                              <span class="dietary-indicator" [class]="'dietary-' + item.dietType">
                                {{ getDietaryIcon(item.dietType) }}
                              </span>
                            </div>
                            <div class="item-description">{{ item.description | slice:0:50 }}...</div>
                          </div>
                        </div>
                      </td>
                      <td>{{ getCategoryName(item.category) }}</td>
                      <td>
                        <div class="price-info">
                          <span class="current-price">₹{{ item.price }}</span>
                          @if (item.originalPrice && item.originalPrice > item.price) {
                            <span class="original-price">₹{{ item.originalPrice }}</span>
                          }
                        </div>
                      </td>
                      <td>
                        <span class="status-badge" [class]="'status-' + (item.available ? 'active' : 'inactive')">
                          {{ item.available ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>{{ item.preparationTime }}min</td>
                      <td>{{ item.orderCount || 0 }}</td>
                      <td>
                        <div class="action-buttons">
                          <button class="btn btn-sm btn-outline-primary" 
                                  (click)="editItem(item)"
                                  title="Edit">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-info" 
                                  (click)="duplicateItem(item)"
                                  title="Duplicate">
                            <i class="bi bi-copy"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" 
                                  (click)="deleteItem(item.id)"
                                  title="Delete">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center py-5">
                        <div class="empty-state">
                          <i class="bi bi-inbox display-1 text-muted"></i>
                          <h5 class="mt-3">No menu items found</h5>
                          <p class="text-muted">Try adjusting your search or filter criteria</p>
                          <button class="btn btn-primary" (click)="openDishModal()">Add First Dish</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class MenuManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private adminService = inject(AdminService);
  private router = inject(Router);

  // Data signals
  menuItems = signal<MenuItem[]>([]);
  categories = signal<MenuCategory[]>([]);
  
  // UI state
  editingCategories = false;
  viewMode: 'grid' | 'list' = 'grid';
  
  // Filters
  searchTerm = '';
  categoryFilter = '';
  statusFilter = '';
  dietaryFilter = '';
  
  // Computed properties
  filteredItems = computed(() => {
    let items = this.menuItems();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }
    
    if (this.categoryFilter) {
      items = items.filter(item => item.category === this.categoryFilter);
    }
    
    if (this.statusFilter) {
      if (this.statusFilter === 'active') {
        items = items.filter(item => item.available);
      } else if (this.statusFilter === 'inactive') {
        items = items.filter(item => !item.available);
      }
    }
    
    if (this.dietaryFilter) {
      items = items.filter(item => item.dietType === this.dietaryFilter);
    }
    
    return items;
  });
  
  activeItems = computed(() => 
    this.menuItems().filter(item => item.available).length
  );
  
  averagePrice = computed(() => {
    const items = this.menuItems();
    if (items.length === 0) return '₹0';
    const avg = items.reduce((sum, item) => sum + item.price, 0) / items.length;
    return `₹${Math.round(avg)}`;
  });

  ngOnInit() {
    this.loadMenuData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMenuData() {
    // Load menu items
    this.adminService.getMenuItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.menuItems.set(items);
      });
    
    // Load categories
    this.adminService.getMenuCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories.set(categories);
      });
  }

  refreshMenu() {
    this.loadMenuData();
  }

  applyFilters() {
    // Filters are applied automatically via computed properties
  }

  clearFilters() {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.statusFilter = '';
    this.dietaryFilter = '';
  }

  toggleCategoryEdit() {
    this.editingCategories = !this.editingCategories;
  }

  openCategoryModal() {
    // Navigate to category creation form
    this.router.navigate(['/admin/menu/categories/new']);
  }

  openDishModal() {
    // Navigate to dish creation form
    this.router.navigate(['/admin/menu/items/new']);
  }

  editCategory(category: MenuCategory) {
    this.router.navigate(['/admin/menu/categories', category.id, 'edit']);
  }

  deleteCategory(categoryId: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.adminService.deleteMenuCategory(categoryId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadMenuData();
        });
    }
  }

  editItem(item: MenuItem) {
    this.router.navigate(['/admin/menu/items', item.id, 'edit']);
  }

  duplicateItem(item: MenuItem) {
    const duplicatedItem = {
      ...item,
      id: undefined,
      name: `${item.name} (Copy)`,
      available: false
    };
    
    this.adminService.createMenuItem(duplicatedItem)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMenuData();
      });
  }

  deleteItem(itemId: string) {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.adminService.deleteMenuItem(itemId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadMenuData();
        });
    }
  }

  toggleItemStatus(itemId: string, event: any) {
    const isAvailable = event.target.checked;
    
    this.adminService.updateMenuItem(itemId, { available: isAvailable })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Update local state
        const items = this.menuItems();
        const updatedItems = items.map(item => 
          item.id === itemId ? { ...item, available: isAvailable } : item
        );
        this.menuItems.set(updatedItems);
      });
  }

  getItemCountByCategory(categoryName: string): number {
    return this.menuItems().filter(item => item.category === categoryName).length;
  }

  getCategoryName(categoryName: string): string {
    return categoryName || 'Unknown';
  }

  getDietaryIcon(type: string): string {
    const icons: { [key: string]: string } = {
      veg: '🟢',
      non_veg: '🔴',
      vegan: '🌱',
      jain: '🟡'
    };
    return icons[type] || '⚪';
  }

  getDiscountPercentage(item: MenuItem): number {
    if (!item.originalPrice || item.originalPrice <= item.price) return 0;
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/default-dish.jpg';
  }
}