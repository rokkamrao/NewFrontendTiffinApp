import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeliveryService } from '../services/delivery.service';
import { DeliveryPartnerLoginRequest } from '../models/delivery-partner.model';

@Component({
  selector: 'app-delivery-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="delivery-login min-vh-100 d-flex align-items-center justify-content-center" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-5">
            <div class="card shadow-lg border-0">
              <div class="card-body p-5">
                <div class="text-center mb-4">
                  <div class="mb-3">
                    <i class="bi bi-truck" style="font-size: 4rem; color: var(--color-healthy-green);"></i>
                  </div>
                  <h3 class="fw-bold">Delivery Partner Login</h3>
                  <p class="text-muted">Sign in to manage your deliveries</p>
                </div>

                <form (submit)="login($event)">
                  <div class="mb-3">
                    <label class="form-label">Phone Number</label>
                    <div class="input-group">
                      <span class="input-group-text">+91</span>
                      <input 
                        type="tel" 
                        class="form-control" 
                        [(ngModel)]="loginRequest.phone"
                        name="phone"
                        placeholder="Enter 10-digit mobile number"
                        pattern="[0-9]{10}"
                        maxlength="10"
                        required>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label">Password</label>
                    <div class="input-group">
                      <input 
                        [type]="showPassword ? 'text' : 'password'" 
                        class="form-control" 
                        [(ngModel)]="loginRequest.password"
                        name="password"
                        placeholder="Enter your password"
                        required>
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary"
                        (click)="togglePassword()">
                        <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                    </div>
                  </div>

                  @if (error) {
                    <div class="alert alert-danger">
                      <i class="bi bi-exclamation-circle me-2"></i>
                      {{ error }}
                    </div>
                  }

                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 py-2 mb-3"
                    [disabled]="!loginRequest.phone || !loginRequest.password || isLoading">
                    @if (isLoading) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Signing In...
                    } @else {
                      <i class="bi bi-box-arrow-in-right me-2"></i>
                      Sign In
                    }
                  </button>

                  <div class="text-center">
                    <small class="text-muted">
                      Need help? Contact: 
                      <a href="tel:+919876543210" class="text-decoration-none">+91 98765 43210</a>
                    </small>
                  </div>
                </form>

                <div class="mt-4 p-3 bg-light rounded">
                  <small class="text-muted">
                    <strong>Demo Credentials:</strong><br>
                    Phone: 9876543210<br>
                    Password: delivery123
                  </small>
                </div>

                <!-- Online Status Indicator -->
                @if (isOnline !== null) {
                  <div class="mt-3 text-center">
                    <span class="badge" [class]="isOnline ? 'bg-success' : 'bg-secondary'">
                      <i [class]="isOnline ? 'bi bi-wifi' : 'bi bi-wifi-off'" class="me-1"></i>
                      {{ isOnline ? 'Online' : 'Offline' }}
                    </span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .delivery-login {
      background-attachment: fixed;
    }
    
    .input-group .btn-outline-secondary {
      border-left: none;
    }
    
    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }
    
    .badge {
      font-size: 0.8rem;
    }
  `]
})
export class DeliveryLoginComponent {
  loginRequest: DeliveryPartnerLoginRequest = {
    phone: '',
    password: ''
  };
  
  error = '';
  isLoading = false;
  showPassword = false;
  isOnline: boolean | null = null;

  constructor(
    private router: Router,
    private deliveryService: DeliveryService
  ) {
    // Check if already logged in
    if (this.deliveryService.isLoggedIn()) {
      this.router.navigate(['/delivery/dashboard']);
      return;
    }

    // Check online status
    this.checkOnlineStatus();
  }

  private checkOnlineStatus(): void {
    // Check if we're in a browser environment
    if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOnline = true;
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    } else {
      // Default to online during SSR
      this.isOnline = true;
    }
  }

  login(event: Event): void {
    event.preventDefault();
    
    if (!this.validateInput()) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.deliveryService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          console.log('[DeliveryLogin] Login successful:', response.partner?.name);
          this.router.navigate(['/delivery/dashboard']);
        } else {
          this.error = response.message || 'Login failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('[DeliveryLogin] Login error:', error);
        this.error = error.message || 'An error occurred during login. Please try again.';
      }
    });
  }

  private validateInput(): boolean {
    if (!this.loginRequest.phone) {
      this.error = 'Please enter your phone number';
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(this.loginRequest.phone)) {
      this.error = 'Please enter a valid 10-digit phone number starting with 6-9';
      return false;
    }

    if (!this.loginRequest.password) {
      this.error = 'Please enter your password';
      return false;
    }

    if (this.loginRequest.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return false;
    }

    this.error = '';
    return true;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onInputChange(): void {
    if (this.error) {
      this.error = '';
    }
  }
}
