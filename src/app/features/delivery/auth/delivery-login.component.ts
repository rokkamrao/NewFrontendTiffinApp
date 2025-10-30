import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
                        [(ngModel)]="phone"
                        name="phone"
                        placeholder="Enter 10-digit mobile number"
                        pattern="[0-9]{10}"
                        required>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label">Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="password"
                      name="password"
                      placeholder="Enter your password"
                      required>
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 py-2 mb-3"
                    [disabled]="!phone || !password">
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </button>

                  <div class="text-center">
                    <small class="text-muted">
                      Need help? Contact: 
                      <a href="tel:+919876543210" class="text-decoration-none">+91 98765 43210</a>
                    </small>
                  </div>
                </form>

                <div *ngIf="error" class="alert alert-danger mt-3">
                  <i class="bi bi-exclamation-circle me-2"></i>
                  {{ error }}
                </div>

                <div class="mt-4 p-3 bg-light rounded">
                  <small class="text-muted">
                    <strong>Demo Credentials:</strong><br>
                    Phone: 9876543210<br>
                    Password: delivery123
                  </small>
                </div>
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
  `]
})
export class DeliveryLoginComponent {
  phone = '';
  password = '';
  error = '';

  constructor(private router: Router) {
    // Check if already logged in
    const isDeliveryLoggedIn = localStorage.getItem('deliveryLoggedIn');
    if (isDeliveryLoggedIn === 'true') {
      this.router.navigate(['/delivery/dashboard']);
    }
  }

  login(event: Event) {
    event.preventDefault();
    this.error = '';

    // Demo login validation
    if (this.phone === '9876543210' && this.password === 'delivery123') {
      const deliveryPerson = {
        id: 'DEL001',
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        vehicleNumber: 'KA-01-AB-1234',
        rating: 4.8,
        deliveriesCompleted: 1250
      };

      localStorage.setItem('deliveryLoggedIn', 'true');
      localStorage.setItem('deliveryPerson', JSON.stringify(deliveryPerson));
      
      this.router.navigate(['/delivery/dashboard']);
    } else {
      this.error = 'Invalid phone number or password';
    }
  }
}
