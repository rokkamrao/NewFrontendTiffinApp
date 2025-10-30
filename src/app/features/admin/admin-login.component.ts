import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">👨‍💼</div>
          <h1>Admin Login</h1>
          <p>Access the admin dashboard</p>
        </div>

        <form (submit)="login($event)" class="login-form">
          <div class="input-group">
            <label>Email or Phone</label>
            <input 
              type="text" 
              [(ngModel)]="emailOrPhone"
              name="emailOrPhone"
              placeholder="Enter admin email or phone"
              required
              autocomplete="username">
          </div>

          <div class="input-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                [(ngModel)]="password"
                name="password"
                placeholder="Enter admin password"
                required
                autocomplete="current-password">
              <button 
                type="button"
                class="toggle-password"
                (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            ⚠️ {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="btn-login"
            [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Sign In as Admin</span>
          </button>

          <div class="divider">
            <span>Not an admin?</span>
            <a (click)="navigateToUserLogin()">User Login</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 100%;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    @media (min-width: 576px) {
      .login-card {
        max-width: 500px;
      }
    }

    @media (min-width: 768px) {
      .login-card {
        max-width: 600px;
        padding: 50px;
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1e1e1e;
      margin-bottom: 8px;
    }

    p {
      color: #757575;
      font-size: 14px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    label {
      font-size: 14px;
      font-weight: 600;
      color: #1e1e1e;
    }

    input {
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s;
      outline: none;
    }

    input:focus {
      border-color: #4CAF50;
      box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
    }

    .password-wrapper {
      position: relative;
    }

    .password-wrapper input {
      padding-right: 48px;
      width: 100%;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      padding: 4px 8px;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-login {
      padding: 16px;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .divider {
      margin-top: 16px;
      text-align: center;
      font-size: 14px;
      color: #757575;
    }

    .divider a {
      color: #FF9800;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      margin-left: 8px;
    }

    .divider a:hover {
      color: #F57C00;
      text-decoration: underline;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .admin-login-container {
        padding: 16px;
      }

      .login-card {
        padding: 30px 20px;
        border-radius: 12px;
      }

      .logo {
        width: 70px;
        height: 70px;
        font-size: 35px;
      }

      h1 {
        font-size: 24px;
      }

      .btn-login {
        padding: 14px;
        font-size: 15px;
      }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px 16px;
      }

      h1 {
        font-size: 22px;
      }

      input {
        padding: 12px 14px;
        font-size: 15px;
      }
    }
  `]
})
export class AdminLoginComponent {
  emailOrPhone = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login(event: Event) {
    event.preventDefault();
    
    if (!this.emailOrPhone || !this.password) {
      this.errorMessage = 'Please enter email/phone and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Determine if input is phone or email
    const phoneRegex = /^[6-9]\d{9}$/;
    const isPhone = phoneRegex.test(this.emailOrPhone);
    
    const loginRequest = {
      phone: isPhone ? this.emailOrPhone : undefined,
      email: !isPhone ? this.emailOrPhone : undefined,
      password: this.password
    };

    this.authService.login(loginRequest as any).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Check if user has admin role from response
          console.log('[AdminLogin] Login response:', response);
          const isAdmin = response.role === 'ADMIN';
          
          if (isAdmin) {
            console.log('[AdminLogin] Admin authenticated, redirecting to dashboard');
            // Store admin role in localStorage for future checks
            localStorage.setItem('userRole', 'ADMIN');
            this.router.navigate(['/admin/dashboard']);
          } else {
            console.log('[AdminLogin] User role:', response.role);
            this.errorMessage = 'Access denied. Admin privileges required.';
            this.authService.logout();
          }
        } else {
          this.errorMessage = response.message || 'Invalid admin credentials';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('[AdminLogin] Login error:', error);
        
        // Handle different types of errors
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid credentials or insufficient privileges.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. Admin privileges required.';
        } else if (error.status === 404) {
          this.errorMessage = 'Login service not found. Please contact support.';
        } else if (error.status === 500) {
          this.errorMessage = error.error?.message || 'Server error occurred. Please try again later or contact support.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = `Login failed (Error ${error.status}). Please try again or contact support.`;
        }
      }
    });
  }

  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (e) {
      return null;
    }
  }

  navigateToUserLogin() {
    this.router.navigate(['/auth/login']);
  }
}
