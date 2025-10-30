import { Component, PLATFORM_ID, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  emailOrPhone: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  returnUrl: string = '/home'; // Public for template access
  private platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  validateInput(): boolean {
    // Check if it's an email or phone number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    
    if (!this.emailOrPhone) {
      this.errorMessage = 'Please enter your email or phone number';
      return false;
    }
    
    if (!emailRegex.test(this.emailOrPhone) && !phoneRegex.test(this.emailOrPhone)) {
      this.errorMessage = 'Please enter a valid email or 10-digit phone number';
      return false;
    }

    if (!this.password) {
      this.errorMessage = 'Please enter your password';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return false;
    }
    
    this.errorMessage = '';
    return true;
  }

  async login() {
    if (!this.validateInput()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Determine if input is phone or email
    const phoneRegex = /^[6-9]\d{9}$/;
    const isPhone = phoneRegex.test(this.emailOrPhone);
    
    const loginRequest = {
      phone: isPhone ? this.emailOrPhone : '',
      email: !isPhone ? this.emailOrPhone : '',
      password: this.password
    };

    this.authService.login(loginRequest as any).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          console.log('[Login] Login successful, redirecting to:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = response.message || 'Invalid credentials. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('[Login] Login error:', error);
        
        // Handle different types of errors
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid email/phone or password. Please try again.';
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle() {
    // Implement Google OAuth login
    console.log('Google login clicked');
    alert('Google Sign-in will be integrated with Firebase/OAuth');
  }

  onInputChange() {
    // Clear error when user types
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  navigateToSignup() {
    // Pass return URL to signup page if exists
    if (this.returnUrl !== '/home') {
      this.router.navigate(['/auth/signup'], {
        queryParams: { returnUrl: this.returnUrl }
      });
    } else {
      this.router.navigate(['/auth/signup']);
    }
  }

  navigateToAdminLogin() {
    this.router.navigate(['/auth/admin-login']);
  }

  navigateToDeliveryLogin() {
    this.router.navigate(['/auth/delivery-login']);
  }
}
