import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../core/services/menu.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Dish } from '../../core/models/dish.model';

@Component({
  selector: 'app-integration-test',
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">TiffinApp Integration Tests</h1>
      
      <!-- Menu API Test -->
      <div class="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 class="text-xl font-semibold mb-4">1. Menu API Test</h3>
        <button 
          (click)="testMenuAPI()" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
          Test Menu API
        </button>
        <div class="mt-4 p-3 rounded" [ngClass]="getStatusClass(menuStatus)">
          {{ menuMessage }}
        </div>
        <pre *ngIf="menuData" class="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">{{ menuData }}</pre>
      </div>

      <!-- Authentication Test -->
      <div class="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 class="text-xl font-semibold mb-4">2. Authentication Test</h3>
        <button 
          (click)="testAuth()" 
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2">
          Test Login (9999999999 / test123)
        </button>
        <button 
          (click)="testLogout()" 
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Test Logout
        </button>
        <div class="mt-4 p-3 rounded" [ngClass]="getStatusClass(authStatus)">
          {{ authMessage }}
        </div>
        <div *ngIf="userInfo" class="mt-2 bg-gray-100 p-3 rounded">
          <strong>User Info:</strong><br>
          Name: {{ userInfo.name || 'N/A' }}<br>
          Phone: {{ userInfo.phone }}<br>
          Email: {{ userInfo.email || 'N/A' }}<br>
          Role: {{ userInfo.role }}
        </div>
        <pre *ngIf="authData" class="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">{{ authData }}</pre>
      </div>

      <!-- Cart Test -->
      <div class="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 class="text-xl font-semibold mb-4">3. Cart Test</h3>
        <button 
          (click)="testCart()" 
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mr-2">
          Test Add to Cart
        </button>
        <button 
          (click)="testCartClear()" 
          class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
          Clear Cart
        </button>
        <div class="mt-4 p-3 rounded" [ngClass]="getStatusClass(cartStatus)">
          {{ cartMessage }}
        </div>
        <pre *ngIf="cartData" class="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">{{ cartData }}</pre>
      </div>

      <!-- Admin Test -->
      <div class="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 class="text-xl font-semibold mb-4">4. Admin Authentication Test</h3>
        <button 
          (click)="testAdminAuth()" 
          class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          Test Admin Login (admin@tiffin.app / admin123)
        </button>
        <div class="mt-4 p-3 rounded" [ngClass]="getStatusClass(adminStatus)">
          {{ adminMessage }}
        </div>
        <pre *ngIf="adminData" class="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">{{ adminData }}</pre>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class IntegrationTestComponent implements OnInit {
  menuStatus: 'pending' | 'success' | 'error' = 'pending';
  menuMessage = 'Click to test...';
  menuData = '';

  authStatus: 'pending' | 'success' | 'error' = 'pending';
  authMessage = 'Click to test...';
  authData = '';
  userInfo: any = null;

  cartStatus: 'pending' | 'success' | 'error' = 'pending';
  cartMessage = 'Click to test...';
  cartData = '';

  adminStatus: 'pending' | 'success' | 'error' = 'pending';
  adminMessage = 'Click to test...';
  adminData = '';

  dishes: Dish[] = [];

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Auto-run menu test on component init
    setTimeout(() => {
      this.testMenuAPI();
    }, 1000);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border border-green-300';
      case 'error': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    }
  }

  async testMenuAPI() {
    try {
      this.menuStatus = 'pending';
      this.menuMessage = 'Loading dishes from API...';
      
      this.menuService.list().subscribe({
        next: (dishes) => {
          this.dishes = dishes;
          this.menuStatus = 'success';
          this.menuMessage = `✅ SUCCESS: Loaded ${dishes.length} dishes from backend`;
          this.menuData = JSON.stringify(dishes.slice(0, 2), null, 2);
          console.log('Menu API Test - Dishes loaded:', dishes);
        },
        error: (error) => {
          this.menuStatus = 'error';
          this.menuMessage = `❌ ERROR: ${error.message}`;
          this.menuData = JSON.stringify(error, null, 2);
          console.error('Menu API Test - Error:', error);
        }
      });
    } catch (error) {
      this.menuStatus = 'error';
      this.menuMessage = `❌ ERROR: ${(error as Error).message}`;
      console.error('Menu API Test - Exception:', error);
    }
  }

  async testAuth() {
    try {
      this.authStatus = 'pending';
      this.authMessage = 'Testing authentication...';
      
      this.authService.login('9999999999', 'test123').subscribe({
        next: (response) => {
          this.authData = JSON.stringify(response, null, 2);
          
          if (response.success && response.user) {
            this.authStatus = 'success';
            this.authMessage = '✅ SUCCESS: Authentication successful';
            this.userInfo = response.user;
            console.log('Auth Test - Login successful:', response);
          } else {
            this.authStatus = 'error';
            this.authMessage = `❌ ERROR: ${response.message}`;
            console.error('Auth Test - Login failed:', response);
          }
        },
        error: (error) => {
          this.authStatus = 'error';
          this.authMessage = `❌ ERROR: ${error.message}`;
          this.authData = JSON.stringify(error, null, 2);
          console.error('Auth Test - Error:', error);
        }
      });
    } catch (error) {
      this.authStatus = 'error';
      this.authMessage = `❌ ERROR: ${(error as Error).message}`;
      console.error('Auth Test - Exception:', error);
    }
  }

  async testLogout() {
    try {
      this.authStatus = 'pending';
      this.authMessage = 'Logging out...';
      
      this.authService.logout();
      this.authStatus = 'success';
      this.authMessage = '✅ SUCCESS: Logout successful';
      this.userInfo = null;
      this.authData = '';
      console.log('Auth Test - Logout successful');
    } catch (error) {
      this.authStatus = 'error';
      this.authMessage = `❌ ERROR: ${(error as Error).message}`;
      console.error('Auth Test - Logout error:', error);
    }
  }

  async testCart() {
    try {
      this.cartStatus = 'pending';
      this.cartMessage = 'Testing cart functionality...';
      
      if (this.dishes.length === 0) {
        this.cartStatus = 'error';
        this.cartMessage = '❌ ERROR: Load dishes first';
        return;
      }

      const testDish = this.dishes[0];
      this.cartService.add({ dish: testDish, qty: 2 });
      
      const items = this.cartService.getItems();
      const total = this.cartService.getTotal();
      
      this.cartStatus = 'success';
      this.cartMessage = `✅ SUCCESS: Added ${testDish.name} to cart`;
      this.cartData = JSON.stringify({
        cartItems: items,
        totalItems: items.reduce((sum, item) => sum + item.qty, 0),
        totalAmount: total
      }, null, 2);
      console.log('Cart Test - Items added:', items);
    } catch (error) {
      this.cartStatus = 'error';
      this.cartMessage = `❌ ERROR: ${(error as Error).message}`;
      console.error('Cart Test - Error:', error);
    }
  }

  async testCartClear() {
    try {
      this.cartService.clear();
      this.cartStatus = 'success';
      this.cartMessage = '✅ SUCCESS: Cart cleared';
      this.cartData = '';
      console.log('Cart Test - Cart cleared');
    } catch (error) {
      this.cartStatus = 'error';
      this.cartMessage = `❌ ERROR: ${(error as Error).message}`;
      console.error('Cart Test - Clear error:', error);
    }
  }

  async testAdminAuth() {
    try {
      this.adminStatus = 'pending';
      this.adminMessage = 'Testing admin authentication...';
      
      this.authService.login('admin@tiffin.app', 'admin123').subscribe({
        next: (response) => {
          this.adminData = JSON.stringify(response, null, 2);
          
          if (response.success && response.user && response.user.role === 'ADMIN') {
            this.adminStatus = 'success';
            this.adminMessage = '✅ SUCCESS: Admin authentication successful';
            console.log('Admin Test - Login successful:', response);
          } else {
            this.adminStatus = 'error';
            this.adminMessage = `❌ ERROR: ${response.message || 'Admin authentication failed'}`;
            console.error('Admin Test - Login failed:', response);
          }
        },
        error: (error) => {
          this.adminStatus = 'error';
          this.adminMessage = `❌ ERROR: ${error.message}`;
          this.adminData = JSON.stringify(error, null, 2);
          console.error('Admin Test - Error:', error);
        }
      });
    } catch (error) {
      this.adminStatus = 'error';
      this.adminMessage = `❌ ERROR: ${(error as Error).message}`;
      console.error('Admin Test - Exception:', error);
    }
  }
}